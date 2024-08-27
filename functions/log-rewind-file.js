const path = require('path')
const fs = require('fs')
const { parse } = require('csv-parse')

module.exports = function () {
  return function (event) {
    console.log('')
    console.log('-----')
    console.log('')
    console.log({ event })

    const rewindCsv = path.join(event.outputDir, 'inserts', 'rewind.csv')

    console.log({ rewindCsv })

    readCsv(rewindCsv)

    console.log('')
    console.log('-----')
    console.log('')
  }
}

function readCsv (filepath) {
  return new Promise((resolve, reject) => {
    let i = 0

    fs.createReadStream(filepath)
      .pipe(parse({ columns: true }))
      .on('data', row => {
        if (i <= 15) {
          console.log(row)
        }
        i++
      })
      .on('error', reject)
      .on('end', resolve)
  })
}
