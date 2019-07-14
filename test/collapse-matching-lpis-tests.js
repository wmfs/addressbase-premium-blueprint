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
              lpiKey: [{'#text': '123458'}],
              logicalStatus: [{'#text': '1'}]
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
              lpiKey: [{'#text': '123458'}],
              logicalStatus: [{'#text': '1'}]
            }]
          },
          {
            LandPropertyIdentifier: [{
              lpiKey: [{'#text': '123459'}],
              logicalStatus: [{'#text': '8'}]
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
              lpiKey: [{'#text': '123458'}],
              logicalStatus: [{'#text': '1'}]
            }]
          },
          {
            LandPropertyIdentifier: [{
              lpiKey: [{'#text': '123459'}],
              logicalStatus: [{'#text': '8'}]
            }]
          },
          {
            LandPropertyIdentifier: [{
              lpiKey: [{'#text': '123429'}],
              logicalStatus: [{'#text': '6'}]
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

/*
  <abpr:landPropertyIdentifierMember>
    <abpr:LandPropertyIdentifier>
      <abpr:lpiKey>6940L000000038</abpr:lpiKey>
      <abpr:logicalStatus>8</abpr:logicalStatus>
    </abpr:LandPropertyIdentifier>
    </abpr:landPropertyIdentifierMember>
  <abpr:landPropertyIdentifierMember>
    <abpr:LandPropertyIdentifier>
    <abpr:startDate>2016-01-22</abpr:startDate>
    <abpr:lastUpdateDate>2016-02-07</abpr:lastUpdateDate>
    <abpr:entryDate>2016-01-18</abpr:entryDate>
    <abpr:lpiKey>6940L000150332</abpr:lpiKey>
    <abpr:logicalStatus>1</abpr:logicalStatus>
    <abpr:paoStartNumber>17</abpr:paoStartNumber>
    <abpr:paoStartSuffix>A</abpr:paoStartSuffix>
    </abpr:LandPropertyIdentifier>
  </abpr:landPropertyIdentifierMember>
  <abpr:landPropertyIdentifierMember>
    <abpr:LandPropertyIdentifier>
    <abpr:startDate>2018-09-05</abpr:startDate>
    <abpr:lastUpdateDate>2018-09-22</abpr:lastUpdateDate>
    <abpr:entryDate>2018-06-27</abpr:entryDate>
    <abpr:lpiKey>6940L000299640</abpr:lpiKey>
    <abpr:logicalStatus>1</abpr:logicalStatus>
    <abpr:paoStartNumber>17</abpr:paoStartNumber>
    <abpr:paoStartSuffix>A</abpr:paoStartSuffix>
  </abpr:LandPropertyIdentifier>
*/
  })

})
