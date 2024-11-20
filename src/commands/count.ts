import { defineCommand } from 'citty'
import { Table, count } from 'drizzle-orm'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { db } from '~/db/db'
import {
  rawLiveChatSponsorshipsGiftPurchaseAnnouncement,
  rawLiveChatSponsorshipsGiftRedemptionAnnouncement,
  rawMembershipItem,
  rawPaidMessage,
  rawPaidSticker,
  rawTextMessage,
  users,
  videos,
} from '~/db/schema'
import { getProjectRoot } from '~/utils'

async function getCountFromDatabaseTable(tableName: Table) {
  // credits: https://orm.drizzle.team/learn/guides/count-rows
  const result = await db.select({ count: count() }).from(tableName)

  return result[0].count
}

export default defineCommand({
  meta: {
    description: 'Count the number of data for each data type.',
  },
  args: {
    output: {
      description: 'Export the result into JSON file',
      type: 'boolean',
      default: false,
    },
  },
  run: async ({ args }) => {
    const [
      videosCountResult,
      usersCountResult,
      rawTextMessagesCountResult,
      rawPaidMessagesCountResult,
      rawPaidStickersCountResult,
      rawMembershipItemsCountResult,
      rawLiveChatSponsorshipsGiftPurchaseAnnouncementsCountResult,
      rawLiveChatSponsorshipsGiftRedemptionAnnouncementsCountResult,
    ] = await Promise.all([
      getCountFromDatabaseTable(videos),
      getCountFromDatabaseTable(users),
      getCountFromDatabaseTable(rawTextMessage),
      getCountFromDatabaseTable(rawPaidMessage),
      getCountFromDatabaseTable(rawPaidSticker),
      getCountFromDatabaseTable(rawMembershipItem),
      getCountFromDatabaseTable(rawLiveChatSponsorshipsGiftPurchaseAnnouncement),
      getCountFromDatabaseTable(rawLiveChatSponsorshipsGiftRedemptionAnnouncement),
    ])

    const result = {
      videosCountResult,
      usersCountResult,
      rawTextMessagesCountResult,
      rawPaidMessagesCountResult,
      rawPaidStickersCountResult,
      rawMembershipItemsCountResult,
      rawLiveChatSponsorshipsGiftPurchaseAnnouncementsCountResult,
      rawLiveChatSponsorshipsGiftRedemptionAnnouncementsCountResult,
    }

    console.log(result)

    if (args.output) {
      const outputDir = resolve(getProjectRoot(), 'outputs')
      mkdirSync(outputDir, { recursive: true })

      const countOutputPath = resolve(outputDir, 'count.json')
      writeFileSync(countOutputPath, JSON.stringify({ ...result, timestamp: new Date().toISOString() }), 'utf-8')
    }
  },
})
