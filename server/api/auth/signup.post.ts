import { useDrizzle } from '../../utils/drizzle'
import { hash } from 'bcrypt'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string }>(event)

  // Only require email and password for signup
  if (!body.email || !body.password) {
    return { success: false, message: 'Missing fields' }
  }

  // Check if user exists
  const existing = await useDrizzle().query.users.findFirst({
    where: (u, { eq }) => eq(u.email, body.email)
  })
  if (existing) {
    return { success: false, message: 'Email already registered' }
  }

  const hashedPassword = await hash(body.password, 10)

  // Use sensible defaults for name and username if not provided
  const name = body.email.split('@')[0]
  const username = body.email.split('@')[0]

  const newUser = await useDrizzle().insert(users).values({
    email: body.email,
    name,
    username,
    password: hashedPassword,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
    provider: 'local',
    providerId: null,
  }).returning()

  // Set user session
  await setUserSession(event, {
    user: {
      id: newUser[0].id,
      email: newUser[0].email,
      name: newUser[0].name,
      avatar: newUser[0].avatar,
      username: newUser[0].username,
      provider: 'local',
      providerId: null
    }
  })

  return { success: true }
})
