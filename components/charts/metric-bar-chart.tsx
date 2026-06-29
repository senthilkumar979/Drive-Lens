"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const BAR_COLORS = ["#a855f7", "#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4", "#10b981"];

interface MetricBarChartProps {
  data: Array<{ label: string; value: number }>;
  color?: string;
}

export const MetricBarChart = ({ data, color }: MetricBarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2e3440" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "#1e232b",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            borderRadius: 10,
            color: "#f5f7fa",
          }}
          labelStyle={{ color: "#94a3b8" }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive>
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={color ?? BAR_COLORS[index % BAR_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
