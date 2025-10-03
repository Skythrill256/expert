"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Scatter, ScatterChart, ComposedChart } from "recharts";
import { useEffect, useState } from "react";

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
  const { cx, cy, payload, r = 5 } = props;
  
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
    <circle cx={cx} cy={cy} r={r} fill={color} stroke="#fff" strokeWidth={2} opacity={0.8} />
  );
};

export default function TrendChart({ data }: TrendChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const chartHeight = isMobile ? 220 : 320;
  const tickFontSize = isMobile ? 10 : 12;

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold">Health Score Trend</h2>
        <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs flex-wrap">
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
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart
          data={data}
          margin={{ top: isMobile ? 8 : 16, right: isMobile ? 8 : 16, left: isMobile ? 8 : 12, bottom: isMobile ? 8 : 12 }}
        >
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
            tick={{ fontSize: tickFontSize }}
            interval={isMobile ? "preserveStartEnd" : 0}
            tickMargin={6}
          />
          <YAxis
            stroke="oklch(0.50 0.01 264)"
            tick={{ fontSize: tickFontSize }}
            domain={[0, 100]}
            tickCount={isMobile ? 4 : 6}
            width={isMobile ? 28 : 36}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(1 0 0 / 0.95)",
              border: "1px solid oklch(0.92 0.005 264 / 0.2)",
              borderRadius: "12px",
              backdropFilter: "blur(20px)",
            }}
          />
          {!isMobile && <Legend wrapperStyle={{ fontSize: 12 }} />}
          <Line
            type="monotone"
            dataKey="baseScore"
            stroke="oklch(0.65 0.25 264)"
            strokeWidth={isMobile ? 2 : 2}
            dot={false}
            fill="url(#baseScoreGradient)"
            name="Base Score"
          />
          <Line
            type="monotone"
            dataKey="adjustedScore"
            stroke="oklch(0.70 0.20 180)"
            strokeWidth={isMobile ? 2.5 : 3}
            dot={false}
            activeDot={{ r: 6 }}
            fill="url(#adjustedScoreGradient)"
            name="Adjusted Score"
          />
          {/* Lifestyle habit dots overlay */}
          <Scatter
            dataKey="adjustedScore"
            fill="#8884d8"
            shape={(props: any) => <CustomDot {...props} r={isMobile ? 4 : 5} />}
            name="Lifestyle Quality"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}