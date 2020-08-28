const csvParse = require('csv-string').parse

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
    pk: []
  }
  const parsed = csvParse(line.toString())[0].map(s => s.trim().toLowerCase())

  for (const name of parsed) {
    if (name[0] === PK_COLUMN_PREFIX) {
      const trimmed = name.substring(1)
      columnNames.all.push(trimmed)
      columnNames.pk.push(trimmed)
    } else {
      columnNames.all.push(name)
    }
  } // for ...

  // if no primary key found, assume first column is pk
  if (columnNames.pk.length === 0) {
    columnNames.pk.push(columnNames.all[0])
  }

  return columnNames
}

module.exports = importConflictConvertor
