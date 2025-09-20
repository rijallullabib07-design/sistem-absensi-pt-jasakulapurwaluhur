import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface AttendanceChartProps {
  data: Array<{
    date: string;
    present: number;
    late: number;
    absent: number;
  }>;
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <Card className="card-corporate">
      <CardHeader>
        <CardTitle>Tren Kehadiran 7 Hari Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Bar
              dataKey="present"
              name="Hadir"
              fill="hsl(var(--accent))"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="late"
              name="Terlambat"
              fill="hsl(var(--warning))"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="absent"
              name="Tidak Hadir"
              fill="hsl(var(--destructive))"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}