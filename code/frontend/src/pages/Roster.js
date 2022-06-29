import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Container, Grid, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router';
import { successToast, errorToast } from '../utils/toast';
import AddUser from '../components/roster/AddUser';
import axios from 'axios';
import { fetchUsers } from '../utils/requests/roster';
import ConfirmActionDialog from '../components/reusable/ConfirmActionDialog';

export default function Roster(props) {
  const { token, user } = props;
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState({});
  const [courseId, setCourseId] = useState();
  const [isInstructor, setIsInstructor] = useState(false);
  const [openRemoveConfirmation, setOpenRemoveConfirmation] = useState(false);
  const [removeUserId, setRemoveUserId] = useState(-1);
  const [removeUserName, setRemoveUserName] = useState('');

  // Check if current user is an instructor
  useEffect(() => {
    const isUserIdInInstructors = (id) => {
      return users.instructors.some((item) => {
        return item.accountid === id;
      });
    };

    if (users.instructors) {
      setIsInstructor(isUserIdInInstructors(user.accountid));
    }
  }, [user, users]);

  const removeUser = useCallback(
    (id) => () => {
      axios
        .delete(`/api/courses/${courseId}/roster/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setRows((prevRows) => prevRows.filter((row) => row.id !== id));
          successToast('Removed user!');
        })
        .catch((err) => {
          errorToast(err);
        });
    },
    [courseId, token],
  );

  // Open the remove dialog if removeUserId is set
  useEffect(() => {
    if (removeUserId >= 0) {
      setOpenRemoveConfirmation(true);
    }
  }, [removeUserId]);

  // Reset the removeUserId if the dialog is closed
  useEffect(() => {
    if (!openRemoveConfirmation) {
      setRemoveUserId(-1);
    }
  }, [openRemoveConfirmation]);

  // Get the current course id
  useEffect(() => {
    setCourseId(location?.state?.course?.courseid);
  }, [location]);

  // Get the roster of the current course id
  useEffect(() => {
    if (courseId) {
      fetchUsers(courseId, token, setUsers);
    }
  }, [courseId, token]);

  // Set the rows from the current members
  useEffect(() => {
    if (courseId && token) {
      axios
        .get(`/api/courses/${courseId}/getRoster`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const newRoster = [];
          ['instructors', 'staff', 'students'].forEach((type) => {
            newRoster.push(
              ...res.data[type].map((item) => {
                return {
                  role: {
                    instructors: 'Instructor',
                    staff: 'Staff',
                    students: 'Student',
                  }[type],
                  id: item.accountid,
                  ...item,
                };
              }),
            );
          });
          setRows(newRoster);
        })
        .catch((err) => {
          errorToast(err);
        });
    }
  }, [users, courseId, token]);

  const columns = useMemo(() => {
    const isButtonDisabled = (id) => {
      // Return true if member is the current user
      // Or if member is an instructor and user is not an instructor
      const isSelf = id === user.accountid;
      const instructorIds = users.instructors?.map((user) => user.accountid);
      const isMemberInstructor = instructorIds?.indexOf(id) !== -1;

      return isSelf || (isMemberInstructor && !isInstructor);
    };

    return [
      {
        field: 'username',
        headerName: 'Username',
        flex: 4,
      },
      {
        field: 'email',
        headerName: 'Email',
        flex: 4,
      },
      {
        field: 'role',
        headerName: 'Role',
        flex: 4,
      },
      {
        field: 'actions',
        type: 'actions',
        flex: 1,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<DeleteIcon />}
            onClick={() => {
              setRemoveUserId(params.id);
              setRemoveUserName(params.row.username);
            }}
            disabled={isButtonDisabled(params.id)}
            label="Delete"
          />,
        ],
      },
    ];
  }, [isInstructor, users.instructors, user]);

  return (
    <Container disableGutters sx={{ pl: 12, pr: 4, minWidth: '100%' }}>
      <Grid container direction="row" alignItems="center">
        <Grid item md={2} sx={{ marginTop: 2, marginBottom: 2 }}>
          <Typography variant="header">Roster</Typography>
        </Grid>
        <Grid item md={10} container justifyContent="flex-end">
          <AddUser
            id={courseId}
            isInstructor={isInstructor}
            token={token}
            setUsers={setUsers}
          />
        </Grid>
      </Grid>
      <Grid container justifyContent="flex-end"></Grid>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          autoPageSize
          sx={{ fontSize: '20px' }}
        />
      </div>
      <ConfirmActionDialog
        dialogTitle="Remove User"
        dialogContentText={`Are you sure you want to remove ${removeUserName}?`}
        dialogActionText="OK"
        handleAction={removeUser(removeUserId)}
        open={openRemoveConfirmation}
        setOpen={setOpenRemoveConfirmation}
      />
    </Container>
  );
}
