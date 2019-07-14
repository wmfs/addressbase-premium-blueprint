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

      mergeLpis(targetLpi, lpiM)
    }

    const targetOffset = lpiOffset(uprnNode, targetLpi)
    uprnNode.landPropertyIdentifierMember.splice(targetOffset, 1, targetLpi)
  }

  return uprnNode
} // collapseMatchingLpis

function mergeLpis (targetLpi, lpiM) {
  for (const k of Object.keys(lpiM.LandPropertyIdentifier[0])) {
    mergeField(
      targetLpi.LandPropertyIdentifier[0],
      lpiM.LandPropertyIdentifier[0],
      k
    )
  }
}

function mergeField (targetLpi, lpiM, field) {
  const value = lpiM[field]

  // if field doesn't exist in target, just merge
  if (!targetLpi[field]) {
    targetLpi[field] = value
    return
  }

  const isText = (Object.keys(value[0])[0]) === '#text'
  if (isText) {
    return // just text, so bail out
  }

  // mixed language!
  for (const v of value) {
    targetLpi[field].push(v)
  }
}

function lpiOffset (uprnNode, lpiM) {
  let index = 0
  const key = lpiKeyValue(lpiM)
  for (const l of uprnNode.landPropertyIdentifierMember) {
    if (lpiKeyValue(l) === key) return index
    ++index
  }
  return -1
}

function lpiStatuses (uprnNode) {
  const statuses = new Set(
    uprnNode.landPropertyIdentifierMember.map(lpiM => lpiStatus(lpiM))
  )
  return [...statuses]
}

function keysWithSameStatus (uprnNode) {
  return lpiStatuses(uprnNode)
    .map(status =>
      uprnNode.landPropertyIdentifierMember
        .filter(lpiM => lpiStatus(lpiM) === status)
        .sort(lpiDateSort)
    )
    .filter(keys => keys.length > 1)
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
