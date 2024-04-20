"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import React from "react";
import { Map } from "react-map-gl";
import maplibregl from "maplibre-gl";
import { FlyToInterpolator } from "@deck.gl/core";
import { HexagonLayer, HeatmapLayer } from "@deck.gl/aggregation-layers";
import DeckGL from "@deck.gl/react";
import "./style.scss";
import {
  StatePos,
  lightingEffect,
  material,
  MAP_STYLE,
  colorRange,
} from "./constants";
import {
  processData,
  processTrendData,
  categorizeWeatherCondition,
  getSeason,
  isEqual,
  format,
} from "./utils";
import dayjs from "dayjs";
import { readRemoteFile } from "react-papaparse";
import Filter from "./Filter";
import Analysis from "./Analysis";

import { debounce } from "lodash";
import { ConfigProvider, theme } from "antd";

function getTooltip({ object } = {}) {
  if (!object) {
    return null;
  }
  const lat = object.position[1];
  const lng = object.position[0];
  const count = object.points.length;
  const cities = Array.from(new Set(object.points.map((d) => d.source.City)));

  return `\
    ${cities.join(", ")}
    latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ""}
    longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ""}
    ${format(count)} Accidents`;
}

const defaultFilters = {
  // season: "All",
  period: [dayjs("2023-01-01"), dayjs("2023-12-31")],
  time: [0, 24],
  weather: "All",
  severity: [1, 2, 3, 4],
};

