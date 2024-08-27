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

    const lines = fs.readFileSync(rewindCsv, 'utf8').split('\n')
    console.log(lines[0])
    console.log(lines[1])
    console.log(lines[2])
    console.log(lines[3])
    console.log(lines[4])
    console.log(lines[5])
    console.log(lines[6])

    // await readCsv(rewindCsv)

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
