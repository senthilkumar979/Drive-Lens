"use client";

import {
  AreaChart,
  Area,
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
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="batteryFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="batteryStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2e3440" vertical={false} />
        <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#94a3b8", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#1e232b",
            border: "1px solid rgba(52, 211, 153, 0.3)",
            borderRadius: 10,
            color: "#f5f7fa",
          }}
          labelStyle={{ color: "#94a3b8" }}
        />
        <Area
          type="monotone"
          dataKey="battery"
          stroke="url(#batteryStroke)"
          strokeWidth={2.5}
          fill="url(#batteryFill)"
          isAnimationActive
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
