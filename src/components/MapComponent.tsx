import React, { useEffect, useRef, useState } from "react";

import "ol/ol.css";
import Draw from "ol/interaction/Draw";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import View from "ol/View";
import XYZ from "ol/source/XYZ";
import { fromLonLat, transform } from "ol/proj";
import { LineString, Polygon } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import AppBarComponent from "./AppBar.tsx";
import MapContainer from "./MapContainer.tsx";
import PolygonModal from "./PolygonModal.tsx";
import LineStringDrawer from "./LineStringDrawer.tsx";
import { Box } from "@mui/material";
import haversineDistance from "../utils/distanceCalculator.ts";
const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [drawInteraction, setDrawInteraction] = useState<Draw | null>(null);
  const [coordinates, setCoordinates] = useState<
    { position: number[]; polygons: number[][][] }[]
  >([]);
  const [polygonCoordinates, setPolygonCoordinates] = useState<number[][]>([]);
  const [currentPolygonType, setCurrentPolygonType] = useState<
    "before" | "after" | null
  >(null);
  const [currentPolygonIndex, setCurrentPolygonIndex] = useState<number | null>(
    null
  );
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [dropdownAnchorEl, setDropdownAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [dropdownRowIndex, setDropdownRowIndex] = useState<number | null>(null);
  const openDropdown = Boolean(dropdownAnchorEl);
  const [viewMode, setViewMode] = useState<string>("");

  useEffect(() => {
    const raster = new TileLayer({
      source: new XYZ({
        url: "https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=rktwpfiac0OMeVcXFGMC",
        maxZoom: 20,
      }),
    });

    const drawVector = new VectorLayer({
      source: new VectorSource(),
    });

    const initialMap = new Map({
      target: mapRef.current || undefined,
      layers: [raster, drawVector],
      view: new View({
        center: fromLonLat([82.9726, 22.5937]),
        zoom: 5,
      }),
    });

    setMap(initialMap);

    return () => {
      initialMap.setTarget(undefined);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && drawInteraction) {
        drawInteraction.finishDrawing();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawInteraction]);

  const resetDrawing = () => {
    if (map) {
      const drawLayer = map.getLayers().getArray()[1] as VectorLayer;
      const drawSource = drawLayer.getSource() as VectorSource;

      drawSource.clear();
      setCoordinates([]);
      setPolygonCoordinates([]);
    }
  };

  const startLineStringDrawing = () => {
    if (map) {
      const drawLayer = map.getLayers().getArray()[1] as VectorLayer;
      const drawSource = drawLayer.getSource() as VectorSource;

      const draw = new Draw({
        type: "LineString",
        source: drawSource,
      });

      draw.on("drawend", (event) => {
        const geometry = event.feature.getGeometry() as LineString;
        const coords = geometry.getCoordinates();
        const transformedCoords = coords.map((coord) =>
          transform(coord, "EPSG:3857", "EPSG:4326")
        );
        setCoordinates(
          transformedCoords.map((coord) => ({
            position: coord,
            polygons: [],
          }))
        );
        map.removeInteraction(draw);
        setDrawInteraction(null);
      });

      map.addInteraction(draw);
      setDrawInteraction(draw);
    }
  };

  const startPolygonDrawingWithModal = (
    startingPoint: number[],
    type: "before" | "after",
    index: number
  ) => {
    setViewMode("Polygon");

    if (map) {
      const drawLayer = map.getLayers().getArray()[1] as VectorLayer;
      const drawSource = drawLayer.getSource() as VectorSource;

      const draw = new Draw({
        type: "Polygon",
        source: drawSource,
      });

      const initialCoordinates = [
        transform(startingPoint, "EPSG:4326", "EPSG:3857"),
      ];

      draw.on("drawstart", (event) => {
        const feature = event.feature;
        const geometry = feature.getGeometry() as Polygon;
        geometry.setCoordinates([initialCoordinates]);
      });

      draw.on("drawend", (event) => {
        const geometry = event.feature.getGeometry() as Polygon;
        const coords = geometry.getCoordinates()[0];
        const transformedCoords = coords.map((coord) =>
          transform(coord, "EPSG:3857", "EPSG:4326")
        );
        setPolygonCoordinates(transformedCoords);
        setCurrentPolygonType(type);
        setCurrentPolygonIndex(index);
        map.removeInteraction(draw);
        setDrawInteraction(null);
      });

      map.addInteraction(draw);
      setDrawInteraction(draw);
    }
  };

  const handleImportPolygon = () => {
    if (currentPolygonType !== null && currentPolygonIndex !== null) {
      setCoordinates((prevCoordinates) => {
        const updatedCoordinates = [...prevCoordinates];
        if (
          !updatedCoordinates[currentPolygonIndex].polygons.some(
            (polygon) =>
              JSON.stringify(polygon) === JSON.stringify(polygonCoordinates)
          )
        ) {
          updatedCoordinates[currentPolygonIndex].polygons.push(
            polygonCoordinates
          );
        }
        return updatedCoordinates;
      });
      setViewMode("LineString");
      setPolygonCoordinates([]);
    }
  };

  const handleDiscardPolygon = () => {
    if (currentPolygonIndex !== null && map) {
      const drawLayer = map.getLayers().getArray()[1] as VectorLayer;
      const drawSource = drawLayer.getSource() as VectorSource;

      drawSource.clear();
      setPolygonCoordinates([]);

      const startingPoint = coordinates[currentPolygonIndex].position;
      startPolygonDrawingWithModal(
        startingPoint,
        currentPolygonType!,
        currentPolygonIndex
      );
    }
  };

  const handleDropdownClick = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setDropdownAnchorEl(event.currentTarget);
    setDropdownRowIndex(index);
  };

  const handleDropdownClose = () => {
    setDropdownAnchorEl(null);
    setDropdownRowIndex(null);
  };

  const insertPolygon = (type: "before" | "after", index: number) => {
    const startingPoint = coordinates[index].position;
    startPolygonDrawingWithModal(startingPoint, type, index);
    handleDropdownClose();
  };

  const toggleRowExpansion = (index: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getLineStringData = () => {
    return coordinates.map((coord, index) => {
      const latitude = parseFloat(coord.position[1].toFixed(5));
      const longitude = parseFloat(coord.position[0].toFixed(5));

      let distance = 0;
      if (index < coordinates.length - 1) {
        const nextCoord = coordinates[index + 1].position;
        distance = haversineDistance(
          latitude,
          longitude,
          nextCoord[1],
          nextCoord[0]
        );
      }

      const polygonsWithDistances = coord.polygons.map((polygon) => {
        return polygon.map((coord) => {
          const [lon, lat] = coord;
          return [lon, lat];
        });
      });

      return {
        index: index + 1,
        latitude,
        longitude,
        distance: distance.toFixed(2),
        polygons: polygonsWithDistances,
      };
    });
  };

  const handleSetViewMode = (mode: string) => {
    setViewMode(mode);
    startLineStringDrawing();
  };

  return (
    <Box>
      <AppBarComponent
        resetDrawing={resetDrawing}
        setViewMode={() => handleSetViewMode("LineString")}
      />
      <MapContainer mapRef={mapRef} />

      {viewMode === "LineString" && (
        <LineStringDrawer
          dropdownAnchorEl={dropdownAnchorEl}
          dropdownRowIndex={dropdownRowIndex}
          expandedRows={expandedRows}
          getLineStringData={getLineStringData}
          handleDropdownClick={handleDropdownClick}
          handleDropdownClose={handleDropdownClose}
          insertPolygon={insertPolygon}
          openDropdown={openDropdown}
          toggleRowExpansion={toggleRowExpansion}
        />
      )}

      {viewMode === "Polygon" && (
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
          <PolygonModal
            handleDiscardPolygon={handleDiscardPolygon}
            handleImportPolygon={handleImportPolygon}
            polygonCoordinates={polygonCoordinates}
            setViewMode={setViewMode}
          />
        </Box>
      )}
    </Box>
  );
};

export default MapComponent;
