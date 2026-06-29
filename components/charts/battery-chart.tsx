"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface BatteryChartProps {
  data: Array<{ timestamp: string; batteryLevel: number }>;
}

export const BatteryChart = ({ data }: BatteryChartProps) => {
  const chartData = data.map((d) => ({
    time: format(new Date(d.timestamp), "MMM d HH:mm"),
    battery: d.batteryLevel,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2e3440" />
        <XAxis dataKey="time" tick={{ fill: "#6f7782", fontSize: 10 }} />
        <YAxis domain={[0, 100]} tick={{ fill: "#6f7782", fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            background: "#1e232b",
            border: "1px solid #2e3440",
            borderRadius: 8,
          }}
        />
        <Line
          type="monotone"
          dataKey="battery"
          stroke="#00d084"
          strokeWidth={2}
          dot={false}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
