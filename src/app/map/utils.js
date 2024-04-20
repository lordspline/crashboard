"use client";
import * as d3 from "d3";

export const format = d3.format(",");
// export const format = d3.format(",.2f");

export const processData = (data) => {
  data.forEach((d) => {
    [
      "Severity",
      "Temperature(F)",
      "Humidity(%)",
      "Visibility(mi)",
      "Wind_Speed(mph)",
      "Precipitation(in)",
    ].forEach((c) => {
      d[c] = Number(d[c]);
    });
  });
  return data;
};

export const processTrendData = (data) => {
  data.forEach((d) => {
    [
      "Severity1Count",
      "Severity2Count",
      "Severity3Count",
      "Severity4Count",
      "TotalAccidentCount",
    ].forEach((c) => {
      d[c] = Number(d[c]);
    });
  });
  return data;
};

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
  else if (lowerCaseCondition.includes("cloud")) return "cloudy";
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

export function isEqual(value, other) {
  if (typeof value !== typeof other) return false;

  if (Array.isArray(value) && Array.isArray(other)) {
    if (value.length !== other.length) return false;
    const sortedValue = [...value].sort();
    const sortedOther = [...other].sort();
    for (let i = 0; i < sortedValue.length; i++) {
      if (!isEqual(sortedValue[i], sortedOther[i])) return false;
    }
    return true;
  }

  if (typeof value === "object" && value !== null && other !== null) {
    const valueKeys = Object.keys(value);
    const otherKeys = Object.keys(other);
    if (valueKeys.length !== otherKeys.length) return false;
    for (const key of valueKeys) {
      if (!otherKeys.includes(key) || !isEqual(value[key], other[key]))
        return false;
    }
    return true;
  }

  return value === other;
}
