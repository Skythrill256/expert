"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Scatter, ScatterChart, ComposedChart } from "recharts";

interface TrendChartProps {
  data: Array<{
    date: string;
    baseScore: number;
    adjustedScore: number;
    hasLifestyleLog?: boolean;
    lifestyleQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  }>;
}

// Custom dot component to show lifestyle indicators
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  
  if (!payload.hasLifestyleLog) return null;
  
  // Color based on lifestyle quality
  const colors = {
    excellent: '#22c55e',  // green
    good: '#84cc16',       // lime
    fair: '#eab308',       // yellow
    poor: '#ef4444',       // red
  };
  
  const color = colors[payload.lifestyleQuality as keyof typeof colors] || '#6b7280';
  
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={color}
      stroke="#fff"
      strokeWidth={2}
      opacity={0.8}
    />
  );
};

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Health Score Trend</h2>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground">Excellent habits</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-lime-500"></div>
            <span className="text-muted-foreground">Good habits</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-muted-foreground">Fair habits</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="baseScoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.65 0.25 264)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.65 0.25 264)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="adjustedScoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.70 0.20 180)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.70 0.20 180)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.005 264 / 0.1)" />
          <XAxis
            dataKey="date"
            stroke="oklch(0.50 0.01 264)"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="oklch(0.50 0.01 264)"
            style={{ fontSize: "12px" }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(1 0 0 / 0.95)",
              border: "1px solid oklch(0.92 0.005 264 / 0.2)",
              borderRadius: "12px",
              backdropFilter: "blur(20px)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="baseScore"
            stroke="oklch(0.65 0.25 264)"
            strokeWidth={2}
            dot={false}
            fill="url(#baseScoreGradient)"
            name="Base Score"
          />
          <Line
            type="monotone"
            dataKey="adjustedScore"
            stroke="oklch(0.70 0.20 180)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
            fill="url(#adjustedScoreGradient)"
            name="Adjusted Score"
          />
          {/* Lifestyle habit dots overlay */}
          <Scatter
            dataKey="adjustedScore"
            fill="#8884d8"
            shape={<CustomDot />}
            name="Lifestyle Quality"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}