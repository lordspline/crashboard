export function getSeason(month) {
  if (month >= 3 && month <= 5) return "Spring";
  if (month >= 6 && month <= 8) return "Summer";
  if (month >= 9 && month <= 11) return "Fall";
  return "Winter";
}

export function categorizeWeatherCondition(condition) {
  if (!condition) return "Unknown";
  const lowerCaseCondition = condition.toLowerCase();

  if (
    lowerCaseCondition.includes("clear") ||
    lowerCaseCondition.includes("fair")
  )
    return "clear";
  else if (lowerCaseCondition.includes("cloud")) return "Cloudy";
  else if (
    lowerCaseCondition.includes("rain") ||
    lowerCaseCondition.includes("showers")
  )
    return "rain";
  else if (
    lowerCaseCondition.includes("snow") ||
    lowerCaseCondition.includes("sleet") ||
    lowerCaseCondition.includes("ice")
  )
    return "snow";
  else if (
    lowerCaseCondition.includes("fog") ||
    lowerCaseCondition.includes("mist")
  )
    return "fog";
  else if (lowerCaseCondition.includes("thunder")) return "thunderstorm";
  else if (lowerCaseCondition.includes("drizzle")) return "drizzle";
  else if (
    lowerCaseCondition.includes("windy") ||
    lowerCaseCondition.includes("blowing") ||
    lowerCaseCondition.includes("squalls")
  )
    return "windy";
  else if (lowerCaseCondition.includes("haze")) return "haze";
  else if (
    lowerCaseCondition.includes("dust") ||
    lowerCaseCondition.includes("sand")
  )
    return "dust";
  else if (
    lowerCaseCondition.includes("volcanic ash") ||
    lowerCaseCondition.includes("tornado") ||
    lowerCaseCondition.includes("funnel cloud")
  )
    return "special";
  else return "other";
}

export function areArraysEqual(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  }

  const sortedArray1 = [...array1].sort();
  const sortedArray2 = [...array2].sort();

  for (let i = 0; i < sortedArray1.length; i++) {
    if (sortedArray1[i] !== sortedArray2[i]) {
      return false;
    }
  }

  return true;
}
