/* eslint-env mocha */

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const tymly = require('@wmfs/tymly')
const path = require('path')
const fs = require('fs')
const rimraf = require('rimraf')

describe('transform conflicts file to rewind audit entry', function () {
  this.timeout(process.env.TIMEOUT || 5000)
  let tymlyService, conflictConvertor, gazetteerModel

  const conflictsDir = path.join(__dirname, './fixtures/rewind/property/sync/conflicts')
  const gazetteerCsv = path.join(conflictsDir, 'gazetteer.csv')
  const rewindDir = path.join(conflictsDir, 'inserts')

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
    gazetteerModel = tymlyService.blueprintComponents.models.wmfs_gazetteer
    conflictConvertor = tymlyServices.functions.functions.ordnanceSurvey_importConflictConvertor
  })

  before('remove output dir', () => {
    rimraf.sync(rewindDir)
  })

  it('convert gazetteer conflicts', () => {
    expect(conflictConvertor).to.exist()
  })

  it('column names', () => {
    const headerLine = '.UPRN,.counter,lpi_key,street_name_1,area_name_1,post_town,postcode'

    const columnNames = conflictConvertor.func.columnNames(headerLine)

    expect(columnNames).to.eql(['uprn', 'counter', 'lpi_key', 'street_name_1', 'area_name_1', 'post_town', 'postcode'])
  })

  it('line to json', () => {
    const columnNames = ['uprn', 'counter', 'lpi_key', 'street_name_1', 'street_name_2', 'area_name_1', 'post_town', 'postcode']
    const line = '12345678,1,abcdef,1 Trouser Street,,Pantaloon Alley,Legville,LG1 2PR'

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

  it('json to rewind row', () => {
    const json = {
      uprn: '12345678',
      counter: '1',
      street_name_1: '1 Trouser Street'
    }

    const rewind = conflictConvertor.func.jsonToRewind(json, gazetteerModel)

    expect(rewind).to.eql(
      'wmfs.gazetteer,12345678_1,\'{"uprn":"12345678","counter":"1","street_name_1":"1 Trouser Street"}\',\'{"action":"conflict"}\''
    )
  })

  after('shutdown tymly', async () => {
    await tymlyService.shutdown()
  })
})
