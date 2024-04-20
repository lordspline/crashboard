import React, { useMemo, useState } from "react";
import MultiRangeSlider from "./MultiRangeSlider";
import {
  StateAbbreviationsToNames,
  StatePos,
  WeatherConditions,
  YearStateAvailablity,
  colorRange,
} from "./constants";
import { format } from "./utils";
import { DatePicker, TimePicker } from "antd";
const { RangePicker } = DatePicker;
import dayjs from "dayjs";

const dateFormat = "YYYY-MM-DD";

const Filter = ({
  year,
  setYear,
  state,
  setState,
  radius,
  setRadius,
  setFixDomain,
  season,
  setSeason,
  weather,
  setWeather,
  severity,
  setSeverity,
  tab,
  onChangeTab,
  onChangeRadius,
  colorDomain,
  setPeriod,
  period,
  setTime,
  time,
}) => {
  const stateOptions = useMemo(() => {
    return YearStateAvailablity[year];
  }, [year]);

  return (
    <div className="form-container z-10">
      <div className="form flex flex-col gap-10">
        <div className="section flex flex-col gap-1">
          <div className="title">
            <div className="tabs">
              <div
                className={`tab ${tab === "history" ? "active" : ""}`}
                onClick={onChangeTab}
              >
                History
              </div>
              <div
                className={`tab ${tab === "prediction" ? "active" : ""}`}
                onClick={onChangeTab}
              >
                Prediction
              </div>
            </div>
          </div>
          {tab === "history" && (
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Year</span>
                {/* <span className="label-text-alt">Alt label</span> */}
              </div>
              <select
                value={year || "2023"}
                className="select select-bordered select-sm"
                onChange={(e) => {
                  setPeriod([
                    dayjs(`${e.target.value}-01-01`),
                    dayjs(`${e.target.value}-12-31`),
                  ]);
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
          )}

          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">State</span>
            </div>
            <select
              value={state || "GA"}
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
        {tab === "history" && (
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
                onChange={onChangeRadius}
              />
            </label>
          </div>
        )}
        {tab === "history" && (
          <div className="section flex flex-col gap-1">
            <div className="title">Filters</div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Date</span>
              </div>
              <RangePicker
                value={period}
                minDate={dayjs(`${year}-01-01`, dateFormat)}
                maxDate={dayjs(`${year}-12-31`, dateFormat)}
                format="MMM D"
                onChange={(d) => {
                  setPeriod(d);
                }}
              />
            </label>
            {/* <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Time</span>
              </div>
              <TimePicker.RangePicker
                value={time}
                format={"HH:mm"}
                onChange={(d) => {
                  setTime(d);
                }}
              />
            </label> */}

            {/* <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Seasons</span>
              </div>
              <select
                value={season || "All"}
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
            </label> */}

            <label className="form-control w-full max-w-xs relative">
              <div className="label">
                <span className="label-text">Time</span>
              </div>
              <MultiRangeSlider
                min={0}
                max={24}
                step={1}
                value={time}
                onChange={({ min, max }) => {
                  setTime([min, max]);
                }}
              ></MultiRangeSlider>
            </label>

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Weather Condition</span>
              </div>
              <select
                value={weather || "All"}
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
        )}
        {tab === "history" && (
          <div className="desc">
            <div className="pb-1">Accident Counts</div>
            <div className="legend">
              {colorRange.map((color, i) => (
                <span
                  key={i}
                  style={{ backgroundColor: `rgb(${color.join(",")})` }}
                ></span>
              ))}
            </div>
            <div className="legend-label">
              {colorDomain?.map((d) => (
                <span key={d}>{format(d)}</span>
              ))}
            </div>
          </div>
        )}
        {tab === "prediction" && (
          <div className="desc">
            <div className="title">Weather Forecast (Next 1 hour)</div>
            <div className="item">
              <span>Temperature(F)</span>
              <span>60.0</span>
            </div>
            <div className="item">
              <span>Humidity(%)</span>
              <span>27.0</span>
            </div>
            <div className="item">
              <span>Visibility(mi)</span>
              <span>10.0</span>
            </div>
            <div className="item">
              <span>Wind_Speed(mph)</span>
              <span>5.0</span>
            </div>
            <div className="item">
              <span>Precipitation(in)</span>
              <span>0.0</span>
            </div>
          </div>
        )}
        {tab === "prediction" && (
          <div className="desc">
            <div className="pb-1">Accident Probability</div>

            <div className="legend">
              {colorRange.map((color, i) => (
                <span
                  key={i}
                  style={{ backgroundColor: `rgb(${color.join(",")})` }}
                ></span>
              ))}
            </div>
            <div className="legend-label">
              <span>Low</span>
              <span>High </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filter;
