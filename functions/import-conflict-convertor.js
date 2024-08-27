const csvParse = require('csv-string').parse
const fs = require('fs')
const fsp = fs.promises
const path = require('path')
// const once = require('events')
const stream = require('stream')
const util = require('util')
const finished = util.promisify(stream.finished)

module.exports = function (ctx) {
  const models = ctx.blueprintComponents.models

  async function convertConflictsToRewind (tableName, syncDir) {
    const [schemaName, modelName] = tableName.split('.')
    const qualifiedModelName = `${schemaName}_${modelName}`
    const model = models[qualifiedModelName]

    const conflictsDir = path.join(syncDir, 'conflicts')
    const rewindFile = await createRewindFileStream(path.join(conflictsDir, 'inserts'))

    let columns = null
    const csvFileName = path.join(conflictsDir, `${modelName}.csv`)
    for await (const line of readLines(csvFileName)) {
      if (!columns) {
        columns = columnNames(line)
        continue
      }

      const json = lineToJson(line, columns)
      const rewind = jsonToRewind(json, model)

      // if (!rewindFile.write(rewind)) {
      //   await once(rewindFile, 'drain')
      // }

      await write(rewindFile, rewind)
    }

    rewindFile.end()
    await finished(rewindFile)

    return { rewindDir: conflictsDir }
  }

  convertConflictsToRewind.columnNames = columnNames
  convertConflictsToRewind.lineToJson = lineToJson
  convertConflictsToRewind.jsonToRewind = jsonToRewind

  return convertConflictsToRewind
}

function columnNames (line) {
  const PK_COLUMN_PREFIX = '.'

  const parsed = csvParse(line.toString())[0].map(s => s.trim().toLowerCase())

  const columnNames = parsed.map(n => n.startsWith(PK_COLUMN_PREFIX) ? n.substring(1) : n)
  return columnNames
} // columnNames

function lineToJson (line, columnNames) {
  const columns = csvParse(line.toString())[0].map(s => s.trim())

  const json = {}
  columns.forEach((value, i) => {
    if (!value) return
    const name = columnNames[i]
    json[name] = value
  })
  return json
} // lineToJson

function jsonToRewind (json, model) {
  const modelName = `${model.namespace}.${model.name}`
  const keyString = model.primaryKey.map(k => json[k]).join('_')
  const oldValue = JSON.stringify(json)

  return `${modelName},${keyString},'${oldValue}','{"action":"conflict"}'\n`
} // jsonToRewind

async function * readLines (csvFilename) {
  let previous = ''
  for await (const chunk of fs.createReadStream(csvFilename)) {
    previous += chunk
    while (true) {
      const eolIndex = previous.indexOf('\n')
      if (eolIndex < 0) break

      // line includes the EOL
      const line = previous.slice(0, eolIndex + 1)
      yield line
      previous = previous.slice(eolIndex + 1)
    }
  }
  if (previous.length > 0) {
    yield previous
  }
} // readLines

async function createRewindFileStream (insertDir) {
  // I know we don't really want to do a sync operation,
  // but we won't do this very often
  if (!fs.existsSync(insertDir)) {
    await fsp.mkdir(insertDir)
  }
  const rewindCsv = path.join(insertDir, 'rewind.csv')
  const stream = fs.createWriteStream(rewindCsv)
  stream.write('model_name,key_string,old_values,diff\n')
  return stream
} // createRewindFileStream

function write (writer, data) {
  return new Promise((resolve) => {
    if (!writer.write(data)) {
      writer.once('drain', resolve)
    } else {
      resolve()
    }
  })
}
