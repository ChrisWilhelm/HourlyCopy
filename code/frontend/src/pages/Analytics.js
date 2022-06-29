import { useState } from 'react';
import { useLocation } from 'react-router';
import AnalyticsTable from '../components/analytics/AnalyticsTable';
import AnalyticsGraph from '../components/analytics/AnalyticsGraph';
import Page from '../components/reusable/Page';
import AnalyticsButtonGroup from '../components/analytics/AnalyticsButtonGroup';
import AnalyticsDropdown from '../components/analytics/AnalyticsDropdown';

/**
 * The Analytics/Statistics page that illustrates
 * the frequency of students who selected a concept/topic tag.
 * @param {*} props:
 * required: token: the user's token
 * @returns A component representing the "Analytics" page.
 */
export default function Analytics(props) {
  const { token } = props;

  const location = useLocation();
  const course = location.state.course;

  const [isTable, setIsTable] = useState(true);
  const [option, setOption] = useState('Topics');

  const handleOptionChange = (event) => setOption(event.target.value);

  const dropdown = () => {
    return (
      <AnalyticsDropdown
        option={option}
        handleOptionChange={handleOptionChange}
      />
    );
  };

  const button = () => {
    return <AnalyticsButtonGroup setIsTable={setIsTable} />;
  };

  return (
    <Page header="Analytics" dropdown={dropdown()} button={button()}>
      {isTable ? (
        <AnalyticsTable course={course} token={token} option={option} />
      ) : (
        <AnalyticsGraph course={course} token={token} option={option} />
      )}
    </Page>
  );
}
