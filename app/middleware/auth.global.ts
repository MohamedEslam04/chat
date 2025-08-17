export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  if (!loggedIn && !to.path.startsWith('/auth')) {
    return navigateTo('/auth')
  }
})
