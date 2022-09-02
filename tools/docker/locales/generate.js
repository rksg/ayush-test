const path = require('node:path')
const fs = require('node:fs')
const _ = require('lodash')
const args = process.argv.slice(2).slice(0, 2)

if (args.length !== 2) throw new Error('Pass in source and target path to copy i18n keys')

const [source, target] = args.map(function loadAndWrapI18nFile (target) {
  return _(require(path.join(process.cwd(), target)))
})

const newKeys = _.difference(source.keys().value(), target.keys().value())
const removedKeys = _.difference(target.keys().value(), source.keys().value())

// exit if no new items to add/remove
if (newKeys.length === 0 && removedKeys.length === 0) process.exit(0)

const result = target
  .merge(source.pick(newKeys).value())
  .omit(removedKeys)
  .value()

fs.writeFileSync(args[1], JSON.stringify(result, null, 2), 'utf8')
