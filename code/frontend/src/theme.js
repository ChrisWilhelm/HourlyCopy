import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme();
let theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#2454c5',
    },
    secondary: {
      main: '#e52c43',
    },
    error: {
      main: '#e52c43',
    },
    orange: '#E89005',
    green: '#04A777',
    purple: '#68275F',
    white: '#ffffff',
    black: '#000000',
    // Add more colors here!
  },
  typography: {
    homeTitle: {
      // used for homepage Hourly title
      ...defaultTheme.typography.h1,
      fontWeight: 500,
      [defaultTheme.breakpoints.down('lg')]: {
        fontSize: '4.7rem',
      },
      [defaultTheme.breakpoints.up('lg')]: {
        fontSize: '8rem',
      },
    },
    header: {
      // used for the header of a page
      ...defaultTheme.typography.h3,
      fontWeight: 500,
      [defaultTheme.breakpoints.down('md')]: {
        fontSize: '2rem',
      },
      [defaultTheme.breakpoints.up('md')]: {
        fontSize: '2.8rem',
      },
    },
    slogan: {
      ...defaultTheme.typography.h1,
      fontWeight: 500,
      [defaultTheme.breakpoints.down('lg')]: {
        fontSize: '2.6rem',
      },
      [defaultTheme.breakpoints.between('md', 'lg')]: {
        fontSize: '4rem',
      },
      [defaultTheme.breakpoints.up('lg')]: {
        fontSize: '5.25rem',
      },
    },
    courseCard: {
      ...defaultTheme.typography.h5,
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
    },
    functionalities: {
      // for the bottom functionalities listed on homepage
      ...defaultTheme.typography.h5,
      fontWeight: 600,
      fontSize: '1.3rem',
    },
    popup: {
      // used for the header of a popup
      ...defaultTheme.typography.h3,
      fontWeight: 500,
      fontSize: '2.2rem',
    },
    'no-data': { ...defaultTheme.typography.h6, fontSize: '1.5rem' }, // map no-data variant to h6
  },
});

export const themePalette = [
  '#2454c5',
  '#e52c43',
  '#E89005',
  '#04A777',
  '#68275F',
];

export default theme;
