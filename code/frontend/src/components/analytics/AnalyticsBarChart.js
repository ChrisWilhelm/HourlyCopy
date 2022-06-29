import { useTheme } from '@mui/material';
import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Label,
  ResponsiveContainer,
} from 'recharts';
import { themePalette } from '../../theme';

/**
 * A component that is inspired by the Recharts BarChart component.
 * @param {*} props:
 * required: data: the data
 *           xDataKey: x-axis data key
 *           xAxisLabel: x-axis label
 * @returns A bar chart representation of registration stats.
 */
export default function AnalyticsBarChart(props) {
  const { data, xDataKey, xAxisLabel } = props;

  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height={550}>
      <BarChart
        data={data}
        margin={{ top: 15, right: 20, left: 20, bottom: 11 }}
      >
        <CartesianGrid />
        <XAxis dataKey={xDataKey}>
          <Label value={xAxisLabel} offset={-8} position="insideBottom" />
        </XAxis>

        <YAxis
          label={{
            value: 'Number of Registrations',
            angle: -90,
            position: 'insideLeft',
          }}
        />
        <Tooltip />
        <Bar dataKey="numRegistrations" fill={theme.palette.primary.main}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={themePalette[index % themePalette.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
