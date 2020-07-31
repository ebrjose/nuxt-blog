export default function (context) {
  console.log('[Middleware] CHECK AUTH')

  context.store.dispatch('initAuth', context.req)
}
