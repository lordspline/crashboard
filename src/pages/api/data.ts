import fs from "fs";
import path from "path";
import csv from "csv-parser";

export default function handler(req, res) {
  const { year, state } = req.query;

  if (!year) {
    return res.status(400).json({ error: "Year is required" });
  }
  if (!state) {
    return res.status(400).json({ error: "State is required" });
  }

  const results = [];

  const csvPath = path.resolve(
    process.cwd(),
    "public",
    "data_year_state",
    `data_${year}_${state}.csv`
  );

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", () => {
      res.status(200).json(results);
    });
}
