export function getNewOrUpdatedRows(formRows, dirtyRows) {
  return formRows.reduce((acc, formRow, index) => {
    console.log("formRow", formRow);
    const isDirtyRow =
      index < formRows.length &&
      dirtyRows &&
      dirtyRows[index] &&
      Object.keys(dirtyRows[index]).length > 0;
    if (formRow.isNew) {
      const { id, isNew, ...rest } = formRow;
      acc.push({ ...rest });
    } else if (isDirtyRow) {
      acc.push(formRow);
    }
    return acc;
  }, []);
}

export function calcRewardRiskRatio({ entry, exit, stopLoss }) {
  return !!entry && !!exit && !!stopLoss
    ? Math.round(Math.abs((exit - entry) / (entry - stopLoss)) * 100) / 100 // TODO: Return null if numbers don't make sense
    : null;
}

export function appendQueryParam(endpoint, paramKey, paramValue) {
  if (endpoint) {
    const appendOrCreate = endpoint.includes("?") ? "&" : "?";
    return `${endpoint}${appendOrCreate}${paramKey}=${paramValue}`;
  }

  return endpoint;
}
