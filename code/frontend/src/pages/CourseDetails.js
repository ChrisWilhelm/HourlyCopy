import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Grid, Typography, Box } from '@mui/material';
import Button from '../components/reusable/controls/Button';
import ConfirmActionDialog from '../components/reusable/ConfirmActionDialog';
import axios from 'axios';
import { successToast, errorToast } from '../utils/toast';
const getRole = async (token, courseid, setRole, role) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  try {
    const URL = `/api/courses/${courseid}/role`;
    await axios.get(URL, config).then((res) => {
      setRole(res.data.role);
    });
  } catch (error) {
    errorToast(error);
  }
};

export default function CourseDetails(props) {
  const { token, user } = props;

  const location = useLocation();
  const { course } = location.state;
  const courseName = course.title;
  const courseNumber = course.coursenumber;
  const semester = course.semester;
  const year = course.calenderyear;
  const [open, setOpen] = React.useState(false);
  const [openDel, setOpenDel] = React.useState(false);
  const [role, setRole] = React.useState('');

  const handleClick = () => {
    getRole(token, course.courseid, setRole, role);
    if (role === 'instructor') {
      setOpenDel(true);
    } else {
      setOpen(true);
    }
  };

  let navigate = useNavigate();
  useEffect(() => {
    getRole(token, course.courseid, setRole, role);
  }, [token, course.courseid, role]);

  const handleLeave = async () => {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      const URL = `api/courses/${course.courseid}/roster/${user.accountid}`;
      const data = await axios.delete(URL, config);
      setOpen(false);
      navigate('/courses');
      successToast('Successfully left course');
      return data;
    } catch (error) {
      setOpen(false);
      errorToast(error);
    }
  };

  const handleDelete = async () => {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      const URL = `api/courses/${course.courseid}`;
      const data = await axios.delete(URL, config);
      setOpenDel(false);
      navigate('/courses');
      successToast('Successfully left course');
      return data;
    } catch (error) {
      setOpenDel(false);
      errorToast(error);
    }
  };

  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="space-between"
        sx={{ pl: 12, minHeight: '90vh' }}
      >
        <Grid item sx={{ marginTop: 2, marginBottom: 2 }}>
          <Typography variant="header">Course Details</Typography>
        </Grid>
        <Grid item>
          <Typography
            display="inline"
            variant="h4"
            style={{ fontWeight: 'bold' }}
          >
            {'Course Name: '}
          </Typography>
          <Typography display="inline" variant="h4">
            {courseName}
          </Typography>
        </Grid>
        <Grid item>
          <Typography
            display="inline"
            variant="h4"
            style={{ fontWeight: 'bold' }}
          >
            {'Course Number: '}
          </Typography>
          <Typography display="inline" variant="h4">
            {courseNumber}
          </Typography>
        </Grid>
        <Grid item>
          {course.view === 'Staff' && (
            <>
              <Typography
                display="inline"
                variant="h4"
                style={{ fontWeight: 'bold' }}
              >
                {'Course code: '}
              </Typography>
              <Typography display="inline" variant="h4">
                {course.code}
              </Typography>
            </>
          )}
        </Grid>
        <Grid item>
          <Typography
            display="inline"
            variant="h4"
            style={{ fontWeight: 'bold' }}
          >
            {'Semester: '}
          </Typography>
          <Typography display="inline" variant="h4">
            {semester}
          </Typography>
          <Typography display="inline" variant="h4">
            {' '}
          </Typography>
          <Typography
            display="inline"
            variant="h4"
            style={{ fontWeight: 'bold' }}
          >
            {'Year: '}
          </Typography>
          <Typography display="inline" variant="h4">
            {year}
          </Typography>
          <Typography display="inline" variant="h4">
            {' '}
          </Typography>
        </Grid>
        <Grid item>
          <Box sx={{ minHeight: '50vh' }}></Box>
        </Grid>
        <Grid container justifyContent="center" item>
          {role === 'instructor' ? (
            <Button
              text="Delete Course"
              size="large"
              fontSize="20px"
              color="secondary"
              onClick={handleClick}
            />
          ) : (
            <Button
              text="Leave Course"
              size="large"
              fontSize="20px"
              color="secondary"
              onClick={handleClick}
            />
          )}
        </Grid>
      </Grid>
      <ConfirmActionDialog
        open={openDel}
        setOpen={setOpenDel}
        dialogTitle="You are about to delete the course."
        dialogActionText="Confirm"
        handleAction={handleDelete}
      />
      <ConfirmActionDialog
        open={open}
        setOpen={setOpen}
        dialogTitle="You are about to leave the course"
        dialogActionText="Confirm"
        handleAction={handleLeave}
      />
    </>
  );
}
