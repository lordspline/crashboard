import React, { useMemo } from "react";
import { StateAbbreviationsToNames, WeatherConditions } from "./constants";
import * as d3 from "d3";
import dayjs from "dayjs";
import { Plot } from "./StatChart";
import { Area, AreaChart, Bar, ResponsiveContainer, Tooltip } from "recharts";
import { categorizeWeatherCondition, format } from "./utils";

const Analysis = ({
  data,
  state,
  unselect,
  severity,
  period,
  time,
  weather,
}) => {
  const cities = useMemo(() => {
    if (!data) return;
    return Array.from(new Set(data.map((d) => d.source.City)));
  }, [data]);

  // const stateTrend = useMemo(() => {
  //   if (!trendData) return;
  //   return trendData.filter((d) => d.State === state);
  // }, [trendData]);

  const severityStat = useMemo(() => {
    if (!data) return;
    const group = d3.group(data, (d) => d.source.Severity);
    const res = {};
    [1, 2, 3, 4].forEach((key) => {
      res[key] = group?.get(key)?.length || 0;
    });
    return res;
  }, [data]);

  const dailyTrend = useMemo(() => {
    if (!data) return;
    const group = d3.group(
      data,
      (d) => dayjs(d.source.Start_Time).format("YYYY-MM-DD"),
      (d) => d.source.Severity
    );
    return Array.from(group)
      .map((d) => {
        const res = { date: new Date(d[0]) };

        const severityMap = d[1];
        severityMap.forEach((value, key) => {
          res[`severity${key}`] = value.length;
        });
        return res;
      })
      .sort((a, b) => a.date - b.date);
  }, [data]);

  const weatherStat = useMemo(() => {
    if (!data) return;
    const group = d3.group(
      data,
      (d) => categorizeWeatherCondition(d.source.Weather_Condition),
      (d) => d.source.Severity
    );

    return WeatherConditions.map((d) => {
      const res = { weather: d.value };
      const severityMap = group.get(d.value);
      [1, 2, 3, 4].forEach((key) => {
        res[`severity${key}`] = severityMap?.get(key)?.length || 0;
      });

      return res;
    }).filter((d) => d.weather !== "all");
  }, [data]);

  const severityColor = {
    1: "#bae6ff",
    2: "#08bdba",
    3: "#4589ff",
    4: "#8a3ffc",
  };

  if (!data) return null;
  return (
    <div className="analysis-container z-10">
      <div className="content flex flex-col gap-10">
        <div className="section flex flex-col gap-1">
          <div className="head">
            <div className="title">Area Analysis</div>
            <div
              className="close"
              onClick={() => {
                unselect();
              }}
            >
              <svg
                className="w-6 h-6"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path strokeWidth="1.6" d="M6 18 17.94 6M18 18 6.06 6" />
              </svg>
            </div>
          </div>
          <div className="content-body">
            <div className="item-container info">
              <div className="item">
                <span>State</span>
                <span>{StateAbbreviationsToNames[state]}</span>
              </div>
              <div className="item">
                <span>Cities</span>
                <span className="text-right">{cities.join(", ")}</span>
              </div>
            </div>
            <div className="item-container filtered">
              <div className="title">Filter applied</div>
              <div className="item">
                <span>Period</span>
                <span>
                  {period[0].format("MMM D, YYYY")} -{" "}
                  {period[1].format("MMM D, YYYY")}
                </span>
              </div>
              <div className="item">
                <span>Time</span>
                <span>
                  {time[0]} - {time[1]}
                </span>
              </div>
              <div className="item">
                <span>Weather Condition</span>
                <span>{weather}</span>
              </div>
              <div className="item">
                <span>Severity</span>
                <span>{severity.join(", ")}</span>
              </div>
            </div>
            <div className="item-container stat-info">
              <div className="title">Statistics</div>
              <div className="item">
                <span>Total number of Accidents</span>{" "}
                <span>{format(data.length)}</span>
              </div>
              {[1, 2, 3, 4].map((d) => (
                <div className="item" key={d}>
                  <div className="item-title">
                    <span
                      className="chip"
                      style={{ background: severityColor[d] }}
                    ></span>
                    <span> Severity {d}</span>
                  </div>
                  <div>{format(severityStat[d])}</div>
                </div>
              ))}
            </div>
            <div className="item-container">
              <div className="title">Daily Accident Counts</div>
              <div className="chart w-full h-[120px]">
                <Plot
                  data={dailyTrend}
                  xKey="date"
                  xAxisOptions={{
                    tickFormatter: (d) => dayjs(d).format("MMM D, YYYY"),
                    scale: "time",
                    // domain: period,
                  }}
                >
                  <Bar
                    dataKey="severity1"
                    dataName="severity 1"
                    fill="#bae6ff"
                    stackId={"date"}
                  />
                  <Bar
                    dataKey="severity2"
                    dataName="severity 2"
                    fill="#08bdba"
                    stackId={"date"}
                  />
                  <Bar
                    dataKey="severity3"
                    dataName="severity 3"
                    fill="#4589ff"
                    stackId={"date"}
                  />
                  <Bar
                    dataKey="severity4"
                    dataName="severity 4"
                    fill="#8a3ffc"
                    stackId={"date"}
                  />
                </Plot>
              </div>
            </div>
            <div className="item-container">
              <div className="title">Accident Counts by Weather Conditions</div>
              <div className="chart w-full h-[120px]">
                <Plot
                  data={weatherStat}
                  xKey="weather"
                  xAxisOptions={{ interval: 0, angle: -45, textAnchor: "end" }}
                >
                  <Bar
                    dataKey="severity1"
                    dataName="severity 1"
                    fill="#bae6ff"
                    stackId={"weather"}
                  />
                  <Bar
                    dataKey="severity2"
                    dataName="severity 2"
                    fill="#08bdba"
                    stackId={"weather"}
                  />
                  <Bar
                    dataKey="severity3"
                    dataName="severity 3"
                    stackId={"weather"}
                    fill="#4589ff"
                  />
                  <Bar
                    dataKey="severity4"
                    dataName="severity 4"
                    fill="#8a3ffc"
                    stackId={"weather"}
                  />
                </Plot>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="section">
          <div className="title">State Analysis</div>

          <div className="trend">
            <div className="title">
              Number of accidents in {StateAbbreviationsToNames[state]} over
              time (2016 - 2023)
            </div>
            <div className="w-full h-[200px]">
              <Plot
                data={stateTrend}
                xKey="Year"
                barKey="TotalAccidentCount"
                barName="Total Accident Count"
                lineKey="Severity4Count"
                lineName="Severity 4 Accident Count"
              />
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Analysis;
