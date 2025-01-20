import React from "react";
import {
  Box,
  Checkbox,
  Collapse,
  MenuItem as DropdownMenuItem,
  IconButton,
  Menu,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface LineStringDrawerProps {
  getLineStringData: () => {
    index: number;
    latitude: number;
    longitude: number;
    polygons: number[][][];
    distance: string;
  }[];
  handleDropdownClick: (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => void;
  toggleRowExpansion: (index: number) => void;
  expandedRows: { [key: number]: boolean };
  dropdownAnchorEl: HTMLElement | null;
  openDropdown: boolean;
  dropdownRowIndex: number | null;
  handleDropdownClose: () => void;
  insertPolygon: (position: "before" | "after", index: number) => void;
}

const LineStringDrawer: React.FC<LineStringDrawerProps> = ({
  getLineStringData,
  handleDropdownClick,
  toggleRowExpansion,
  expandedRows,
  dropdownAnchorEl,
  openDropdown,
  dropdownRowIndex,
  handleDropdownClose,
  insertPolygon,
}) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "10%",
        right: "10%",
        width: 500,
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
      }}
    >
      <Typography variant="h5" sx={{ marginBottom: "8px" }}>
        Mission Creation
      </Typography>
      {getLineStringData?.length === 0 && (
        <Box
          sx={{
            p: 2,
            border: "1px dotted #333",
            background: "#f0f0f0",
            mb: 3,
          }}
        >
          <Typography>
            Click on the map to mark the points on the route and press enter to
            complete the route
          </Typography>
        </Box>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>WP</TableCell>
              <TableCell>Latitude</TableCell>
              <TableCell>Longitude</TableCell>
              <TableCell>Distance</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getLineStringData().map((row, index) => (
              <>
                <TableRow key={index}>
                  <TableCell>
                    <Checkbox />
                    {row.index}
                  </TableCell>
                  <TableCell>{row.latitude}</TableCell>
                  <TableCell>{row.longitude}</TableCell>
                  <TableCell>{row.distance}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(event) => handleDropdownClick(event, index)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={dropdownAnchorEl}
                      open={openDropdown && dropdownRowIndex === index}
                      onClose={handleDropdownClose}
                    >
                      <DropdownMenuItem
                        onClick={() => insertPolygon("before", index)}
                      >
                        Insert Polygon Before
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => insertPolygon("after", index)}
                      >
                        Insert Polygon After
                      </DropdownMenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
                {row.polygons.length > 0 && (
                  <>
                    <TableRow>
                      <TableCell colSpan={5}>
                        <IconButton onClick={() => toggleRowExpansion(index)}>
                          {expandedRows[index] ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                        Polygons
                      </TableCell>
                    </TableRow>
                    <Collapse
                      in={expandedRows[index]}
                      timeout="auto"
                      unmountOnExit
                    >
                      {row.polygons.map((polygon, polyIndex) => (
                        <TableRow key={`${index}-${polyIndex}`}>
                          <TableCell colSpan={5}>
                            <Typography variant="subtitle2">
                              Polygon Coordinates:
                            </Typography>
                            <Table size="small">
                              <TableBody>
                                {polygon.map((coord, coordIndex) => (
                                  <TableRow
                                    key={`${index}-${polyIndex}-${coordIndex}`}
                                  >
                                    <TableCell>{coordIndex + 1}</TableCell>
                                    <TableCell>{coord[1].toFixed(5)}</TableCell>
                                    <TableCell>{coord[0].toFixed(5)}</TableCell>
                                    <TableCell></TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableCell>
                        </TableRow>
                      ))}
                    </Collapse>
                  </>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LineStringDrawer;
