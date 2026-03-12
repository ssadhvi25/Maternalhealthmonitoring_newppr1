import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { DistrictCount, SourceCount } from "@/types";

// -------- District Bar Chart --------
interface DistrictChartProps {
  data: DistrictCount[];
}

export const DistrictBarChart: React.FC<DistrictChartProps> = ({ data }) => {
  const top8 = data.slice(0, 8);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={top8} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "hsl(240 4% 46%)" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="district"
          tick={{ fontSize: 11, fill: "hsl(240 10% 3.9%)" }}
          width={90}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 6,
            border: "none",
            boxShadow: "0 0 0 1px rgba(0,0,0,.08), 0 4px 8px rgba(0,0,0,.1)",
            fontFamily: "'Public Sans', sans-serif",
          }}
          cursor={{ fill: "hsl(240 5% 94%)" }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {top8.map((_, i) => (
            <Cell key={i} fill={`hsl(221 83% ${Math.max(40, 65 - i * 5)}%)`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// -------- Source Bar Chart --------
interface SourceChartProps {
  data: SourceCount[];
}

export const SourceBarChart: React.FC<SourceChartProps> = ({ data }) => {
  const top6 = data.slice(0, 6);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={top6} margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
        <XAxis
          dataKey="source"
          tick={{ fontSize: 10, fill: "hsl(240 4% 46%)" }}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={48}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(240 4% 46%)" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 6,
            border: "none",
            boxShadow: "0 0 0 1px rgba(0,0,0,.08), 0 4px 8px rgba(0,0,0,.1)",
            fontFamily: "'Public Sans', sans-serif",
          }}
          cursor={{ fill: "hsl(240 5% 94%)" }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32} fill="hsl(221 83% 53%)" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// -------- Severity Donut --------
const SEVERITY_COLORS = {
  Confirmed: "hsl(0 84% 60%)",
  Probable: "hsl(38 92% 50%)",
};

interface SeverityDonutProps {
  confirmed: number;
  probable: number;
}

export const SeverityDonut: React.FC<SeverityDonutProps> = ({ confirmed, probable }) => {
  const data = [
    { name: "Confirmed", value: confirmed },
    { name: "Probable", value: probable },
  ].filter((d) => d.value > 0);

  if (!data.length) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
        No data
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={62}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={SEVERITY_COLORS[entry.name as keyof typeof SEVERITY_COLORS]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 6,
              border: "none",
              boxShadow: "0 0 0 1px rgba(0,0,0,.08), 0 4px 8px rgba(0,0,0,.1)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: SEVERITY_COLORS[d.name as keyof typeof SEVERITY_COLORS] }}
            />
            <span className="text-sm text-foreground font-medium tabular">{d.value}</span>
            <span className="text-xs text-muted-foreground">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
