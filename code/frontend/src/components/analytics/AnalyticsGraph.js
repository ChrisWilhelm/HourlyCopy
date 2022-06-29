import { useEffect, useState } from 'react';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import AnalyticsBarChart from './AnalyticsBarChart';
import AnalyticsRadar from './AnalyticsRadar';
import AnalyticsRadioGroup from './AnalyticsRadioGroup';
import theme from '../../theme';
import { fetchAndSetRowsGraph } from '../../utils/helpers/analytics';

/**
 * A component that utilizes the Recharts library to build a
 * graphical representation of registration statistics.
 * @param {*} props:
 * required: token: the user's token
 *           course: course object
 *           option: the current data view
 * @returns A graphical representation of registration stats.
 */
export default function AnalyticsGraph(props) {
  const { token, course, option } = props;

  const [rows, setRows] = useState([]);
  const [xDataKey, setXDataKey] = useState('');
  const [xAxisLabel, setXAxisLabel] = useState('');
  const [sessionIV, setSessionIV] = useState('times');
  const [topicIV, setTopicIV] = useState('bar');

  const handleChange = (event) => {
    option === 'Topics'
      ? setTopicIV(event.target.value)
      : setSessionIV(event.target.value);
  };

  useEffect(() => {
    fetchAndSetRowsGraph(
      option,
      token,
      course,
      setRows,
      setXDataKey,
      setXAxisLabel,
      sessionIV,
    );
  }, [token, course, option, sessionIV]);

  return (
    <Paper style={{ height: '100%', width: '100%', padding: theme.spacing(2) }}>
      <>
        {option === 'Topics' && topicIV === 'radar' ? (
          <AnalyticsRadar data={rows} />
        ) : (
          <AnalyticsBarChart
            data={rows}
            xDataKey={xDataKey}
            xAxisLabel={xAxisLabel}
          />
        )}
        {(option === 'Sessions' || option === 'Topics') && (
          <AnalyticsRadioGroup
            option={option}
            topicIV={topicIV}
            sessionIV={sessionIV}
            handleChange={handleChange}
          />
        )}
      </>
    </Paper>
  );
}