function MapView({ mapStyle = MAP_STYLE, upperPercentile = 100 }) {
  const [tab, setTab] = useState("history");

  const [selectedData, setSelectedData] = useState();
  const [selectedIdx, setSelectedIdx] = useState();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [predictData, setPredictData] = useState();

  const [year, setYear] = useState("2023");
  const [state, setState] = useState("GA");

  const [coverage, setCoverage] = useState(0.7);
  const [radius, setRadius] = useState(2000);

  // const [color, setColor] = useState(1000);
  // const [filter, setFilter] = useState(1000);

  // const [season, setSeason] = useState(defaultFilters.season);
  const [period, setPeriod] = useState(defaultFilters.period);
  const [time, setTime] = useState(defaultFilters.time);
  const [weather, setWeather] = useState(defaultFilters.weather);
  const [severity, setSeverity] = useState(defaultFilters.severity);

  // const [domain, setDomain] = useState();
  const [colorDomain, setColorDomain] = useState();

  // const prevState = useRef({ year, state, radius });

  // useEffect(() => {
  //   prevState.current = { year, state, radius };
  // }, [year, state, radius]);

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

    readRemoteFile(`data_year_state/data_${year}_${state}.csv`, {
      header: true,
      complete: (results) => {
        const data = results.data;
        setData(processData(data));
        // resetFilters();
        unselect();
        setLoading(false);
      },
    });
  }, [year, state]);

  useEffect(() => {
    readRemoteFile(`validated_data.csv`, {
      header: true,
      complete: (results) => {
        const data = results.data;
        setPredictData(processData(data));
      },
    });
  }, []);

  const debounceFiltering = debounce(() => {
    const filteredData = data.filter((item) => {
      // if (season !== "All") {
      //   const month = new Date(item.Start_Time).getMonth() + 1;
      //   if (getSeason(month) !== season) return false;
      // }

      if (weather !== "All") {
        if (categorizeWeatherCondition(item["Weather_Condition"]) !== weather)
          return false;
      }
      if (severity.length !== 4) {
        if (!severity.includes(Number(item["Severity"]))) return false;
      }

      if (period) {
        const year = 2000;
        const startMonthDay = dayjs(`${year}-${period[0].format("MM-DD")}`);
        const endMonthDay = dayjs(`${year}-${period[1].format("MM-DD")}`);
        const checkMonthDay = dayjs(
          `${year}-${dayjs(item["Start_Time"]).format("MM-DD")}`
        );

        const isBetween =
          checkMonthDay.isAfter(startMonthDay) &&
          checkMonthDay.isBefore(endMonthDay);

        if (!isBetween) return false;
      }

      if (!(time[0] === 0 && time[1] === 24)) {
        const hour = new Date(item["Start_Time"]).getHours();
        const [startHour, endHour] = time;
        if (!(hour >= startHour && hour < endHour)) return false;
      }
      return true;
    });

    setFilteredData(filteredData);
  }, 300);

  const resetFilters = () => {
    const { weather, severity, time, period } = defaultFilters;
    setPeriod(period);
    setTime(time);
    setWeather(weather);
    setSeverity(severity);
  };

  const unselect = () => {
    setSelectedIdx(undefined);
    setSelectedData(undefined);
  };

  const onChangeTab = () => {
    // setYear("2023");
    // resetFilters();
    unselect();
    setTab((prev) => (prev === "history" ? "prediction" : "history"));
  };

  const onChangeRadius = (e) => {
    // resetFilters();
    unselect();
    setRadius(e.target.value);
  };

  //fiters
  useEffect(() => {
    unselect();
    debounceFiltering();
    return () => debounceFiltering.cancel();
  }, [data, weather, severity, time, period]);

  const layers = useMemo(() => {
    if (tab === "prediction") {
      const layer = new HeatmapLayer({
        id: "heatmap-layer",
        data: predictData.filter((d) => d.State === state),
        // pickable: true,
        colorRange,
        // aggregation: "SUM",
        getPosition: (d) => {
          return [Number(d["Start_Lng"]), Number(d["Start_Lat"])];
        },
        getWeight: (d) => {
          return 1;
        },
        radiusPixels: 25,
      });

      return [layer];
    } else {
      const layer = new HexagonLayer({
        id: "hexagon-layer",
        colorRange,
        coverage,
        // getColorWeight: (d) => Number(d["Severity"]),
        // colorAggregation: "MEAN",
        onSetColorDomain: (domain) => {
          setColorDomain(domain);
        },
        data: filteredData || [],
        elevationRange: [0, 3000],
        elevationScale: [filteredData && filteredData.length ? 50 : 0],
        // elevationDomain: domain,
        // onSetElevationDomain: (minmax) => {
        //   if (
        //     !domain ||
        //     year !== prevState.current.year ||
        //     state !== prevState.current.state ||
        //     radius !== prevState.current.radius
        //   ) {
        //     setDomain(minmax);
        //   }
        // },
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
        autoHighlight: true,
        highlightColor: [255, 255, 255],
        highlightedObjectIndex: selectedIdx,
        // getColorWeight: (point) => point.length,
        // colorAggregation: "SUM",
        // getColorValue: (d, i) => {
        //   console.log(selectedIdx, d);
        //   return i === selectedIdx ? [0, 255, 0] : d.length;
        // },
        onHover: (info, event) => {
          // console.log(info, event);
        },
        onClick: (info, event) => {
          setSelectedIdx(info?.index);
          setSelectedData(info?.object.points);
        },
        // updateTriggers: {
        // getColorValue: [selectedIdx],
        // },
      });
      // console.log(layer);
      return [layer];
    }
  }, [filteredData, state, radius, coverage, selectedIdx, tab]);

  return (
    <ConfigProvider
      theme={{
        // 1. Use dark algorithm
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#a6adbb",
          colorBgBase: "#1e2329",
          colorTextBase: "#a6adbb",
          DatePicker: {
            cellActiveWithRangeBg: "rgba(30,35,41,0.3)",
            activeBg: "rgba(30,35,41,0.3)",
            activeShadow: "none",
          },
        },

        // 2. Combine dark algorithm and compact algorithm
        // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
      }}
    >
      <div className="dark app" data-theme="dark">
        <Filter
          {...{
            tab,
            setTab,
            year,
            setYear,
            state,
            setState,
            radius,
            setRadius,
            // setFixDomain,
            // season,
            // setSeason,
            period,
            setPeriod,
            time,
            setTime,
            weather,
            setWeather,
            severity,
            setSeverity,
            onChangeTab,
            onChangeRadius,
            colorDomain,
          }}
        ></Filter>
        {selectedData !== undefined && (
          <Analysis
            data={selectedData}
            unselect={unselect}
            {...{ year, state, radius, time, weather, severity, period }}
          ></Analysis>
        )}
        <div className="vis relative">
          {loading && (
            <div className="flex pointer-events-none select-none z-50 justify-center items-center w-full h-full absolute">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}
          <DeckGL
            layers={layers}
            effects={[lightingEffect]}
            initialViewState={viewState}
            controller={true}
            getTooltip={getTooltip}
            // onClick={}
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
    </ConfigProvider>
  );
}

export default function Home() {
  return <MapView mapStyle={MAP_STYLE} upperPercentile={100} />;
}
