import { resolve } from 'node:path'
import { Innertube, UniversalCache } from 'youtubei.js'

export async function createInnertubeClient() {
  return await Innertube.create({
    cache: new UniversalCache(true, resolve(import.meta.dirname, '..', '.cache')),
  })
}

export async function getChannelId(youtube: Innertube, id: string) {
  const youtubeChannelUrl = id.startsWith('@')
    ? `https://www.youtube.com/${id}`
    : `https://www.youtube.com/channel/${id}`

  const navigationEndpoint = await youtube.resolveURL(youtubeChannelUrl)

  return (navigationEndpoint.toURL() ?? '').replace('https://www.youtube.com/channel/', '')
}

export async function getVideoIdsOfAllPublicLiveStreams(
  youtube: Innertube,
  channelId: string,
  order: 'fromLatestToOldest' | 'fromOldestToLatest',
) {
  const allPublicLiveStreamsPlaylistId = channelId.replace(/^UC/, 'UULV')

  let playlist = await youtube.getPlaylist(allPublicLiveStreamsPlaylistId)
  let videoIds = playlist.items.map((item) => item.id)

  // fetch all data until the end
  while (playlist.has_continuation) {
    playlist = await playlist.getContinuation()

    videoIds = videoIds.concat(playlist.items.map((item) => item.id))
  }

  return order === 'fromLatestToOldest' ? videoIds : videoIds.toReversed()
}

export async function getVideoInfo(youtube: Innertube, videoId: string) {
  const video = await youtube.getBasicInfo(videoId)

  const { is_live, is_upcoming, title, start_timestamp, end_timestamp, duration } = video.basic_info

  return {
    isLive: is_live,
    isUpcoming: is_upcoming,
    title,
    startTimestamp: start_timestamp?.toISOString(),
    endTimestamp: end_timestamp?.toISOString(),
    duration,
  }
}
