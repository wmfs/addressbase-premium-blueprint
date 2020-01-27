/* eslint-env mocha */

const collapseMatchingLpis = require('../functions/collapse-matching-lpis')()

const expect = require('chai').expect

describe('collapse-matching-lpis', () => {
  describe('nothing to strip', () => {
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

      expect(uprnNode.landPropertyIdentifierMember.length).to.eql(1)
    })

    it('two lpis, different status', () => {
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
          }
        ]
      }

      collapseMatchingLpis(uprnNode)

      expect(uprnNode.landPropertyIdentifierMember.length).to.eql(2)
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

      expect(uprnNode.landPropertyIdentifierMember.length).to.eql(3)
    })
  })

  describe('matching status, no text', () => {
    it('two lpis', () => {
      const uprnNode = {
        landPropertyIdentifierMember: [
          {
            LandPropertyIdentifier: [{
              startDate: [{ '#text': '2016-01-22' }],
              lastUpdateDate: [{ '#text': '2016-02-07' }],
              entryDate: [{ '#text': '2016-01-18' }],
              lpiKey: [{ '#text': '6940L000150332' }],
              logicalStatus: [{ '#text': '1' }],
              paoStartNumber: [{ '#text': '17' }],
              paoStartSuffix: [{ '#text': 'A' }]
            }]
          },
          {
            LandPropertyIdentifier: [{
              startDate: [{ '#text': '2018-09-05' }],
              lastUpdateDate: [{ '#text': '2018-09-22' }],
              entryDate: [{ '#text': '2018-06-27' }],
              lpiKey: [{ '#text': '6940L000299640' }],
              logicalStatus: [{ '#text': '1' }],
              paoStartNumber: [{ '#text': '17' }],
              paoStartSuffix: [{ '#text': 'A' }]
            }]
          }
        ]
      }

      collapseMatchingLpis(uprnNode)

      expect(uprnNode.landPropertyIdentifierMember.length).to.eql(1)
      const lpi = uprnNode.landPropertyIdentifierMember[0].LandPropertyIdentifier[0]
      // take most recent
      expect(lpi.lpiKey[0]['#text']).to.eql('6940L000299640')
    })

    it('two lpis, reverse order', () => {
      const uprnNode = {
        landPropertyIdentifierMember: [
          {
            LandPropertyIdentifier: [{
              startDate: [{ '#text': '2018-09-05' }],
              lastUpdateDate: [{ '#text': '2018-09-22' }],
              entryDate: [{ '#text': '2018-06-27' }],
              lpiKey: [{ '#text': '6940L000299640' }],
              logicalStatus: [{ '#text': '1' }],
              paoStartNumber: [{ '#text': '17' }],
              paoStartSuffix: [{ '#text': 'A' }]
            }]
          },
          {
            LandPropertyIdentifier: [{
              startDate: [{ '#text': '2016-01-22' }],
              lastUpdateDate: [{ '#text': '2016-02-07' }],
              entryDate: [{ '#text': '2016-01-18' }],
              lpiKey: [{ '#text': '6940L000150332' }],
              logicalStatus: [{ '#text': '1' }],
              paoStartNumber: [{ '#text': '17' }],
              paoStartSuffix: [{ '#text': 'A' }]
            }]
          }
        ]
      }

      collapseMatchingLpis(uprnNode)

      expect(uprnNode.landPropertyIdentifierMember.length).to.eql(1)
      const lpi = uprnNode.landPropertyIdentifierMember[0].LandPropertyIdentifier[0]
      // take most recent
      expect(lpi.lpiKey[0]['#text']).to.eql('6940L000299640')
    })

    it('two lpis, one other', () => {
      const uprnNode = {
        landPropertyIdentifierMember: [
          {
            LandPropertyIdentifier: [{
              startDate: [{ '#text': '2018-09-05' }],
              lastUpdateDate: [{ '#text': '2018-09-22' }],
              entryDate: [{ '#text': '2018-06-27' }],
              lpiKey: [{ '#text': '6940L000299640' }],
              logicalStatus: [{ '#text': '1' }],
              paoStartNumber: [{ '#text': '17' }],
              paoStartSuffix: [{ '#text': 'A' }]
            }]
          },
          {
            LandPropertyIdentifier: [{
              startDate: [{ '#text': '2016-01-22' }],
              lastUpdateDate: [{ '#text': '2016-02-07' }],
              entryDate: [{ '#text': '2016-01-18' }],
              lpiKey: [{ '#text': '6940L000150332' }],
              logicalStatus: [{ '#text': '1' }],
              paoStartNumber: [{ '#text': '17' }],
              paoStartSuffix: [{ '#text': 'A' }]
            }]
          },
          {
            LandPropertyIdentifier: [{
              lpiKey: [{ '#text': '6940L000000038' }],
              logicalStatus: [{ '#text': '8' }]
            }]
          }
        ]
      }

      collapseMatchingLpis(uprnNode)

      expect(uprnNode.landPropertyIdentifierMember.length).to.eql(2)
      const lpi0 = uprnNode.landPropertyIdentifierMember[0].LandPropertyIdentifier[0]
      const lpi1 = uprnNode.landPropertyIdentifierMember[1].LandPropertyIdentifier[0]
      // take most recent
      expect(lpi0.lpiKey[0]['#text']).to.eql('6940L000299640')
      expect(lpi1.lpiKey[0]['#text']).to.eql('6940L000000038')
    })
  })

  describe('matching status, text to merge', () => {
    it('paoText in both languages', () => {
      const uprnNode = {
        landPropertyIdentifierMember: [
          {
            LandPropertyIdentifier: [{
              startDate: [{ '#text': '2007-10-26' }],
              lastUpdateDate: [{ '#text': '2016-02-10' }],
              entryDate: [{ '#text': '2013-01-09' }],
              lpiKey: [{ '#text': '6950L000063307' }],
              logicalStatus: [{ '#text': '1' }],
              paoText: [{ en: [{ '#text': 'ST ATHAN RECREATION GROUND' }] }],
              usrn: [{ '#text': '41500415' }],
              usrnMatchIndicator: [{ '#text': '1' }]
            }]
          },
          {
            LandPropertyIdentifier: [{
              startDate: [{ '#text': '2012-12-05' }],
              lastUpdateDate: [{ '#text': '2016-02-10' }],
              entryDate: [{ '#text': '2013-01-09' }],
              lpiKey: [{ '#text': '6950L000281013' }],
              logicalStatus: [{ '#text': '1' }],
              paoText: [{ cy: [{ '#text': 'ST ATHAN RECREATION GROUND' }] }],
              usrn: [{ '#text': '41500415' }],
              usrnMatchIndicator: [{ '#text': '1' }]
            }]
          }
        ]
      }

      collapseMatchingLpis(uprnNode)

      expect(uprnNode.landPropertyIdentifierMember.length).to.eql(1)
      const lpi = uprnNode.landPropertyIdentifierMember[0].LandPropertyIdentifier[0]
      // take most recent
      expect(lpi.paoText.length).to.eql(2)
      expect(lpi.paoText).to.have.deep.members([
        { cy: [{ '#text': 'ST ATHAN RECREATION GROUND' }] },
        { en: [{ '#text': 'ST ATHAN RECREATION GROUND' }] }
      ])
    })
  })
})
