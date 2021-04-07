
function streetsConverter () {
  return function streetsConverter (sourceRow, callback) {
    const output = {
      usrn: sourceRow.usrn,
      counter: 1,
      state: sourceRow.state,
      description: sourceRow.description,
      locality: sourceRow.locality,
      townName: sourceRow.townName,
      administrativeArea: sourceRow.administrativeArea,
      surface: sourceRow.surface,
      classification: sourceRow.classification,
      startX: sourceRow.startX,
      startY: sourceRow.startY,
      endX: sourceRow.endX,
      endY: sourceRow.endY,
      startLongitude: sourceRow.startLongitude,
      startLatitude: sourceRow.startLatitude,
      endLongitude: sourceRow.endLongitude,
      endLatitude: sourceRow.endLatitude,
      dataSource: 'OrdnanceSurvey'
    }

    callback(null, output)
  }
}

module.exports = streetsConverter
