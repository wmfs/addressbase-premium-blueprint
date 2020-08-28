const csvParse = require('csv-string').parse

module.exports = function (ctx) {
  const models = ctx.blueprintComponents.models

  function convertConflictsToRewind () {

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
  const columns = csvParse(line)[0].map(s => s.trim())

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

  return `${modelName},${keyString},'${oldValue}','{"action":"conflict"}'`
} // jsonToRewind
