import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import haversineDistance from "../utils/distanceCalculator.ts";
interface PolygonModalProps {
  polygonCoordinates: any;
  onClose: () => void;
  handleDiscardPolygon: () => void;
  handleImportPolygon: () => void;
  setViewMode: (mode: string) => void;
}

// const haversineDistance = (lat1, lon1, lat2, lon2) => {
//   const toRadians = (degree) => (degree * Math.PI) / 180;
//   const R = 6371; // Earth's radius in kilometers
//   const dLat = toRadians(lat2 - lat1);
//   const dLon = toRadians(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRadians(lat1)) *
//       Math.cos(toRadians(lat2)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c * 1000; // Distance in kilometers
// };

const PolygonModal = ({
  polygonCoordinates,
  handleDiscardPolygon,
  handleImportPolygon,
  setViewMode,
}) => {
  // Calculate distances between consecutive points
  const coordinatesWithDistances = polygonCoordinates.map((coord, index) => {
    if (index === 0) return { ...coord, distance: 0 }; // No distance for the first point
    const prevCoord = polygonCoordinates[index - 1];
    const distance = haversineDistance(
      prevCoord[1], // Latitude of previous point
      prevCoord[0], // Longitude of previous point
      coord[1], // Latitude of current point
      coord[0] // Longitude of current point
    );
    return { ...coord, distance: distance.toFixed(2) + " m" };
  });

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: "5%",
        right: "10%",
        width: 500,
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
      }}
    >
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"flex-start"}
      >
        <IconButton onClick={() => setViewMode("LineString")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="subtitle1">Mission Planner</Typography>
      </Stack>
      <Typography variant="h6" fontWeight={500} mb={2}>
        Polygon Coordinates
      </Typography>
      <Box
        sx={{
          p: 2,
          border: "1px dotted #333",
          background: "#f0f0f0",
          mb: 3,
        }}
      >
        <Typography>
          Click on the map to mark the points of the polygons perimeter then
          press enter to close complete the route
        </Typography>
      </Box>
      <TableContainer component={Paper} sx={{ marginTop: "16px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Index</TableCell>
              <TableCell>Latitude</TableCell>
              <TableCell>Longitude</TableCell>
              <TableCell>Distance(m)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coordinatesWithDistances.map((coord, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{coord[1].toFixed(5)}</TableCell>
                <TableCell>{coord[0].toFixed(5)}</TableCell>
                <TableCell>{coord.distance}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack
        direction="row"
        spacing={2}
        justifyContent={"space-between"}
        sx={{ marginTop: "16px" }}
      >
        <Button color="inherit" variant="text" onClick={handleDiscardPolygon}>
          Discard
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={handleImportPolygon}
        >
          Insert Polygon
        </Button>
      </Stack>
    </Box>
  );
};

export default PolygonModal;
