import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import InputText from '../reusable/controls/InputText';
import Button from '../reusable/controls/Button';
import CloseIcon from '@mui/icons-material/Close';
import { errorToast, successToast } from '../../utils/toast';

/**
 * Represents a Material UI Dialog component that users to leave Feedback on OH.
 * @param {*} props - Properties include registrationId, token, open, and setOpen.
 * @returns A dialog for leaving Feedback on a session.
 */
export default function FeedbackDialog(props) {
  const { registrationId, token, open, setOpen } = props;
  const [feedback, setFeedback] = useState('');

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    await axios
      .post(
        `/api/courses/registrations/${registrationId}/feedback`,
        { feedback },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .then(() => {
        handleClose();
        successToast('Successfully submitted feedback!');
      })
      .catch((err) => {
        errorToast(err);
      });
  };

  const updateFeedback = (event) => {
    setFeedback(event.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      disableEnforceFocus
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Box display="flex" alignItems="center">
          <Box flexGrow={1}>Feedback</Box>
          <Box>
            <IconButton aria-label="close" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <InputText
          placeholder="How was your experience?"
          multiline
          value={feedback}
          width="90%"
          onChange={updateFeedback}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button
          text="Submit"
          disabled={feedback.length === 0}
          onClick={handleSubmit}
        />
      </DialogActions>
    </Dialog>
  );
}
