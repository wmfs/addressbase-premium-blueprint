/* eslint-env mocha */

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const tymly = require('@wmfs/tymly')
const path = require('path')

describe('transform conflicts file to rewind audit entry', function () {
  this.timeout(process.env.TIMEOUT || 5000)
  let tymlyService, conflictConvertor

  before('set up tymly', async () => {
    const tymlyServices = await tymly.boot(
      {
        pluginPaths: [
          require.resolve('@wmfs/tymly-etl-plugin'),
          require.resolve('@wmfs/tymly-test-helpers/plugins/allow-everything-rbac-plugin'),
          require.resolve('@wmfs/tymly-pg-plugin')
        ],
        blueprintPaths: [
          path.resolve(__dirname, './..'),
          path.resolve(__dirname, './fixtures/test-blueprint'),
          require.resolve('@wmfs/gazetteer-blueprint')
        ]
      }
    )

    tymlyService = tymlyServices.tymly
    conflictConvertor = tymlyServices.functions.functions.ordnanceSurvey_importConflictConvertor
  })

  it('convert gazetteer conflicts', () => {
    expect(conflictConvertor).to.exist()
  })

  it('column names', () => {
    const headerLine = '.UPRN,.counter,lpi_key,street_name_1,area_name_1,post_town,postcode'

    const columnNames = conflictConvertor.func.columnNames(headerLine)

    expect(columnNames.pk).to.eql(['uprn', 'counter'])
    expect(columnNames.all).to.eql(['uprn', 'counter', 'lpi_key', 'street_name_1', 'area_name_1', 'post_town', 'postcode'])
  })

  it('line to json', () => {
    const columnNames = {
      pk: ['uprn', 'counter'],
      all: ['uprn', 'counter', 'lpi_key', 'street_name_1', 'area_name_1', 'post_town', 'postcode']
    }
    const line = '12345678,1,abcdef,1 Trouser Street,Pantaloon Alley,Legville,LG1 2PR'

    const json = conflictConvertor.func.lineToJson(line, columnNames)
    expect(json).to.eql({
      uprn: '12345678',
      counter: '1',
      lpi_key: 'abcdef',
      street_name_1: '1 Trouser Street',
      area_name_1: 'Pantaloon Alley',
      post_town: 'Legville',
      postcode: 'LG1 2PR'
    })
  })

  after('shutdown tymly', async () => {
    await tymlyService.shutdown()
  })
})
