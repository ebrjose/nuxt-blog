import Cookie from 'js-cookie'

export const state = () => ({
  loadedPosts: [],
  token: null,
})

export const mutations = {
  setPosts(state, posts) {
    state.loadedPosts = posts
  },
  addPost(state, post) {
    state.loadedPosts.push(post)
  },
  editPost(state, editedPost) {
    const postIndex = state.loadedPosts.findIndex(
      (post) => post.id === editedPost.id
    )
    state.loadedPosts[postIndex] = editedPost
  },
  setToken(state, token) {
    state.token = token
  },
  clearToken(state) {
    state.token = null
  },
}

export const actions = {
  nuxtServerInit(vuexContext, context) {
    // return context.app.$axios    esto sirve pero prefiero la otra forma
    return this.$axios
      .get(`/posts.json`)
      .then((res) => {
        const postsArray = []
        for (const key in res.data) {
          postsArray.push({ ...res.data[key], id: key })
        }
        vuexContext.commit('setPosts', postsArray)
      })
      .catch((e) => context.error(e))
  },
  addPost(vuexContext, post) {
    const createdPost = {
      ...post,
      updatedDate: new Date(),
    }

    return this.$axios
      .$post(`/posts.json?auth=${vuexContext.state.token}`, createdPost)
      .then((res) => {
        vuexContext.commit('addPost', {
          ...createdPost,
          id: res.data.name,
        })
      })
      .catch((e) => console.log(e))
  },
  editPost(vuexContext, editedPost) {
    return this.$axios
      .$put(
        `/posts/${editedPost.id}.json?auth=${vuexContext.state.token}`,
        editedPost
      )
      .then((res) => {
        vuexContext.commit('editPost', editedPost)
      })
      .catch((e) => console.log(e))
  },
  setPosts(vuexContext, posts) {
    vuexContext.commit('setPosts', posts)
  },
  authenticateUser(vuexContext, authData) {
    let authUrl =
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' +
      process.env.APIKey
    if (!authData.isLogin) {
      authUrl =
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' +
        process.env.APIKey
    }

    return this.$axios
      .$post(authUrl, {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true,
      })
      .then((result) => {
        vuexContext.commit('setToken', result.idToken)
        localStorage.setItem('token', result.idToken)
        localStorage.setItem(
          'tokenExpiration',
          new Date().getTime() + parseInt(result.expiresIn) * 1000
        )

        Cookie.set('jwt', result.idToken)
        Cookie.set(
          'expirationDate',
          new Date().getTime() + parseInt(result.expiresIn) * 1000
        )
      })
      .catch((e) => console.log(e))
  },
  initAuth(vuexContext, req) {
    let token, expirationDate
    if (req) {
      if (!req.headers.cookie) {
        return
      }
      const jwtCookie = req.headers.cookie
        .split(';')
        .find((c) => c.trim().startsWith('jwt='))

      if (!jwtCookie) {
        return
      }
      token = jwtCookie.split('=')[1]

      expirationDate = req.headers.cookie
        .split(';')
        .find((c) => c.trim().startsWith('expirationDate='))
        .split('=')[1]

      console.log('USING COOKIE ---->', expirationDate)
    } else {
      token = localStorage.getItem('token')
      expirationDate = localStorage.getItem('tokenExpiration')
      console.log('USING LOCALSTORAGE ---->', expirationDate)
    }

    if (new Date().getTime() > +expirationDate || !token) {
      console.log('No token or invalid token')
      vuexContext.dispatch('logout')
      return
    }

    vuexContext.commit('setToken', token)
  },
  logout(vuexContext) {
    vuexContext.commit('clearToken')
    Cookie.remove('jwt')
    Cookie.remove('expirationDate')
    if (process.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExpiration')
    }
  },
}

export const getters = {
  loadedPosts(state) {
    return state.loadedPosts
  },
  isAuthenticated(state) {
    return state.token !== null
  },
}
