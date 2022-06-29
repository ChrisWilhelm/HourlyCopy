import { Fab, Grid } from '@mui/material';
import { useState } from 'react';
import theme from '../../theme';
import { toggleDay } from '../../utils/helpers/createSession';

/**
 * Child component that allows a user to select days of the weekk
 * that would like recurring sessions to occur.
 * @param {*} props:
 * required: selectedDays: state variable that represents the
 *                         the selected days
 *           setSelectedDays: state function that handles the
 *                            selection of days
 * @returns The DaysOfTheWeek component.
 */
function DaysOfTheWeek(props) {
  const { selectedDays, setSelectedDays } = props; // indicates to backend which days have been selected

  const [sunday, setSunday] = useState('default'); // "default" == gray color
  const [monday, setMonday] = useState('default');
  const [tuesday, setTuesday] = useState('default');
  const [wednesday, setWednesday] = useState('default');
  const [thursday, setThursday] = useState('default');
  const [friday, setFriday] = useState('default');
  const [saturday, setSaturday] = useState('default');

  const toggleSunday = () => {
    toggleDay(sunday, setSunday, selectedDays, setSelectedDays, 0);
  };

  const toggleMonday = () => {
    toggleDay(monday, setMonday, selectedDays, setSelectedDays, 1);
  };

  const toggleTuesday = () => {
    toggleDay(tuesday, setTuesday, selectedDays, setSelectedDays, 2);
  };

  const toggleWednesday = () => {
    toggleDay(wednesday, setWednesday, selectedDays, setSelectedDays, 3);
  };

  const toggleThursday = () => {
    toggleDay(thursday, setThursday, selectedDays, setSelectedDays, 4);
  };

  const toggleFriday = () => {
    toggleDay(friday, setFriday, selectedDays, setSelectedDays, 5);
  };

  const toggleSaturday = () => {
    toggleDay(saturday, setSaturday, selectedDays, setSelectedDays, 6);
  };

  return (
    <Grid
      direction="row"
      container
      justifyContent="center"
      columnSpacing={theme.spacing(3)}
      rowSpacing={theme.spacing(1)}
      sx={{ marginBottom: theme.spacing(2), marginTop: theme.spacing(0.5) }}
    >
      <Grid item>
        <Fab onClick={toggleSunday} color={sunday} size="medium">
          S
        </Fab>
      </Grid>
      <Grid item>
        <Fab onClick={toggleMonday} color={monday} size="medium">
          M
        </Fab>
      </Grid>
      <Grid item>
        <Fab onClick={toggleTuesday} color={tuesday} size="medium">
          T
        </Fab>
      </Grid>
      <Grid item>
        <Fab onClick={toggleWednesday} color={wednesday} size="medium">
          W
        </Fab>
      </Grid>
      <Grid item>
        <Fab onClick={toggleThursday} color={thursday} size="medium">
          T
        </Fab>
      </Grid>
      <Grid item>
        <Fab onClick={toggleFriday} color={friday} size="medium">
          F
        </Fab>
      </Grid>
      <Grid item>
        <Fab onClick={toggleSaturday} color={saturday} size="medium">
          S
        </Fab>
      </Grid>
    </Grid>
  );
}

export default DaysOfTheWeek;
