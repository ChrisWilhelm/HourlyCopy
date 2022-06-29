import { CardContent, Card, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import { Grid } from '@mui/material';

/**
 * Represents a Material UI Card component that displays information about a concept/topic.
 * @param {*} props - Properties include token, topicvalue
 * @returns A reusable concept card component.
 */
function Topic(props) {
  const { topic, role, setOpenCancel, setTopicId, setTopicName } = props;

  const onClick = () => {
    setOpenCancel(true);
    setTopicName(topic.topicvalue);
    setTopicId(topic.topicid);
  };

  return (
    <Card style={{ margin: '20px' }}>
      <Grid
        container
        alignItems="center"
        direction="row"
        justifyContent="space-between"
      >
        <Grid item>
          <CardContent>
            <Typography variant="h5">{topic.topicvalue}</Typography>
          </CardContent>
        </Grid>
        <Grid item>
          {role === 'instructor' && (
            <IconButton onClick={onClick}>
              <ClearIcon style={{ fontSize: '30px' }} />
            </IconButton>
          )}
        </Grid>
      </Grid>
    </Card>
  );
}

export default Topic;
