import { Container, Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import Topic from '../components/topics/Topic';
import Controls from '../components/reusable/controls/Controls';
import { useForm } from '../components/reusable/Form';
import axios from 'axios';
import AddTopic from '../components/topics/AddTopic';
import ConfirmActionDialog from '../components/reusable/ConfirmActionDialog';
import { errorToast, successToast } from '../utils/toast';
import Typography from '@mui/material/Typography';

/**
 * Component representing the "Topics" page for a course.
 * @param {*} props - Properties include token
 * @returns the Topics page.
 */
function Topics(props) {
  const { token } = props;

  const [open, setOpen] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);

  const [topics, setTopics] = useState([]);
  const [topicName, setTopicName] = useState('');
  const [topicId, setTopicId] = useState(-1);
  const [role, setRole] = useState('');

  const location = useLocation();
  const { course } = location.state;

  const handleCancel = async () => {
    const cancelUrl = `api/courses/${course.courseid}/topictags/${topicId}`;
    await axios
      .delete(cancelUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => successToast('Successfully deleted!'))
      .catch((err) => errorToast(err));
  };

  useEffect(() => {
    const fetchTopics = async () => {
      const URL = `/api/courses/${course.courseid}/topicTags`;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios
        .get(`${URL}`, config)
        .then(function (response) {
          setTopics(
            response.data.topicTags.sort((a, b) =>
              a.topicvalue > b.topicvalue ? 1 : -1,
            ),
          );
        })
        .catch((err) => errorToast(err));
    };

    const fetchRole = async () => {
      const URL = `/api/courses/${course.courseid}/role`;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios
        .get(`${URL}`, config)
        .then(function (response) {
          setRole(response.data.role);
        })
        .catch((err) => errorToast(err));
    };
    !open && !openCancel && fetchTopics();
    !open && !openCancel && fetchRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, course.courseid, open, openCancel]);

  // Validation function to check if fields are correctly formatted.
  const validate = (fields = values) => {
    let temp = { ...errors };
    if ('topicName' in fields)
      temp.topicName =
        fields.topicName.length > 0 ? '' : 'This field is required.';

    setErrors({
      ...temp,
    });

    if (fields === values) return Object.values(temp).every((x) => x === '');
  };

  const initialFValues = {
    topicName: '',
  };

  const { values, errors, setErrors, handleInputChange } = useForm(
    initialFValues,
    false,
    validate,
  );

  const handleClose = () => {
    setOpen(false);
  };

  const onClick = () => {
    setOpen(true);
  };

  return (
    <Container disableGutters>
      <Grid
        container
        justifyContent="space-between"
        alignItems="flex-start"
        direction="column"
        width="92vw"
        sx={{ ml: '-1.5vw' }}
      >
        <Grid item sx={{ marginTop: 2, marginBottom: 2 }}>
          <Typography variant="header">{'Topics'}</Typography>
        </Grid>

        <Grid
          item
          sx={{ ml: '-1.3vw', overflowY: 'scroll' }}
          height="70vh"
          width="92vw"
        >
          {topics.length > 0 ? (
            topics.map((topic, index) => {
              return (
                <Topic
                  topic={topic}
                  role={role}
                  key={index}
                  setOpenCancel={setOpenCancel}
                  setTopicId={setTopicId}
                  setTopicName={setTopicName}
                />
              );
            })
          ) : (
            <Typography variant="no-data" margin="20px">
              No Topics
            </Typography>
          )}
        </Grid>

        <Grid item container justifyContent="flex-end">
          {role === 'instructor' && (
            <Controls.Button
              text="Add"
              size="large"
              margin="10px"
              width="150px"
              fontSize="17px"
              onClick={onClick}
            />
          )}
        </Grid>
      </Grid>
      <AddTopic
        open={open}
        token={token}
        course={course}
        onClose={handleClose}
        values={values}
        validate={validate}
        errors={errors}
        handleInputChange={handleInputChange}
      />
      <ConfirmActionDialog
        dialogContentText={`Are you sure you want to delete the "${topicName}" concept?`}
        dialogActionText="Confirm Deletion"
        handleAction={handleCancel}
        open={openCancel}
        setOpen={setOpenCancel}
      />
    </Container>
  );
}

export default Topics;
