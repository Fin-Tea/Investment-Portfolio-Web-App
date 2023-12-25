export function formatDate(date) {
  if (date) {
    const iso = typeof date === "string" ? date : date.toISOString();
    let formattedDate = iso.replace(/[+.]/, " ");
    return formattedDate.split(" ")[0].replace("T", " ");
  }

  return date;
}

export function restoreDate(formattedDateStr) {
  if (formattedDateStr) {
    return `${formattedDateStr.trim().replace(" ", "T")}Z`;
  }
  return formattedDateStr;
}

export function formatObjectDates(objArray) {
  return objArray.map((obj) => {
    const newObj = { ...obj };
    for (let key in newObj) {
      if (key.includes("At") || key.includes("From") || key.includes("Until")) {
        newObj[key] = formatDate(newObj[key]);
      }
    }
    return newObj;
  });
}

export function toCapitalizedCase(str) {
  if (!str) {
    return str;
  }

  if (!str.length) {
    return str;
  }
  const firstLetter = str.substring(0, 1).toUpperCase();
  const restOfStr = str.substring(1).toLowerCase();

  return `${firstLetter}${restOfStr}`;
}
