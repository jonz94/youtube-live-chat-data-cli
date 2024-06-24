import { defineCommand } from 'citty'
import { createInnertubeClient } from '../utils'

export default defineCommand({
  meta: {
    name: 'login',
    description: 'Sign in to YouTube TV.',
  },
  run: async () => {
    const youtube = await createInnertubeClient()

    console.log('is logged in?', youtube.session.logged_in)

    // Fired when waiting for the user to authorize the sign in attempt.
    youtube.session.on('auth-pending', (data) => {
      console.log(`Go to ${data.verification_url} in your browser and enter code ${data.user_code} to authenticate.`)
      console.log({ data })
    })

    // Fired when authentication is successful.
    youtube.session.on('auth', ({ credentials }) => {
      // console.log('Sign in successful:', credentials)
    })

    // Fired when the access token expires.
    youtube.session.on('update-credentials', async ({ credentials }) => {
      // console.log('Credentials updated:', credentials)
      await youtube.session.oauth.cacheCredentials()
    })

    await youtube.session.signIn()

    // You may cache the session for later use
    // If you use this, the next call to signIn won't fire 'auth-pending' instead just 'auth'.
    await youtube.session.oauth.cacheCredentials()

    console.log('is logged in?', youtube.session.logged_in)
  },
})
