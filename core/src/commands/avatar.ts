import { defineCommand } from 'citty'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { YTNodes } from 'youtubei.js'
import { db } from '~/db/db'
import { users } from '~/db/schema'
import { createInnertubeClient, getChannel, getProjectRoot } from '~/utils'

async function getImageUrlFromHeader(
  header: YTNodes.C4TabbedHeader | YTNodes.CarouselHeader | YTNodes.InteractiveTabbedHeader | YTNodes.PageHeader,
) {
  if (header.is(YTNodes.C4TabbedHeader)) {
    return header.author.best_thumbnail?.url ?? null
  }

  if (header.is(YTNodes.PageHeader)) {
    const image = header.content?.image

    if (!image) {
      return null
    }

    if (image.is(YTNodes.DecoratedAvatarView)) {
      return image.avatar?.image.at(0)?.url ?? null
    }

    return image.image.at(0)?.url ?? null
  } else {
    console.log('new header type:', header.type)
    console.log(JSON.stringify(header, null, 2))
  }
}

export default defineCommand({
  meta: {
    name: 'avatar',
    description: 'save user avatar into image files.',
  },
  run: async () => {
    const outputDir = resolve(getProjectRoot(), 'outputs')
    mkdirSync(outputDir, { recursive: true })

    const channelData = await db
      .select({ id: users.channelId, name: users.name, timestamp: users.timestamp })
      .from(users)
    const channelOutputPath = resolve(outputDir, 'channels.json')
    writeFileSync(channelOutputPath, JSON.stringify(channelData), 'utf-8')

    const youtube = await createInnertubeClient()

    const total = channelData.length
    let count = 0

    for (const channel of channelData) {
      const userId = channel.id

      count++
      console.log(`(${count}/${total}) ${userId}`)

      const userOutputDir = resolve(getProjectRoot(), 'outputs', userId)
      mkdirSync(userOutputDir, { recursive: true })

      // channel
      const userChannelOutputPath = resolve(userOutputDir, 'channel.json')
      writeFileSync(userChannelOutputPath, JSON.stringify(channel), 'utf-8')

      // avatar
      const youtubeChannel = await getChannel(youtube, userId)

      if (youtubeChannel === null) {
        continue
      }

      const header = youtubeChannel.header

      if (!header) {
        console.log(`the channel ${userId} has no header...`)
        continue
      }

      const imageUrl = await getImageUrlFromHeader(header)

      if (!imageUrl) {
        console.log(`the channel ${userId} has no avatar...`)
        continue
      }

      const image = await fetch(imageUrl)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => Buffer.from(arrayBuffer))

      const userAvatarOutputPath = resolve(userOutputDir, 'avatar.jpg')
      writeFileSync(userAvatarOutputPath, image)
    }
  },
})
