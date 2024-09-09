import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Innertube, UniversalCache, type InnertubeConfig } from 'youtubei.js'

export function getDirname() {
  return import.meta.dirname ?? dirname(fileURLToPath(import.meta.url))
}

export function getProjectRoot() {
  return dirname(getDirname())
}

export async function createInnertubeClient(config?: InnertubeConfig) {
  return await Innertube.create({
    cache: new UniversalCache(true, resolve(getDirname(), '..', '.cache')),
    ...config,
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

export async function getChannel(youtube: Innertube, channelId: string) {
  try {
    return await youtube.getChannel(channelId)
  } catch (error) {
    console.log('channel id:', channelId)
    console.log(error)
    return null
  }
}
