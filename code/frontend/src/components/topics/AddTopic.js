import React from 'react';
import { IconButton, Container } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import { Dialog, DialogContent, Grid } from '@mui/material';
import Controls from '../reusable/controls/Controls';
import { Form } from '../reusable/Form';
import { errorToast, successToast } from '../../utils/toast';

/**
 * Represents a Material UI Dialog component that allows an instructor to add a topic.
 * @param {*} props - Properties include onClose, open, course, setSuccessToast, token,
 * values, validate, errors, handleInputChange.
 * @returns A popup for adding topics.
 */
function AddTopic(props) {
  const {
    onClose,
    open,
    course,
    token,
    values,
    validate,
    errors,
    handleInputChange,
  } = props;

  const handleClose = () => {
    onClose();
  };

  const addConcept = async (topic) => {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const URL = `/api/courses/topicTag/create`;

    await axios
      .post(
        `${URL}`,
        {
          topicName: values.topicName,
          courseId: course.courseid,
        },
        config,
      )
      .then(() => {
        successToast(`Successfully added "${topic}" as a topic!`);
      })
      .catch((err) => {
        errorToast(err);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validate()) {
      addConcept(values.topicName);
      values.topicName = '';
    }
  };

  const styles = {
    dialog: {
      height: '400px',
    },
    input: {
      width: '400px',
    },
    addButton: {
      width: '200px',
    },
  };

  return (
    <Container>
      <Dialog onClose={handleClose} open={open} disableEnforceFocus>
        <Form onSubmit={handleSubmit}>
          <DialogContent style={styles.dialog}>
            <Grid direction="column" container>
              <Grid container justifyContent="flex-end">
                <IconButton onClick={handleClose}>
                  <ClearIcon />
                </IconButton>
              </Grid>
              <Grid
                direction="column"
                container
                spacing={3}
                justifyContent="center"
                alignItems="center"
              >
                <Grid item>
                  <h1>Add Topic</h1>
                </Grid>
                <Grid item md="auto">
                  <Controls.InputText
                    label="Topic Name"
                    width="300px"
                    name="topicName"
                    value={values.topicName}
                    onChange={handleInputChange}
                    error={errors.topicName}
                  />
                </Grid>
                <Grid item md="auto">
                  <Controls.Button
                    variant="contained"
                    text="Submit"
                    type="submit"
                  />
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
        </Form>
      </Dialog>
    </Container>
  );
}

export default AddTopic;
