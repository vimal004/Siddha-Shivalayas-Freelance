// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#6200ea",
    },
    secondary: {
      main: "#03dac6",
    },
    success: {
      main: "#00c853",
    },
    error: {
      main: "#d32f2f",
    },
    warning: {
      main: "#fbc02d",
    },
    info: {
      main: "#0288d1",
    },
  },
  typography: {
    button: {
      textTransform: "none",
    },
  },
});

export default theme;
