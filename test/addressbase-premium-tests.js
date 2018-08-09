/* eslint-env mocha */

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  // application specific logging, throwing an error, or other logic here
})

const tymly = require('@wmfs/tymly')
const path = require('path')
const fs = require('fs')
const rimraf = require('rimraf')
const expect = require('chai').expect

describe('process addressbase-premium', function () {
  this.timeout(process.env.TIMEOUT || 5000)

  const fixture = path.resolve(__dirname, 'fixtures')

  const inputDir = path.resolve(fixture, 'input')
  const outputDir = path.resolve(fixture, 'output')
  const streetsOutputDir = path.resolve(outputDir, 'streets')
  const propertyOutputDir = path.resolve(outputDir, 'property')
  const syncOutputDir = path.resolve(outputDir, 'sync')

  const expectedDir = path.resolve(fixture, 'expected')

  const sourceFile = path.resolve(inputDir, 'exeter-extract.xml')

  const streetsExpectedFile = path.resolve(expectedDir, 'streets.csv')
  const streetsFlattenedFile = path.resolve(streetsOutputDir, 'flattened', 'streets.csv')
  const streetsUpsertsFile = path.resolve(streetsOutputDir, 'upserts', 'addressbase_premium_streets_holding.csv')

  const propertyExpectedFile = path.resolve(expectedDir, 'property.csv')
  const propertyFlattenedFile = path.resolve(propertyOutputDir, 'flattened', 'property.csv')
  const propertiesUpsertsFile = path.resolve(propertyOutputDir, 'upserts', 'addressbase_premium_property_holding.csv')

  const syncExpectedFile = path.resolve(expectedDir, 'sync.csv')
  const syncUpsertsFile = path.resolve(syncOutputDir, 'upserts', 'gazetteer.csv')

  before(async () => {
    if (process.env.PG_CONNECTION_STRING && !/^postgres:\/\/[^:]+:[^@]+@(?:localhost|127\.0\.0\.1).*$/.test(process.env.PG_CONNECTION_STRING)) {
      console.log(`Skipping tests due to unsafe PG_CONNECTION_STRING value (${process.env.PG_CONNECTION_STRING})`)
      this.skip()
    }

    if (fs.existsSync(outputDir)) {
      rimraf.sync(outputDir)
    }
  })

  let tymlyService
  let statebox
  let client

  describe('start up', () => {
    it('start Tymly service', (done) => {
      tymly.boot(
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
        },
        (err, tymlyServices) => {
          if (err) return done(err)
          tymlyService = tymlyServices.tymly
          statebox = tymlyServices.statebox
          client = tymlyServices.storage.client
          done()
        }
      )
    })

    it('kill output dir', () => {
      if (fs.existsSync(outputDir)) {
        rimraf.sync(outputDir)
      }
    })
  }) // start up

  describe('import the addressbase data', () => {
    it('run the execution to process the XML file', async () => {
      const executionDescription = await statebox.startExecution(
        {
          streets: {
            xmlPath: sourceFile,
            csvPath: streetsFlattenedFile,
            sourceFilePaths: [streetsFlattenedFile],
            outputDirRootPath: streetsOutputDir,
            outputDir: streetsOutputDir
          },
          property: {
            xmlPath: sourceFile,
            csvPath: propertyFlattenedFile,
            sourceFilePaths: [propertyFlattenedFile],
            outputDirRootPath: propertyOutputDir,
            outputDir: propertyOutputDir
          }
        }, // input
        'ordnanceSurvey_importAddressbasePremiumGml_1_0', // state machine name
        {
          sendResponse: 'COMPLETE'
        } // options
      )
      expect(executionDescription.status).to.eql('SUCCEEDED')
    })
  })

  describe('verify properties', () => {
    it('flattened csv outout', () => {
      const property = fs.readFileSync(propertyFlattenedFile, {encoding: 'utf8'}).split('\n')
      const propertyExpected = fs.readFileSync(propertyExpectedFile, {encoding: 'utf8'}).split('\n')
      expect(property).to.eql(propertyExpected)
    })

    it('smithereens output', () => {
      const property = fs.readFileSync(propertyExpectedFile, {encoding: 'utf8'}).split('\n')
        .map(line => line.replace(/"/g, '')) // strip quote marks
        .map(line => stripColumn(line, 4)) // strip changeState marker

      const upsert = fs.readFileSync(propertiesUpsertsFile, {encoding: 'utf8'}).split('\r\n')
        .map(line => stripColumn(line, 1)) // strip hashsum

      expect(property).to.eql(upsert)
    })

    it('database import', async () => {
      const propertyLpis = fs.readFileSync(propertyExpectedFile, {encoding: 'utf8'}).split('\n')
        .map(line => line.split(',')[0]) // extract LPI
        .slice(1, -1) // drop header line, and empty last line
        .map(line => line.replace(/"/g, '')) // strip quote marks
        .sort()

      // checking the view
      const importLpis = (await client.query('SELECT lpi_key FROM ordnance_survey.addressbase_premium_property_holding ORDER BY lpi_key ASC;'))
        .rows.map(row => row.lpi_key)

      expect(importLpis).to.eql(propertyLpis)
    })
  }) // properties

  describe('verify streets', () => {
    it('flattened csv outout', () => {
      const streets = fs.readFileSync(streetsFlattenedFile, {encoding: 'utf8'}).split('\n')
      const streetsExpected = fs.readFileSync(streetsExpectedFile, {encoding: 'utf8'}).split('\n')
      expect(streets).to.eql(streetsExpected)
    })

    it('smithereens output', () => {
      const streets = fs.readFileSync(streetsExpectedFile, {encoding: 'utf8'}).split('\n')
        .map(line => line.replace(/"/g, '')) // strip quote marks
        .map(line => stripColumn(line, 1)) // strip changeState marker

      const upsert = fs.readFileSync(streetsUpsertsFile, {encoding: 'utf8'}).split('\r\n')
        .map(line => stripColumn(line, 1)) // strip hashsum

      expect(upsert).to.eql(streets)
    })

    it('database import', async () => {
      const streetsUsrns = fs.readFileSync(streetsExpectedFile, {encoding: 'utf8'}).split('\n')
        .map(line => line.split(',')[0]) // extract USRN
        .slice(1, -1) // drop header line, and empty last line
        .map(line => line.replace(/"/g, '')) // strip quote marks
        .sort()

      const importUsrns = (await client.query('SELECT usrn FROM ordnance_survey.addressbase_premium_streets_holding ORDER BY usrn ASC;'))
        .rows.map(row => row.usrn.toString())

      expect(importUsrns).to.eql(streetsUsrns)
    })
  }) // streets

  describe('verify holding view', () => {
    it('database import', async () => {
      const propertyLpis = fs.readFileSync(propertyExpectedFile, {encoding: 'utf8'}).split('\n')
        .slice(1, -1) // drop header line, and empty last line
        .filter(line => line.split(',')[1] === '1') // only look for active lpis
        .map(line => line.split(',')[0]) // extract LPI
        .map(line => line.replace(/"/g, '')) // strip quote marks
        .sort()

      // checking the view
      const importLpis = (await client.query('SELECT lpi_key FROM ordnance_survey.addressbase_premium_holding ORDER BY lpi_key ASC;'))
        .rows.map(row => row.lpi_key)

      expect(importLpis).to.eql(propertyLpis)
    })
  })

  describe('synchronization', () => {
    it('populate test data', async () => {
      const sqlFile = path.resolve(__dirname, './fixtures/scripts/wmfs-gazetteer-setup.sql')
      await client.runFile(sqlFile)
    })

    it('check for a single gazetteer record', async () => {
      const result = await client.query('SELECT count(uprn) FROM wmfs.gazetteer')
      const count = result.rows[0].count
      expect(count).to.eql('1')
    })

    let existing
    it('grab existing row', async () => {
      const result = await client.query('SELECT * from wmfs.gazetteer')
      expect(result.rowCount).to.eql(1)

      existing = result.rows[0]
    })

    it('run synchronize-addressbox-premium state machine', async () => {
      const executionDescription = await statebox.startExecution(
        {
          outputDir: syncOutputDir
        }, // input
        'ordnanceSurvey_synchronizeAddressbasePremium_1_0', // state machine name
        {
          sendResponse: 'COMPLETE'
        }
      )

      expect(executionDescription.status).to.eql('SUCCEEDED')
      expect(executionDescription.currentStateName).to.eql('SynchronizingTable')
      expect(executionDescription.ctx.outputDir).to.eql(syncOutputDir)
    })

    it('check the newly populated gazetteer table', async () => {
      const result = await client.query('SELECT uprn FROM wmfs.gazetteer ORDER BY uprn ASC;', [])
      expect(result.rowCount).to.eql(22)
    })

    it('verify upserts output', () => {
      const upsert = fs.readFileSync(syncUpsertsFile, {encoding: 'utf8'}).split('\n').map(s => s.trim())
      const upsertExpected = fs.readFileSync(syncExpectedFile, {encoding: 'utf8'}).split('\n').map(s => s.trim())

      expect(upsert.length).to.eql(upsertExpected.length)
      expect(upsert).to.contains.members(upsertExpected)
    })

    it('pre-existing row is unchanged', async () => {
      const result = await client.query(`SELECT * from wmfs.gazetteer WHERE uprn = ${existing.uprn}`)
      expect(result.rowCount).to.eql(1)

      expect(result.rows[0]).to.eql(existing)
    })
  })

  describe('close down', () => {
    it('clear down database', async () => {
      await client.query('DROP SCHEMA ordnance_survey CASCADE')
      await client.query('DROP SCHEMA wmfs CASCADE')
    })

    it('shutdown Tymly', () => {
      return tymlyService.shutdown()
    })
  })

  function stripColumn (line, index) {
    const cols = line.split(',')
    cols.splice(index, 1)
    return cols.join()
  }
})
