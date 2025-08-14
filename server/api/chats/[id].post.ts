// import { getEnabledAIModels, callAIModel } from '../../utils/aiModels'
// import { tables, eq, and } from '../../utils/drizzle'

defineRouteMeta({
  openAPI: {
    description: 'Chat with AI.',
    tags: ['ai']
  }
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const { id } = getRouterParams(event)
  const { model, messages } = await readBody(event)

  const db = await useDrizzle()

  const chat = await db.query.chats.findFirst({
    where: (chat, { eq }) => and(eq(chat.id, id as string), eq(chat.userId, session.user?.id || session.id)),
    with: {
      messages: true
    }
  })
  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  // Generate title if not exists
  if (!chat.title) {
    try {
      const enabledModels = getEnabledAIModels()
      const titleModel = enabledModels[0] // Use first available model for title generation

      if (titleModel) {
        const titleResponse = await callAIModel(
          titleModel.id,
          `Generate a short title (less than 30 characters) for this chat based on the user's message: "${chat.messages[0]!.content}". Return only the title without quotes or punctuation.`
        )

        const title = titleResponse.content || 'Untitled'
        setHeader(event, 'X-Chat-Title', title)
        await db.update(tables.chats).set({ title }).where(eq(tables.chats.id, id as string))
      }
    } catch (error) {
      console.error('Failed to generate title:', error)
      const title = 'Untitled'
      setHeader(event, 'X-Chat-Title', title)
      await db.update(tables.chats).set({ title }).where(eq(tables.chats.id, id as string))
    }
  }

  const lastMessage = messages[messages.length - 1]
  if (lastMessage.role === 'user' && messages.length > 1) {
    await db.insert(tables.messages).values({
      chatId: id as string,
      role: 'user',
      content: lastMessage.content
    })
  }

  // Create a readable stream for the response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Prepare conversation history
        const conversationHistory = messages.slice(0, -1).map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))

        // Call the selected AI model
        const response = await callAIModel(model, lastMessage.content, conversationHistory)

        if (response.error) {
          throw new Error(response.error)
        }

        const aiReply = response.content || 'I apologize, but I could not generate a response.'

        // Save the AI response to database
        await db.insert(tables.messages).values({
          chatId: chat.id,
          role: 'assistant',
          content: aiReply
        })

        // Stream the response word by word for a typing effect
        const encoder = new TextEncoder()
        const words = aiReply.split(' ')

        for (let i = 0; i < words.length; i++) {
          const word = words[i] + (i < words.length - 1 ? ' ' : '')
          const chunk = `0:"${word}"\n`
          controller.enqueue(encoder.encode(chunk))
          // Add a small delay between words for streaming effect
          await new Promise(resolve => setTimeout(resolve, 50))
        }

        // Send final chunk to indicate completion
        controller.enqueue(encoder.encode('d:\n'))
        controller.close()
      } catch (error) {
        console.error('AI API Error:', error)

        // Save error message to database
        const errorMessage = `I apologize, but I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`
        await db.insert(tables.messages).values({
          chatId: chat.id,
          role: 'assistant',
          content: errorMessage
        })

        const encoder = new TextEncoder()
        const chunk = `0:"${errorMessage}"\n`
        controller.enqueue(encoder.encode(chunk))
        controller.enqueue(encoder.encode('d:\n'))
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked'
    }
  })
})
