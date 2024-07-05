import { defineCommand } from 'citty'
import { YTNodes } from 'youtubei.js'
import { db } from '../../db/db'
import { channels, users } from '../../db/schema'
import { createInnertubeClient, getChannel, getChannelId } from '../utils'

async function parseHeader(
  header: YTNodes.C4TabbedHeader | YTNodes.CarouselHeader | YTNodes.InteractiveTabbedHeader | YTNodes.PageHeader,
  channelId: string,
) {
  if (header.is(YTNodes.C4TabbedHeader)) {
    await db
      .insert(channels)
      .values({
        id: channelId,
        name: header.author.name,
        thumbnailUrl: header.author.best_thumbnail?.url,
      })
      .onConflictDoNothing()
  } else if (header.is(YTNodes.PageHeader)) {
    const image = header.content?.image

    if (!image) {
      await db
        .insert(channels)
        .values({
          id: channelId,
          name: header.page_title,
        })
        .onConflictDoNothing()
    } else if (image.is(YTNodes.DecoratedAvatarView)) {
      await db
        .insert(channels)
        .values({
          id: channelId,
          name: header.page_title,
          thumbnailUrl: image.avatar?.image.at(0)?.url,
        })
        .onConflictDoNothing()
    } else {
      await db
        .insert(channels)
        .values({
          id: channelId,
          name: header.page_title,
          thumbnailUrl: image.image.at(0)?.url,
        })
        .onConflictDoNothing()
    }
  } else {
    console.log('new header type:', header.type)
    console.log(JSON.stringify(header, null, 2))
  }
}

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

      await parseHeader(header, channelId)

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

      await parseHeader(header, userId)
    }
  },
})
