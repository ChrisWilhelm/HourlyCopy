import { useTheme } from '@mui/material';
import * as React from 'react';
import {
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

/**
 * A component that is inspired by the Recharts RadarGraph component.
 * @param {*} props:
 * required: data: the data
 * @returns A radar chart representation of topic - registration stats.
 */
export default function AnalyticsRadar(props) {
  const { data } = props;

  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height={550}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="topic" />
        <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
        <Radar
          dataKey="numRegistrations"
          stroke={theme.palette.primary.main}
          fill={theme.palette.primary.main}
          fillOpacity={0.6}
        />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}
