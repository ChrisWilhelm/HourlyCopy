import { Typography } from '@mui/material';
import React from 'react';

/**
 * Represents a reusable header component that makes use of the Material UI
 * component Typography.
 * @param {*} props:
 * required: text: the text
 * optional: fontSize: the size of the text
 *           fontWeight: the weight of the text
 *           margin: the margin of the component
 *           textAlign: how the text should be aligned (default is "left")
 * @returns An reusable header component.
 */
function Header(props) {
  const { text, fontSize, fontWeight, margin, textAlign, ...other } = props; // Add more properties here!

  const styles = {
    header: {
      fontSize: fontSize,
      fontWeight: fontWeight,
      margin: margin,
      textAlign: textAlign || 'left',
    },
  };

  return (
    <Typography style={styles.header} {...other}>
      {text}
    </Typography>
  );
}

export default Header;
