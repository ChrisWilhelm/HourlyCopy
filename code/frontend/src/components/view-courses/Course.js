import React from 'react';
import { CardContent, CardActionArea, Card, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 * Represents a Material UI Card component that displays information about a course.
 * @param {*} props:
 * required: course: a course object
 * @returns A course card component.
 */
function Course(props) {
  const { course } = props;

  return (
    <Card sx={{ minHeight: 100, width: 300 }}>
      <CardActionArea
        component={Link}
        to="/calendar"
        state={{ course: course }}
        underline="none"
        sx={{
          backgroundColor: 'primary.main',
          width: 300,
          minHeight: 100,
          border: '1px solid black',
        }}
      >
        <CardContent>
          <Typography variant="courseCard" color="white">
            {course.title}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default Course;
