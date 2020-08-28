const csvParse = require('csv-string').parse
const _ = require('lodash')

function importConflictConvertor (ctx) {
  const models = ctx.blueprintComponents.models

  function convertConflictsToRewind () {

  }

  convertConflictsToRewind.columnNames = columnNames

  return convertConflictsToRewind
}

function columnNames (line) {
  const PK_COLUMN_PREFIX = '.'
  const columnNames = {
    all: [],
    pk: [],
    attributes: []
  }
  const parsed = csvParse(line.toString())[0]

  for (let i = 0; i < parsed.length; i++) {
    parsed[i] = _.trim(parsed[i])
  }

  if (line.toString().indexOf(PK_COLUMN_PREFIX) !== -1) {
    parsed.forEach(
      function (rawColumnName) {
        if (rawColumnName[0] === PK_COLUMN_PREFIX) {
          const trimmed = rawColumnName.substring(1).toLowerCase()
          columnNames.all.push(trimmed)
          columnNames.pk.push(trimmed)
        } else {
          columnNames.all.push(rawColumnName.toLowerCase())
          columnNames.attributes.push(rawColumnName.toLowerCase())
        }
      }
    )
  } else {
    for (let i = 0, colCount = parsed.length; i < colCount; i++) {
      const val = parsed[i].toLowerCase()
      if (i === 0) {
        columnNames.all.push(val)
        columnNames.pk.push(val)
      } else {
        columnNames.all.push(val)
        columnNames.attributes.push(val)
      }
    }
  }

  return columnNames
}

module.exports = importConflictConvertor
