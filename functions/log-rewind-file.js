const path = require('path')
const fs = require('fs')
const { parse } = require('csv-parse')

module.exports = function () {
  return async function (event) {
    console.log('')
    console.log('-----')
    console.log('')
    console.log({ event })

    const rewindCsv = path.join(event.outputDir, 'conflicts', 'inserts', 'rewind.csv')

    console.log({ rewindCsv })

    await readCsv(rewindCsv)

    console.log('')
    console.log('-----')
    console.log('')
  }
}

function readCsv (filepath) {
  console.log({ filepath })
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
      .on('error', err => {
        console.log('Error', err)
        return reject(err)
      })
      .on('end', () => {
        console.log('Ended')
        return resolve()
      })
  })
}
