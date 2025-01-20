import React from "react";
import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";

interface AppBarProps {
  resetDrawing: () => void;
  setViewMode: Function;
}

const AppBarComponent: React.FC<AppBarProps> = ({
  resetDrawing,
  setViewMode,
}) => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#fff" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, color: "#000" }}>
          Rekise Marine
        </Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          <Button color="primary" variant="outlined" onClick={resetDrawing}>
            Reset
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => setViewMode("LineString")}
          >
            Draw
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
