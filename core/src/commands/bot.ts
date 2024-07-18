import { defineCommand } from 'citty'
import { YTNodes } from 'youtubei.js'
import { createInnertubeClient } from '~/utils'

export default defineCommand({
  meta: {
    name: 'bot',
    description: 'Running bot that will notice important message in live chat.',
  },
  args: {
    vid: {
      description: 'YouTube Video Id',
      required: true,
      type: 'string',
    },
  },
  run: async ({ args }) => {
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

    const videoId = args.vid

    const video = await youtube.getInfo(videoId)

    const livechat = video.getLiveChat()

    livechat.on('error', (error) => {
      console.info('Live chat error:', error)
      console.trace(error)
    })

    livechat.on('end', () => {
      console.info('This live stream has ended.')
      livechat.stop()
    })

    livechat.on('chat-update', async (action) => {
      if (!action.is(YTNodes.AddBannerToLiveChatCommand)) {
        return
      }

      console.log(JSON.stringify(action, null, 2))

      const contents = action.banner?.contents

      if (!contents) {
        return
      }

      if (!contents.is(YTNodes.LiveChatBannerRedirect)) {
        return
      }

      const bannerMessage = contents.banner_message.toString()
      const KEYWORDS = ' and their viewers just joined. Say hello!' as const

      if (!bannerMessage.includes(KEYWORDS)) {
        return
      }

      const name = bannerMessage.replace(KEYWORDS, '')

      await livechat.sendMessage(`歡迎「${name}」醬肉～`)
    })

    livechat.start()
  },
})
