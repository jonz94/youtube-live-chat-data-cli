import '@total-typescript/ts-reset/filter-boolean'
import { defineCommand, runMain } from 'citty'
import { description, name, version } from '../package.json'

const main = defineCommand({
  meta: {
    name,
    version,
    description,
  },
  subCommands: {
    login: import('./commands/login').then((mod) => mod.default),
    logout: import('./commands/logout').then((mod) => mod.default),
    bot: import('./commands/bot').then((mod) => mod.default),
    videos: import('./commands/videos').then((mod) => mod.default),
    prepare: import('./commands/prepare').then((mod) => mod.default),
    chat: import('./commands/chat').then((mod) => mod.default),
    count: import('./commands/count').then((mod) => mod.default),
    check: import('./commands/check').then((mod) => mod.default),
    json: import('./commands/json').then((mod) => mod.default),
    avatar: import('./commands/avatar').then((mod) => mod.default),
  },
})

runMain(main)
