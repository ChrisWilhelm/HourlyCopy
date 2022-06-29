import { Box, Dialog, DialogContent, IconButton } from '@mui/material';
import React from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import theme from '../../theme';

/**
 * Reusable MUI Dialog component. The popup has an clear icon
 * attached by default.
 * @param {*} props:
 * required: open: state variable that determines whether the popup
 *                 is opened
 *           onClose: function that handles what happens when popup
 *                    is closed
 * optional: children: children to fill up the component
 * @returns Reusable popup component.
 */
export default function Popup(props) {
  const { open, onClose, children } = props;

  return (
    <Dialog disableEnforceFocus onclose={onClose} open={open} maxWidth="50%">
      <DialogContent>
        <Box flex={1} display="flex" flexDirection="column">
          <Box display="flex" justifyContent="flex-end">
            <IconButton onClick={onClose}>
              <ClearIcon sx={{ fontSize: '30px' }} />
            </IconButton>
          </Box>
          <Box
            display="flex"
            justifyContent="center"
            flexDirection="column"
            alignItems="center"
            paddingLeft={theme.spacing(5)}
            paddingRight={theme.spacing(5)}
          >
            {children}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
