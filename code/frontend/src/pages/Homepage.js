import { Box } from '@mui/material';
import React, { useEffect } from 'react';
import Functionalities from '../components/homepage/Functionalities';
import RightHalf from '../components/homepage/RightHalf';
import Title from '../components/homepage/Title';

/**
 * The startup/homepage/landing page.
 * @param {*} props:
 * required: setHomepage: a state function that is used to ensure that the
 *                        appbar is hidden when the homepage is active
 * @returns  Homepage.
 */
export default function Homepage(props) {
  const { setHomepage } = props;

  useEffect(() => {
    setHomepage(true);
  }, [setHomepage]);

  return (
    <Box
      display="flex"
      flex={1}
      minHeight="100%"
      minWidth="100%"
      flexDirection={{ xs: 'column', sm: 'column', md: 'row' }}
    >
      <Box
        bgcolor="primary.main"
        display="flex"
        flex={6}
        padding="1%"
        flexDirection={{
          xs: 'column-reverse',
          sm: 'column-reverse',
          md: 'column',
        }}
      >
        <Box
          display="flex"
          flex={11}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Title />
        </Box>
        <Box display="flex" flex={1} alignItems="flex-end">
          <Functionalities isLeft={true} />
        </Box>
      </Box>
      <Box flex={6} padding="1%" display="flex" flexDirection="column">
        <RightHalf />
        <Box display="flex" flex={1} alignItems="flex-end">
          <Functionalities isLeft={false} />
        </Box>
      </Box>
    </Box>
  );
}
