/* eslint-env mocha */

const collapseMatchingLpis = require('../functions/collapse-matching-lpis')()

const expect = require('chai').expect

describe('collapse-matching-lpis', () => {
  it('one lpi', () => {
    const uprnNode = {
      landPropertyIdentifierMember: [
        {
          LandPropertyIdentifier: [{
            lpiKey: [{ '#text': '123458' }],
            logicalStatus: [{ '#text': '1' }]
          }]
        }
      ]
    }

    collapseMatchingLpis(uprnNode)

    expect(uprnNode.landPropertyIdentifierMember.length === 1)
  })

  it('three lpis, different status', () => {
    const uprnNode = {
      landPropertyIdentifierMember: [
        {
          LandPropertyIdentifier: [{
            lpiKey: [{ '#text': '123458' }],
            logicalStatus: [{ '#text': '1' }]
          }]
        },
        {
          LandPropertyIdentifier: [{
            lpiKey: [{ '#text': '123459' }],
            logicalStatus: [{ '#text': '8' }]
          }]
        },
        {
          LandPropertyIdentifier: [{
            lpiKey: [{ '#text': '123429' }],
            logicalStatus: [{ '#text': '6' }]
          }]
        }
      ]
    }

    collapseMatchingLpis(uprnNode)

    expect(uprnNode.landPropertyIdentifierMember.length === 3)
  })


})
