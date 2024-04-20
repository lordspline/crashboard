import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "./utils";

export function Plot({
  data,
  xKey,
  lineKey,
  barKey,
  barName,
  lineName,
  children,
  xAxisOptions,
  legend = false,
}: {
  data: any[];
  xKey: string;
  lineKey?: string;
  barKey: string;
  barName: string;
  lineName?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ left: -20, right: 0 }}>
        {/* <CartesianGrid strokeDasharray="3 3" stroke="#eee" /> */}
        <XAxis dataKey={xKey} {...xAxisOptions} />
        <YAxis dataKey={barKey} tickFormatter={format} />
        <Tooltip />
        {legend && <Legend />}
        {children ? (
          children
        ) : (
          <>
            <Bar name={barName} dataKey={barKey} fill="#4589ff" />
            {lineKey && (
              <Line
                name={lineName}
                type="monotone"
                dataKey={lineKey}
                stroke="#08bdba"
              />
            )}
          </>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
