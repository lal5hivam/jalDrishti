import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
// @ts-ignore
import 'leaflet.markercluster';
import { getGAVIColor, getStationGavi, getStationAlert } from '@/types/api';
import type { MapStation } from '@/types/api';

interface StationMapProps {
  stations: MapStation[];
  onStationClick?: (station: MapStation) => void;
  onZoomChange?: (zoom: number) => void;
  onBoundsChange?: (bounds: [[number, number], [number, number]]) => void;
}

// Custom hook to add marker clustering
function useMarkerCluster(stations: MapStation[], onStationClick?: (station: MapStation) => void) {
  const map = useMap();
  const clusterGroupRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    // Create marker cluster group if it doesn't exist
    if (!clusterGroupRef.current) {
      // @ts-ignore - L.markerClusterGroup is added by the plugin
      clusterGroupRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
      });
      map.addLayer(clusterGroupRef.current);
    }

    const clusterGroup = clusterGroupRef.current;
    
    // Clear existing markers
    clusterGroup.clearLayers();

    // Add markers
    stations.forEach((station) => {
      const gavi = getStationGavi(station);
      const alert = getStationAlert(station);
      const color = getGAVIColor(gavi);
      const icon = L.divIcon({
        html: `<div style="
          background-color: ${color};
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        className: 'custom-marker-icon',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([station.latitude, station.longitude], { icon });
      
      const waterLevel = 'water_level' in station ? station.water_level : null;
      const popupContent = `
        <div style="padding: 8px;">
          <h4 style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${station.station_id}</h4>
          <p style="font-size: 12px; color: #666; margin-bottom: 8px;">
            ${station.district}, ${station.state}
          </p>
          <div style="font-size: 12px; line-height: 1.6;">
            <div><strong>GAVI:</strong> ${gavi.toFixed(1)}</div>
            <div><strong>Alert:</strong> ${alert}</div>
            ${waterLevel != null ? `<div><strong>Water Level:</strong> ${waterLevel.toFixed(2)}m</div>` : ''}
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      
      if (onStationClick) {
        marker.on('click', () => onStationClick(station));
      }
      
      clusterGroup.addLayer(marker);
    });

    // Cleanup
    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [map, stations, onStationClick]);

  return null;
}

// Component to handle map events
function MapEventHandler({ onZoomChange, onBoundsChange }: {
  onZoomChange?: (zoom: number) => void;
  onBoundsChange?: (bounds: [[number, number], [number, number]]) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const handleZoomEnd = () => {
      const zoom = map.getZoom();
      onZoomChange?.(zoom);
      
      const bounds = map.getBounds();
      onBoundsChange?.([
        [bounds.getSouth(), bounds.getWest()],
        [bounds.getNorth(), bounds.getEast()]
      ]);
    };

    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      onBoundsChange?.([
        [bounds.getSouth(), bounds.getWest()],
        [bounds.getNorth(), bounds.getEast()]
      ]);
    };

    map.on('zoomend', handleZoomEnd);
    map.on('moveend', handleMoveEnd);

    // Set initial values
    const bounds = map.getBounds();
    onBoundsChange?.([
      [bounds.getSouth(), bounds.getWest()],
      [bounds.getNorth(), bounds.getEast()]
    ]);
    onZoomChange?.(map.getZoom());

    return () => {
      map.off('zoomend', handleZoomEnd);
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onBoundsChange, onZoomChange]);

  return null;
}

const createCustomIcon = (gavi: number): L.DivIcon => {
  const color = getGAVIColor(gavi);
  const html = `
    <div style="
      background-color: ${color};
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>
  `;

  return L.divIcon({
    html,
    className: 'custom-marker-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const StationMap: React.FC<StationMapProps> = ({ stations, onStationClick, onZoomChange, onBoundsChange }) => {
  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapEventHandler onZoomChange={onZoomChange} onBoundsChange={onBoundsChange} />
      <MarkerClusterLayer stations={stations} onStationClick={onStationClick} />
    </MapContainer>
  );
};

// Component that uses the custom hook
function MarkerClusterLayer({ stations, onStationClick }: {
  stations: MapStation[];
  onStationClick?: (station: MapStation) => void;
}) {
  useMarkerCluster(stations, onStationClick);
  return null;
}

export default StationMap;
