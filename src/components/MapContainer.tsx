import React, { RefObject } from "react";
import { Box } from "@mui/material";

interface MapContainerProps {
  mapRef: RefObject<HTMLDivElement | null>;
}
const MapContainer: React.FC<MapContainerProps> = ({ mapRef }) => {
  return (
    <Box
      ref={mapRef}
      sx={{
        width: "100%",
        height: "700px",
        border: "1px solid #ccc",
        marginTop: "16px",
      }}
    ></Box>
  );
};

export default MapContainer;
