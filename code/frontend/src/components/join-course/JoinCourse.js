import { IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import { Dialog, DialogContent, Grid } from '@mui/material';
import { errorToast, successToast } from '../../utils/toast';
import { useForm } from '../reusable/Form';
import Controls from '../reusable/controls/Controls';

/**
 * Represents a Material UI Card component that allows users to join course.
 * @param {*} props - Properties include onClose, open, token.
 * @returns A card for joining a course.
 */
function JoinCourse(props) {
  const { onClose, open, token } = props;

  const initialFValues = {
    code: '',
  };

  // Validation function to check if fields are correctly formatted.
  const validate = (fields = values) => {
    let temp = { ...errors };
    if ('code' in fields)
      temp.code =
        fields.code.length === 6 ? '' : 'Course code must be 6 characters.';

    setErrors({
      ...temp,
    });

    if (fields === values) return Object.values(temp).every((x) => x === '');
  };

  const { values, errors, setErrors, handleInputChange } = useForm(
    initialFValues,
    false,
    validate,
  );

  const handleClose = () => {
    onClose();
    values.code = '';
  };

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const joinCourse = async (event) => {
    event.preventDefault();
    if (validate()) {
      const URL = `/api/courses/${values.code}`;
      try {
        const response = await axios.post(`${URL}`, null, config);
        onClose();
        successToast(response.data.msg);
        values.code = '';
      } catch (err) {
        errorToast(err);
      }
    }
  };

  return (
    <Dialog disableEnforceFocus onClose={handleClose} open={open}>
      <DialogContent style={{ height: '385px' }}>
        <Grid container direction="column">
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
              <h1>Join Course</h1>
            </Grid>
            <Grid item>
              <Controls.InputText
                label="Code"
                name="code"
                value={values.code}
                onChange={handleInputChange}
                error={errors.code}
                width="450px"
              />
            </Grid>
            <Grid item md="auto">
              <Controls.Button
                onClick={joinCourse}
                text="Join"
                fontSize="15px"
                width="15vw"
              />
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export default JoinCourse;
