export const state = () => ({
  loadedPosts: [],
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
      .$post(`/posts.json`, createdPost)
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
      .$put(`/posts/${editedPost.id}.json`, editedPost)
      .then((res) => {
        vuexContext.commit('editPost', editedPost)
      })
      .catch((e) => console.log(e))
  },
  setPosts(vuexContext, posts) {
    vuexContext.commit('setPosts', posts)
  },
}

export const getters = {
  loadedPosts(state) {
    return state.loadedPosts
  },
}
