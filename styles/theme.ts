import { createMuiTheme } from '@material-ui/core/styles';
import { indigo, deepOrange } from '@material-ui/core/colors';

// A theme with custom primary and secondary color.
// It's optional.

const theme = createMuiTheme({
  palette: {
    primary: indigo,
    secondary: deepOrange,
    typography: {
      useNextVariants: true,
    },
  },
} as any);
export type Theme = typeof theme;
export default theme;


