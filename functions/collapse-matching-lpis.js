const deepmerge = require('deepmerge')

function collapseMatchingLpis (uprnNode) {
  // In the addressbase premium data, we can have two LandPropertyIdentifier objects with
  // the same LPI Key and Status if, and only if, it has an address in both English and Welsh.
  // In that case, we merge the two LandPropertyIdentifiers together
  const lpiCount = uprnNode.landPropertyIdentifierMember.length
  if (lpiCount === 1) return uprnNode // nothing to do, so bail

  const dupes = keysWithSameStatus(uprnNode)
  if (dupes.length === 0) return uprnNode

  for (const dupe of dupes) {
    const targetLpi = dupe.shift()

    for (const lpiM of dupe) {
      const offset = lpiOffset(uprnNode, lpiM)
      uprnNode.landPropertyIdentifierMember.splice(offset, 1)
    }
  }
  /* for (const lpiKey of dupes) {
    const [engI, englishLpi] = findEnglish(uprnNode, lpiKey)
    const [welshI, welshLpi] = findWelsh(uprnNode, lpiKey)

    // remove the welsh lpiM
    uprnNode.landPropertyIdentifierMember.splice(welshI, 1)
    // strip out stuff which isn't welsh text
    for (const k of Object.keys(welshLpi)) {
      if (welshLpi[k][0]['#text']) {
        delete welshLpi[k]
      }
    }
    // merge into English. This is not a commentary on the history of our two great nations.
    const combinedLpi = deepmerge(englishLpi, welshLpi)
    uprnNode.landPropertyIdentifierMember[engI].LandPropertyIdentifier[0] = combinedLpi
  } */

  return uprnNode
} // collapseMatchingLpis

function lpiOffset (uprnNode, lpiM) {
  let index = 0;
  const key = lpiKeyValue(lpiM)
  for (const l of uprnNode.landPropertyIdentifierMember) {
    if (lpiKeyValue(l) === key) return index
    ++index
  }
  return -1
}

function findLpi (uprnNode, lpiKey, langLabel) {
  const lpiMs = uprnNode.landPropertyIdentifierMember
  for (let i = 0; i !== lpiMs.length; ++i) {
    const lpiM = lpiMs[i]
    if (lpiKeyValue(lpiM) !== lpiKey) {
      continue
    }
    // aha! now, does it have the right language?
    // search down for language label
    if (hasLanguage(lpiM, langLabel)) {
      return [i, lpiM.LandPropertyIdentifier[0]]
    }
  } // for ...

  throw new Error(`Could not find LPI with key ${lpiKey} and language ${langLabel}`)
} // findLpi

function hasLanguage (lpiM, langLabel) {
  const lpi = lpiM.LandPropertyIdentifier[0]
  for (const va of Object.values(lpi)) {
    // all the values are arrays of length 1
    // containing an object with either a '#text' member or a language member
    if (va[0][langLabel]) {
      return true
    }
  } // for ...
  return false
} // hasLanguage

function findEnglish (uprnNode, lpiKey) {
  return findLpi(uprnNode, lpiKey, 'en')
} // findEnglish

function findWelsh (uprnNode, lpiKey) {
  return findLpi(uprnNode, lpiKey, 'cy')
} // findWelsh

function lpiStatuses (uprnNode) {
  const statuses = new Set(
    uprnNode.landPropertyIdentifierMember.map(lpiM => lpiStatus(lpiM))
  );
  return [...statuses]
}

function keysWithSameStatus (uprnNode) {
  const sameStatusKeys = lpiStatuses(uprnNode)
    .map(status =>
      uprnNode.landPropertyIdentifierMember
        .filter(lpiM => lpiStatus(lpiM) === status)
        .sort(lpiDateSort)
    )
    .filter(keys => keys.length > 1)
  return sameStatusKeys
} // duplicateKeys

function lpiKeyValue (lpiM) {
  return lpiProperty(lpiM, 'lpiKey')
} // lpiKeyValue

function lpiStatus (lpiM) {
  return lpiProperty(lpiM, 'logicalStatus')
} // lpiKeyValue

function lpiUpdateDate (lpiM) {
  return lpiProperty(lpiM, 'lastUpdateDate')
}

function lpiProperty (lpiM, field) {
  return lpiM.LandPropertyIdentifier[0][field][0]['#text']
}

function lpiDateSort (l, r) {
  const lDate = lpiUpdateDate(l)
  const rDate = lpiUpdateDate(r)

  if (lDate && rDate) {
    if (lDate === rDate) return 0
    return (lDate > rDate) ? -1 : 1
  }

  const lKey = lpiKeyValue(l)
  const rKey = lpiKeyValue(r)
  return (lKey < rKey) ? -1 : 1
}

module.exports = function () {
  return collapseMatchingLpis
}
