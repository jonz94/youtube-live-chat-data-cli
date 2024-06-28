import { defineCommand } from 'citty'
import { YTNodes } from 'youtubei.js'
import { db } from '../../db/db'
import { channels, users } from '../../db/schema'
import { createInnertubeClient, getChannel, getChannelId } from '../utils'

export default defineCommand({
  meta: {
    name: 'channel',
    description: 'Fetch data from a YouTube channel.',
  },
  args: {
    cid: {
      description: 'YouTube Channel Id or YouTube Handler',
      type: 'string',
    },
  },
  run: async ({ args }) => {
    const youtube = await createInnertubeClient()

    if (args.cid) {
      const channelId = await getChannelId(youtube, args.cid)

      const channel = await getChannel(youtube, channelId)

      if (channel === null) {
        return
      }

      const header = channel.header

      if (!header) {
        console.log(`the channel ${channelId} has no header...`)
        return
      }

      if (header.is(YTNodes.C4TabbedHeader)) {
        await db
          .insert(channels)
          .values({
            id: channelId,
            name: header.author.name,
            thumbnailUrl: header.author.best_thumbnail?.url,
          })
          .onConflictDoNothing()
      } else {
        console.log('new header type:', header.type)
      }

      return
    }

    const userIds = (await db.select({ id: users.id }).from(users)).map((user) => user.id)

    console.log(userIds.length)

    const existingChannelIds = (await db.select({ id: channels.id }).from(channels)).map((channel) => channel.id)

    console.log(existingChannelIds.length)

    const newChannelIds = userIds.filter((channelId) => !existingChannelIds.includes(channelId))

    console.log(newChannelIds.length)

    for (const userId of newChannelIds) {
      const channel = await getChannel(youtube, userId)

      if (channel === null) {
        continue
      }

      const header = channel.header

      if (!header) {
        console.log(`the channel ${userId} has no header...`)
        continue
      }

      if (header.is(YTNodes.C4TabbedHeader)) {
        await db
          .insert(channels)
          .values({
            id: userId,
            name: header.author.name,
            thumbnailUrl: header.author.best_thumbnail?.url,
          })
          .onConflictDoNothing()
      } else {
        console.log('new header type:', header.type)
      }
    }
  },
})
