import React from 'react';
import { Button as MuiButton } from '@mui/material';

/**
 * Represents a reusable component that is inspired by the Material UI Button component.
 * @param {*} props:
 * required: text: the text is displayed on the button
 *           onClick: function that handles what happens when button is clicked
 * optional: size: string that sets the size of the button ("small", "medium", or "large")
 *           color: the color of the button (default is the primary theme color)
 *           variant: string that sets the variant of the button (default is "contained")
 *           margin: the margin of the button (default is 10px)
 *           width: the width of the button
 *           height: the height of the button
 *           fontSize: the font size of the text displayed on the button
 * @returns A reusable button component.
 */
function Button(props) {
  const {
    text,
    onClick,
    size,
    color,
    variant,
    margin,
    width,
    height,
    fontSize,
    ...other
  } = props;

  const styles = {
    button: {
      margin: margin || '10px',
      width: width,
      height: height,
      fontSize: fontSize,
    },
  };

  return (
    <MuiButton
      variant={variant || 'contained'}
      size={!width ? size || 'large' : ''}
      color={color || 'primary'}
      onClick={onClick}
      style={styles.button}
      {...other}
    >
      {text}
    </MuiButton>
  );
}

export default Button;
