// auth.d.ts
declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    email: string
    avatar: string
    username: string
    password?: string
    provider: 'github' | 'local'
    providerId?: number
  }
}

export { }
