import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import theme from '../../theme';
import { changeTab } from '../../utils/helpers/helpers';
import Course from './Course';

/**
 * Represents a Material UI Tabs component that displays a user's courses.
 * @param {*} props:
 * required: token: user's token
 *           studentCourses: array of student course objects
 *           staffCourses: array of staff course objects
 * @returns A component in which a user can see their courses.
 */
export default function CoursesTabs(props) {
  const { token, studentCourses, staffCourses } = props;

  const [tab, setTab] = useState('student');
  const [courses, setCourses] = useState(studentCourses);
  const [bgColorStudent, setBgColorStudent] = useState('primary.main');
  const [bgColorStaff, setBgColorStaff] = useState('white');
  const [colorStudentText, setColorStudentText] = useState('white');
  const [colorStaffText, setColorStaffText] = useState('black');

  useEffect(() => {
    tab === 'student' ? setCourses(studentCourses) : setCourses(staffCourses);
  }, [token, tab, studentCourses, staffCourses]);

  const handleChange = (event, newValue) => {
    changeTab(
      newValue,
      setTab,
      setColorStudentText,
      setBgColorStudent,
      setColorStaffText,
      setBgColorStaff,
    );
  };

  return (
    <Box
      maxHeight="72vh"
      flex={1}
      display="flex"
      flexDirection="column"
      paddingBottom={theme.spacing(2)}
    >
      <Tabs
        value={tab}
        onChange={handleChange}
        TabIndicatorProps={{
          style: { display: 'none' },
        }}
      >
        <Tab
          value="student"
          label={<span style={{ color: colorStudentText }}>Student</span>}
          sx={{
            borderLeft: '1px solid black',
            borderTop: '1px solid black',
            backgroundColor: bgColorStudent,
            fontSize: '1rem',
          }}
        />
        <Tab
          value="staff"
          label={<span style={{ color: colorStaffText }}>Staff</span>}
          sx={{
            borderLeft: '1px solid black',
            borderTop: '1px solid black',
            borderRight: '1px solid black',
            backgroundColor: bgColorStaff,
            fontSize: '1rem',
          }}
        />
      </Tabs>
      <Box
        flex={1}
        display="flex"
        sx={{
          border: '1px solid black',
          height: '100%',
          overflowY: 'scroll',
          padding: theme.spacing(2),
        }}
      >
        {courses.length > 0 ? (
          <Grid
            container
            rowSpacing={theme.spacing(10)}
            columnSpacing={theme.spacing(22)}
            justifyContent="flex-start"
          >
            {courses.map((course, index) => {
              return (
                <Grid item>
                  <Course course={course} key={index} />
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box
            flex={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Typography variant="no-data">
              {tab === 'student' ? 'No student courses' : 'No staff courses'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
