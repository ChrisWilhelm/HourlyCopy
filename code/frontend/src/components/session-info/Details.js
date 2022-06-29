import { Box, Typography } from '@mui/material';
import React from 'react';
import { getLocaleTime } from '../../utils/helpers/helpers';
import InfoField from './InfoField';
import theme from '../../theme';

/**
 * Displays the details regarding on office hour(s) session.
 * @param {*} props:
 * required: title: the title of the session
 *           officeHour: an officeHour object
 *           spots: the number of spots left
 *           view: student or staff view ("student"/"staff")
 * @returns list of office hour details.
 */
export default function Details(props) {
  const { title, officeHour, spots, view, upcoming } = props;

  return (
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      alignItems="center"
      marginBottom={theme.spacing(2)}
    >
      <Typography
        variant="popup"
        textAlign="center"
        marginBottom={theme.spacing(1)}
      >
        {title}
      </Typography>
      <InfoField
        fieldName="Date"
        fieldValue={new Date(officeHour.startdate).toString().substring(0, 16)}
      />
      <InfoField fieldName="Location" fieldValue={officeHour.ohlocation} />
      <Box flex={1} display="flex" flexDirection={{ xs: 'column', md: 'row' }}>
        <InfoField
          fieldName="Start Time"
          fieldValue={getLocaleTime(officeHour.starttime)}
        />
        <InfoField
          fieldName="End Time"
          fieldValue={getLocaleTime(officeHour.endtime)}
        />
      </Box>
      {view === 'Student' && upcoming && (
        <InfoField fieldName="Remaining Number of Spots" fieldValue={spots} />
      )}
    </Box>
  );
}
