export default function (context) {
  console.log('[Middleware]  AUTH')
  if (!context.store.getters.isAuthenticated) {
    context.redirect('/admin/auth')
  }
}
