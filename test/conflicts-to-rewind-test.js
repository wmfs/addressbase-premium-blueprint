/* eslint-env mocha */

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const tymly = require('@wmfs/tymly')
const path = require('path')

describe('transform conflicts file to rewind audit entry', function () {
  this.timeout(process.env.TIMEOUT || 5000)
  let tymlyService, functions

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
    functions = tymlyServices.functions
  })

  it('convert gazetteer conflicts', () => {
    const conflictConvertor = functions.functions.ordnanceSurvey_importConflictConvertor
    expect(conflictConvertor).to.exist()
  })

  after('shutdown tymly', async () => {
    await tymlyService.shutdown()
  })
})
