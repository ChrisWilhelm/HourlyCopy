import * as React from 'react';
import Chip from '@mui/material/Chip';

/**
 * Represents a Material UI Chip component that acts as topic tag.
 * hour session.
 * @param {*} props:
 * required: topic: topic text as a string
 * @returns A topic tag.
 */
export default function TopicChip(props) {
  const { topic } = props;
  return <Chip label={topic} color="primary" />;
}
