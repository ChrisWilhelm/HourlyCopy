import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import CoursesTabs from '../components/view-courses/CoursesTabs';
import Page from '../components/reusable/Page';
import JoinButton from '../components/view-courses/JoinButton';
import CreateButton from '../components/view-courses/CreateButton';
import { fetchCourses } from '../utils/requests/courses';

/**
 * Component that represents the "View Courses" page.
 * @param {*} props:
 * required: token: user's token
 * @returns A component representing the "View Courses" page.
 */
function ViewCourses(props) {
  const { token } = props;

  const [openJoin, setOpenJoin] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [studentCourses, setStudentCourses] = useState([]);
  const [staffCourses, setStaffCourses] = useState([]);

  useEffect(() => {
    (!openJoin || !openCreate) &&
      fetchCourses(token, setStudentCourses, setStaffCourses);
  }, [token, openJoin, openCreate]);

  return (
    <Page header="My Courses">
      <Box
        display="flex"
        flex={1}
        flexDirection="column"
        minHeight="100%"
        justifyContent="space-between"
      >
        <Box display="flex" flex={11}>
          <CoursesTabs
            token={token}
            studentCourses={studentCourses}
            staffCourses={staffCourses}
          />
        </Box>
        <Box
          display="flex"
          flex={1}
          flexDirection="row"
          justifyContent="space-between"
        >
          <CreateButton
            token={token}
            open={openCreate}
            setOpen={setOpenCreate}
          />
          <JoinButton token={token} open={openJoin} setOpen={setOpenJoin} />
        </Box>
      </Box>
    </Page>
  );
}

export default ViewCourses;
