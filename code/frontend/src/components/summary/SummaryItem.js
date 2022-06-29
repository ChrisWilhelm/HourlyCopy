import React from 'react';
import { Box, Divider, Grid, ListItem, ListItemText } from '@mui/material';
import Controls from '../reusable/controls/Controls';
import TopicChip from './TopicChip';
import theme from '../../theme';

/**
 * Represents a Material UI ListItem component that displays information about a registration.
 * @param {*} props:
 * required: registration: registration object
 *           index: the index of the list item
 * @returns A list item for the Summary parent component.
 */
function SummaryItem(props) {
  const { registration, index } = props;

  return (
    <ListItem>
      <Box display="flex" flex={1} flexDirection="column">
        <ListItemText
          primary={
            <div>
              {index + 1}. {registration.accountname}
            </div>
          }
          primaryTypographyProps={{
            fontSize: '1.2rem',
            fontWeight: '500',
          }}
        />
        {registration.questions !== null && (
          <Controls.InputText
            width="100%"
            margin="0px"
            multiline
            disabled
            value={registration.questions}
            fontSize="1.1rem"
          />
        )}
        <Grid
          container
          direction="row"
          spacing={theme.spacing(1)}
          style={{
            marginTop: theme.spacing(0.5),
            marginBottom: theme.spacing(0.5),
          }}
          width="100%"
        >
          {registration.topics.map((topic, index2) => {
            return (
              <Grid item>
                <TopicChip topic={topic} />
              </Grid>
            );
          })}
        </Grid>
        <Divider variant="middle" sx={{ margin: theme.spacing(0.5) }} />
      </Box>
    </ListItem>
  );
}

export default SummaryItem;
