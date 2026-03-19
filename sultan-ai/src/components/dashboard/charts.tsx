"use client";

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

interface RevenueChartProps {
  data: { month: string; revenue: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.08)" />
        <XAxis dataKey="month" tick={{ fill: "#a5c9bb", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#a5c9bb", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
        <Tooltip
          contentStyle={{ background: "#0d1a17", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 10, color: "#e8f5e9" }}
          formatter={(v) => [`PKR ${Number(v).toLocaleString()}`, "Revenue"]}
        />
        <Area type="monotone" dataKey="revenue" stroke="#D4AF37" fill="url(#revGrad)" strokeWidth={2.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface WeeklyChartProps {
  data: { day: string; sales: number }[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxDay = data.reduce((a, b) => (b.sales > a.sales ? b : a), data[0]);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={22}>
        <XAxis dataKey="day" tick={{ fill: "#a5c9bb", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          contentStyle={{ background: "#0d1a17", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 10, color: "#e8f5e9" }}
          formatter={(v) => [v, "Payments"]}
        />
        <Bar
          dataKey="sales"
          radius={[6, 6, 0, 0]}
          fill="#004D40"
          label={false}
        >
          {data.map((entry) => (
            <rect
              key={entry.day}
              fill={entry.day === maxDay?.day ? "#D4AF37" : "#004D40"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
