import { useDrizzle } from '../../utils/drizzle'
import { compare } from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string }>(event)

  if (!body.email || !body.password) {
    return { success: false, message: 'Missing fields' }
  }

  const user = await useDrizzle().query.users.findFirst({
    where: (u, { eq }) => eq(u.email, body.email)
  })

  if (!user) {
    return { success: false, message: 'User not found' }
  }

  // Check if user has a password (local authentication)
  if (!user.password) {
    return { success: false, message: 'Invalid authentication method' }
  }

  const isValid = await compare(body.password, user.password)
  if (!isValid) {
    return { success: false, message: 'Invalid credentials' }
  }

  // Set user session
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      username: user.username,
      provider: user.provider,
      providerId: user.providerId
    }
  })

  return { success: true }
})
