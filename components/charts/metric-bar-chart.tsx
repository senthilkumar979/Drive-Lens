"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MetricBarChartProps {
  data: Array<{ label: string; value: number }>;
  color?: string;
}

export const MetricBarChart = ({ data, color = "#2d7ff9" }: MetricBarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2e3440" />
        <XAxis dataKey="label" tick={{ fill: "#6f7782", fontSize: 10 }} />
        <YAxis tick={{ fill: "#6f7782", fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            background: "#1e232b",
            border: "1px solid #2e3440",
            borderRadius: 8,
          }}
        />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} isAnimationActive />
      </BarChart>
    </ResponsiveContainer>
  );
};
