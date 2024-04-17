"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { readCSV } from "danfojs";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { readRemoteFile } from "react-papaparse";

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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function SeverityPiePlot({
  severityPieData,
  year,
}: {
  severityPieData: any;
  year: string;
}) {
  return (
    <div className="flex flex-col h-full w-full justify-center items-center border-[1px] border-slate-400 rounded-md space-y-4 bg-slate-100 py-1">
      {severityPieData ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={severityPieData[year]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              fill="#82ca9d"
              label
            >
              {severityPieData[year].map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend
              verticalAlign="top"
              align="left"
              wrapperStyle={{ fontSize: "10px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <></>
      )}
      <h1>{year}</h1>
    </div>
  );
}

function BarsComponent() {
  const [state, setState] = useState("CA");
  const [city, setCity] = useState("All Cities");

  const [currCities, setCurrCities] = useState<string[]>([""]);

  const [countData, setCountData] = useState<any[]>([]);
  const [severityData, setSeverityData] = useState<any[]>([]);
  const [severeCountData, setSevereCountData] = useState<any[]>([]);

  const [meanAccCount, setMeanAccCount] = useState<number>(0.0);
  const [meanSevereCount, setMeanSevereCount] = useState<number>(0.0);
  const [meanSeverity, setMeanSeverity] = useState<number>(0.0);
  const [meanDistance, setMeanDistance] = useState<number>(0.0);

  const [severityPieData, setSeverityPieData] = useState<any>(null);

  const [corrTempData, setCorrTempData] = useState<any[]>([]);

  useEffect(() => {
    // readRemoteFile("state_city_year_grouped.csv", {
    //   header: true,
    //   complete: (results) => {
    //     console.log("---------------------------");
    //     console.log("Results:", results["data"]);
    //     console.log("---------------------------");
    //   },
    //   download: true,
    // });
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
    // bar charts
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

    // number statistics
    if (city === "All Cities") {
      readCSV("numbers_state.csv").then((df) => {
        const curr_df = df.loc({
          rows: df["State"].eq(state),
        });
        setMeanAccCount(curr_df["Mean_Acc_Count"].values[0]);
        setMeanSevereCount(curr_df["Mean_Severe_Count"].values[0]);
        setMeanSeverity(curr_df["Mean_Severity"].values[0]);
        setMeanDistance(curr_df["Mean_Distance"].values[0]);
      });
    } else {
      readCSV("numbers_state_city.csv").then((df) => {
        const curr_df = df.loc({
          rows: df["State"].eq(state).and(df["City"].eq(city)),
        });
        console.log(curr_df["Mean_Acc_Count"].values[0]);
        setMeanAccCount(curr_df["Mean_Acc_Count"].values[0]);
        setMeanSevereCount(curr_df["Mean_Severe_Count"].values[0]);
        setMeanSeverity(curr_df["Mean_Severity"].values[0]);
        setMeanDistance(curr_df["Mean_Distance"].values[0]);
      });
    }

    // severity pie charts
    if (city === "All Cities") {
      readCSV("severity_pie_state_city_year.csv").then((df) => {
        const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
        var severityPieDataTemp: any = {};
        years.map((year) => {
          const curr_df = df.loc({
            rows: df["State"].eq(state).and(df["Year"].eq(year)),
          });

          let severity_1_count = curr_df["Count_1"].values;
          if (severity_1_count.length === 0) {
            severity_1_count.push(0);
          }
          let severity_2_count = curr_df["Count_2"].values;
          if (severity_2_count.length === 0) {
            severity_2_count.push(0);
          }
          let severity_3_count = curr_df["Count_3"].values;
          if (severity_3_count.length === 0) {
            severity_3_count.push(0);
          }
          let severity_4_count = curr_df["Count_4"].values;
          if (severity_4_count.length === 0) {
            severity_4_count.push(0);
          }
          severityPieDataTemp[year.toString()] = [
            { name: "Severity 1 Accidents", value: severity_1_count[0] },
            { name: "Severity 2 Accidents", value: severity_2_count[0] },
            { name: "Severity 3 Accidents", value: severity_3_count[0] },
            { name: "Severity 4 Accidents", value: severity_4_count[0] },
          ];
        });
        setSeverityPieData(severityPieDataTemp);
      });
    } else {
      readCSV("severity_pie_state_city_year.csv").then((df) => {
        const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
        var severityPieDataTemp: any = {};
        years.map((year) => {
          const curr_df = df.loc({
            rows: df["State"]
              .eq(state)
              .and(df["City"].eq(city))
              .and(df["Year"].eq(year)),
          });

          let severity_1_count = curr_df["Count_1"].values;
          if (severity_1_count.length === 0) {
            severity_1_count.push(0);
          }
          let severity_2_count = curr_df["Count_2"].values;
          if (severity_2_count.length === 0) {
            severity_2_count.push(0);
          }
          let severity_3_count = curr_df["Count_3"].values;
          if (severity_3_count.length === 0) {
            severity_3_count.push(0);
          }
          let severity_4_count = curr_df["Count_4"].values;
          if (severity_4_count.length === 0) {
            severity_4_count.push(0);
          }
          severityPieDataTemp[year.toString()] = [
            { name: "Severity 1 Accidents", value: severity_1_count[0] },
            { name: "Severity 2 Accidents", value: severity_2_count[0] },
            { name: "Severity 3 Accidents", value: severity_3_count[0] },
            { name: "Severity 4 Accidents", value: severity_4_count[0] },
          ];
        });
        setSeverityPieData(severityPieDataTemp);
      });
    }
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
        <div className="flex flex-col justify-center items-center w-full h-full rounded-md p-2 space-y-6">
          <div className="h-full w-full flex justify-center items-center space-x-6">
            <div className="flex flex-col h-full w-full justify-center items-center border-[1px] border-slate-400 rounded-md space-y-4 bg-slate-100">
              <h1 className="text-3xl">{meanAccCount.toPrecision(3)}</h1>
              <h1>Accidents Per Year on Average</h1>
            </div>
            <div className="flex flex-col h-full w-full justify-center items-center border-[1px] border-slate-400 rounded-md space-y-4 bg-slate-100">
              <h1 className="text-3xl">{meanSeverity.toPrecision(3)}</h1>
              <h1>Mean Accident Severity</h1>
            </div>
          </div>
          <div className="h-full w-full flex justify-center items-center space-x-6">
            <div className="flex flex-col h-full w-full justify-center items-center border-[1px] border-slate-400 rounded-md space-y-4 bg-slate-100">
              <h1 className="text-3xl">{meanSevereCount.toPrecision(3)}</h1>
              <h1>High-Severity Accidents Per Year on Average</h1>
            </div>
            <div className="flex flex-col h-full w-full justify-center items-center border-[1px] border-slate-400 rounded-md space-y-4 bg-slate-100">
              <h1 className="text-3xl">{meanDistance.toPrecision(3)}</h1>
              <h1>Mean Accident Distance</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-full flex justify-center items-center space-x-4">
        <div className="flex flex-col justify-center items-center w-full h-full rounded-md p-2 space-y-6">
          <div className="h-full w-full flex justify-center items-center space-x-6">
            <SeverityPiePlot severityPieData={severityPieData} year="2023" />
            <SeverityPiePlot severityPieData={severityPieData} year="2022" />
          </div>
          <div className="h-full w-full flex justify-center items-center space-x-6">
            <SeverityPiePlot severityPieData={severityPieData} year="2019" />
            <SeverityPiePlot severityPieData={severityPieData} year="2018" />
          </div>
        </div>
        <div className="flex flex-col justify-center items-center w-full h-full rounded-md p-2 space-y-6">
          <div className="h-full w-full flex justify-center items-center space-x-6">
            <SeverityPiePlot severityPieData={severityPieData} year="2021" />
            <SeverityPiePlot severityPieData={severityPieData} year="2020" />
          </div>
          <div className="h-full w-full flex justify-center items-center space-x-6">
            <SeverityPiePlot severityPieData={severityPieData} year="2017" />
            <SeverityPiePlot severityPieData={severityPieData} year="2016" />
          </div>
        </div>
      </div>

      <div className="w-full h-full flex justify-center items-center space-x-4">
        <div className="w-full h-full rounded-md p-2 border-[1px] border-slate-400 bg-slate-100">
          <SinglePlot
            data={countData}
            xKey="Year"
            lineKey="Number of Accidents"
          />
        </div>
        <div className="w-full h-full rounded-md p-2 border-[1px] border-slate-400 bg-slate-100">
          <SinglePlot data={severityData} xKey="Year" lineKey="Mean Severity" />
        </div>
      </div>
      <div className="w-full h-full flex justify-center items-center space-x-4">
        <div className="w-full h-full rounded-md p-2 border-[1px] border-slate-400 bg-slate-100">
          <SinglePlot
            data={severeCountData}
            xKey="Year"
            lineKey="Number of High Severity Accidents"
          />
        </div>
        <div className="w-full h-full rounded-md p-2 border-[1px] border-slate-400 bg-slate-100"></div>
      </div>
    </div>
  );
}

export default function Bars() {
  return (
    <div className="w-screen h-[200vh] bg-slate-50 p-10 text-black">
      <BarsComponent />
    </div>
  );
}
