import { defineCommand } from 'citty'
import { createInnertubeClient } from '../utils'

export default defineCommand({
  meta: {
    name: 'logout',
    description: 'Sign out to YouTube TV.',
  },
  run: async () => {
    const youtube = await createInnertubeClient()

    await youtube.session.signOut()
  },
})
