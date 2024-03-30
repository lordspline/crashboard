"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import React from "react";
import { Map } from "react-map-gl";
import maplibregl from "maplibre-gl";
import {
  AmbientLight,
  PointLight,
  LightingEffect,
  FlyToInterpolator,
} from "@deck.gl/core";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import DeckGL from "@deck.gl/react";
import "./style.scss";
import {
  StateAbbreviationsToNames,
  StatePos,
  WeatherConditions,
  YearStateAvailablity,
} from "./constants";
import { areArraysEqual, categorizeWeatherCondition, getSeason } from "./utils";

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000],
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000],
});

const lightingEffect = new LightingEffect({
  ambientLight,
  pointLight1,
  pointLight2,
});

const material = {
  ambient: 0.64,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [51, 51, 51],
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78],
];

function getTooltip({ object }) {
  if (!object) {
    return null;
  }
  const lat = object.position[1];
  const lng = object.position[0];
  const count = object.points.length;

  return `\
    latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ""}
    longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ""}
    ${count} Accidents`;
}

function MapView({ mapStyle = MAP_STYLE, upperPercentile = 100 }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [year, setYear] = useState("2023");
  const [state, setState] = useState("GA");

  const [coverage, setCoverage] = useState(0.7); // 데이터 어그리게이션이랑 관계없
  const [radius, setRadius] = useState(2000);

  const [color, setColor] = useState(1000);
  const [filter, setFilter] = useState(1000);

  const [season, setSeason] = useState("All");
  const [time, setTime] = useState("All");
  const [weather, setWeather] = useState("All");
  const [severity, setSeverity] = useState([1, 2, 3, 4]);

  const [domain, setDomain] = useState([0, 0]);
  const [fixDomain, setFixDomain] = useState(false);
  const prevFilters = useRef({ season, weather, severity });

  const stateOptions = useMemo(() => {
    return YearStateAvailablity[year];
  }, [year]);

  const viewState = useMemo(
    () => ({
      longitude: StatePos[state].longitude,
      latitude: StatePos[state].latitude,
      zoom: 7.5,
      pitch: 70,
      bearing: 0,
      transitionDuration: 1000,
      transitionInterpolator: new FlyToInterpolator(),
    }),
    [state]
  );

  //data
  useEffect(() => {
    setLoading(true);
    fetch(`/api/data?year=${year}&state=${state}`)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setFixDomain(false);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [year, state]);

  //fiters
  useEffect(() => {
    const filteredData = data.filter((item) => {
      if (season !== "All") {
        const month = new Date(item.Start_Time).getMonth() + 1;
        if (getSeason(month) !== season) return false;
      }
      if (weather !== "All") {
        if (categorizeWeatherCondition(item["Weather_Condition"]) !== weather)
          return false;
      }
      if (severity.length !== 4) {
        if (!severity.includes(Number(item["Severity"]))) return false;
      }
      return true;
    });

    setFilteredData(filteredData);

    if (
      prevFilters.current.season !== season ||
      prevFilters.current.weather !== weather ||
      !areArraysEqual(prevFilters.current.severity, severity)
    ) {
      setFixDomain(true);
      prevFilters.current = {
        season,
        weather,
        severity,
      };
    }
  }, [data, season, weather, severity]);

  const layers = useMemo(() => {
    console.log(fixDomain, radius);
    return [
      new HexagonLayer({
        id: "heatmap",
        colorRange,
        coverage,
        data: filteredData,
        elevationRange: [0, 3000],
        elevationScale: [data && data.length ? 50 : 0],
        elevationDomain: fixDomain ? domain : undefined,
        onSetElevationDomain: (minmax) => {
          if (!fixDomain) setDomain(minmax);
        },

        extruded: true,
        getPosition: (d) => {
          return [Number(d["Start_Lng"]), Number(d["Start_Lat"])];
        },
        pickable: true,
        radius,
        upperPercentile,
        material,

        transitions: {
          elevationScale: 1000,
          getElevationValue: 1000,
        },
      }),
    ];
  }, [filteredData, radius, coverage, fixDomain]);

  return (
    <div className="dark app" data-theme="dark">
      <div className="form-container z-10">
        <div className="form flex flex-col gap-10">
          <div className="section flex flex-col gap-1">
            <div className="title">Data</div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Year</span>
                {/* <span className="label-text-alt">Alt label</span> */}
              </div>
              <select
                defaultValue={2023}
                className="select select-bordered select-sm"
                onChange={(e) => {
                  setYear(e.target.value);
                }}
              >
                {Array(8)
                  .fill(2023)
                  .map((d, i) => d - i)
                  .map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
              </select>
              {/* <div className="label">
            <span className="label-text-alt">Alt label</span>
            <span className="label-text-alt">Alt label</span>
          </div> */}
            </label>

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">State</span>
              </div>
              <select
                defaultValue={"GA"}
                className="select select-bordered select-sm"
                onChange={(e) => {
                  setState(e.target.value);
                }}
              >
                {stateOptions.map((d) => (
                  <option key={d} value={d}>
                    {StateAbbreviationsToNames[d]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="section flex flex-col gap-1">
            <div className="title">Aggregation</div>

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Radius</span>
              </div>
              <input
                type="range"
                min={100}
                step={100}
                max={20000}
                defaultValue={radius}
                className="range range-sm"
                onChange={(e) => {
                  setRadius(e.target.value);
                  setFixDomain(false);
                }}
              />
            </label>
          </div>
          <div className="section flex flex-col gap-1">
            <div className="title">Filters</div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Seasons</span>
              </div>
              <select
                defaultValue={"All"}
                className="select select-bordered select-sm"
                onChange={(e) => {
                  setSeason(e.target.value);
                }}
              >
                <option value="All">All</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Fall">Fall</option>
                <option value="Winter">Winter</option>
              </select>
            </label>

            {/* <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Time</span>
              </div>
            </label> */}

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Weather Condition</span>
              </div>
              <select
                defaultValue={"All"}
                className="select select-bordered select-sm"
                onChange={(e) => {
                  setWeather(e.target.value);
                }}
              >
                {WeatherConditions.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Severity</span>
              </div>
              <div className="flex items-center gap-5">
                {[1, 2, 3, 4].map((d) => (
                  <label
                    key={d}
                    className="cursor-pointer flex items-center gap-2"
                  >
                    <span className="label-text">{d}</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={severity.includes(d)}
                      onChange={(e) => {
                        const isIn = severity.includes(d);
                        if (e.target.checked) {
                          !isIn && setSeverity([...severity, d]);
                        } else {
                          isIn && setSeverity(severity.filter((s) => s !== d));
                        }
                      }}
                    />
                  </label>
                ))}
              </div>
            </label>
          </div>
        </div>
      </div>
      <div className="vis">
        {loading && (
          <div className="flex  z-50 justify-center items-center w-full h-full">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        )}
        <DeckGL
          layers={layers}
          effects={[lightingEffect]}
          initialViewState={viewState}
          controller={true}
          getTooltip={getTooltip}
        >
          <Map
            reuseMaps
            mapLib={maplibregl}
            mapStyle={mapStyle}
            preventStyleDiffing={true}
          />
        </DeckGL>
      </div>
    </div>
  );
}

export default function Home() {
  return <MapView mapStyle={MAP_STYLE} upperPercentile={100} />;
}
