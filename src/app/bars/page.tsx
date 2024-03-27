"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DataFrame, readCSV } from "danfojs";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function Selector({
  state,
  city,
  setState,
  setCity,
  curr_cities,
}: {
  state: string;
  city: string;
  setState: Dispatch<SetStateAction<string>>;
  setCity: Dispatch<SetStateAction<string>>;
  curr_cities: string[];
}) {
  const states = [
    "AL",
    "AR",
    "AZ",
    "CA",
    "CO",
    "CT",
    "DC",
    "DE",
    "FL",
    "GA",
    "IA",
    "ID",
    "IL",
    "IN",
    "KS",
    "KY",
    "LA",
    "MA",
    "MD",
    "ME",
    "MI",
    "MN",
    "MO",
    "MS",
    "MT",
    "NC",
    "ND",
    "NE",
    "NH",
    "NJ",
    "NM",
    "NV",
    "NY",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VA",
    "VT",
    "WA",
    "WI",
    "WV",
    "WY",
  ];

  return (
    <div className="border-2 rounded-md bg-base-200 p-8">
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">State:</span>
        </div>
        <select
          className="select select-bordered"
          value={state}
          onChange={(e) => {
            setState(e.target.value);
          }}
        >
          {states.map((state: string, i: number) => (
            <option key={i}>{state}</option>
          ))}
        </select>
      </label>
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">City:</span>
        </div>
        <select
          className="select select-bordered"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
          }}
        >
          {curr_cities.map((city: string, i: number) => (
            <option key={i}>{city}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

function SinglePlot({
  data,
  xKey,
  lineKey,
}: {
  data: any[];
  xKey: string;
  lineKey: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        width={500}
        height={400}
        data={data}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={lineKey} barSize={20} fill="#413ea0" />
        <Line type="monotone" dataKey={lineKey} stroke="#ff7300" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function BarsComponent() {
  const [state, setState] = useState("CA");
  const [city, setCity] = useState("");

  const [currCities, setCurrCities] = useState<string[]>([""]);

  const [countData, setCountData] = useState<any[]>([]);
  const [severityData, setSeverityData] = useState<any[]>([]);
  const [severeCountData, setSevereCountData] = useState<any[]>([]);

  useEffect(() => {
    readCSV("state_city_year_grouped.csv").then((df) => {
      const curr_df = df.loc({
        rows: df["State"].eq(state),
      });
      const curr_cities = ["All Cities", ...curr_df["City"].unique()["values"]];
      setCurrCities(curr_cities);
      setCity(curr_cities[0]);
    });
  }, [state]);

  useEffect(() => {
    readCSV("state_city_year_grouped.csv").then((df) => {
      if (city === "All Cities") {
        let dfn = df.copy();
        dfn = dfn.addColumn(
          "Total_Severity",
          df["Mean_Severity"].mul(df["Count"])
        );
        dfn = dfn.groupby(["State", "Year"]).agg({
          Count: ["sum"],
          "High Severity Count": ["sum"],
          Total_Severity: ["sum"],
        });
        dfn = dfn.addColumn(
          "Mean_Mean_Severity",
          dfn["Total_Severity_sum"].div(dfn["Count_sum"])
        );

        const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
        let countDataTemp: any[] = [];
        let severityDataTemp: any[] = [];
        let severeCountDataTemp: any[] = [];
        years.map((year) => {
          const curr_df = dfn.loc({
            rows: dfn["State"]
              .eq(state)
              //   .and(dfn["City"].eq(city))
              .and(dfn["Year"].eq(year)),
          });

          let count_values = curr_df["Count_sum"].values;
          if (count_values.length === 0) {
            count_values.push(0);
          }
          countDataTemp.push({
            Year: year,
            "Number of Accidents": count_values[0],
          });

          let severity_values = curr_df["Mean_Mean_Severity"].values;
          if (severity_values.length === 0) {
            severity_values.push(0);
          }
          severityDataTemp.push({
            Year: year,
            "Mean Severity": severity_values[0],
          });

          let severe_count_values = curr_df["High Severity Count_sum"].values;
          if (severe_count_values.length === 0) {
            severe_count_values.push(0);
          }
          severeCountDataTemp.push({
            Year: year,
            "Number of High Severity Accidents": severe_count_values[0],
          });
        });
        setCountData(countDataTemp);
        setSeverityData(severityDataTemp);
        setSevereCountData(severeCountDataTemp);
      } else {
        const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];

        let countDataTemp: any[] = [];
        let severityDataTemp: any[] = [];
        let severeCountDataTemp: any[] = [];
        years.map((year) => {
          const curr_df = df.loc({
            rows: df["State"]
              .eq(state)
              .and(df["City"].eq(city))
              .and(df["Year"].eq(year)),
          });

          let count_values = curr_df["Count"].values;
          if (count_values.length === 0) {
            count_values.push(0);
          }
          countDataTemp.push({
            Year: year,
            "Number of Accidents": count_values[0],
          });

          let severity_values = curr_df["Mean_Severity"].values;
          if (severity_values.length === 0) {
            severity_values.push(0);
          }
          severityDataTemp.push({
            Year: year,
            "Mean Severity": severity_values[0],
          });

          let severe_count_values = curr_df["High Severity Count"].values;
          if (severe_count_values.length === 0) {
            severe_count_values.push(0);
          }
          severeCountDataTemp.push({
            Year: year,
            "Number of High Severity Accidents": severe_count_values[0],
          });
        });

        setCountData(countDataTemp);
        setSeverityData(severityDataTemp);
        setSevereCountData(severeCountDataTemp);
      }
    });
  }, [state, city]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center space-y-4">
      <div className="w-full h-full flex justify-center items-center space-x-4">
        <div className="w-full h-full flex justify-center items-center ">
          <Selector
            state={state}
            city={city}
            setState={setState}
            setCity={setCity}
            curr_cities={currCities}
          />
        </div>
        <div className="w-full h-full rounded-md p-2 border-[1px] border-slate-400 bg-slate-100">
          <SinglePlot
            data={countData}
            xKey="Year"
            lineKey="Number of Accidents"
          />
        </div>
      </div>
      <div className="w-full h-full flex justify-center items-center space-x-4">
        <div className="w-full h-full rounded-md p-2 border-[1px] border-slate-400 bg-slate-100">
          <SinglePlot data={severityData} xKey="Year" lineKey="Mean Severity" />
        </div>
        <div className="w-full h-full rounded-md p-2 border-[1px] border-slate-400 bg-slate-100">
          <SinglePlot
            data={severeCountData}
            xKey="Year"
            lineKey="Number of High Severity Accidents"
          />
        </div>
      </div>
    </div>
  );
}

export default function Bars() {
  return (
    <div className="w-screen h-screen bg-slate-50 p-10 text-black">
      <BarsComponent />
    </div>
  );
}
