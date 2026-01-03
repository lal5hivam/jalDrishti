import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getGAVIColor } from '@/types/api';
import type { DistrictStress } from '@/types/api';

interface DistrictMapProps {
  districts: DistrictStress[];
  onDistrictClick?: (district: DistrictStress) => void;
}

// India bounds
const INDIA_BOUNDS: L.LatLngBoundsExpression = [
  [6.5, 68.0], // Southwest
  [35.5, 97.5], // Northeast
];

// Approximate district center coordinates (sample data for major districts)
// In production, this would come from a complete database
const DISTRICT_COORDS: Record<string, [number, number]> = {
  // Format: "State_District": [lat, lng]
  "Gujarat_Vadodara": [22.3072, 73.1812],
  "Gujarat_Ahmedabad": [23.0225, 72.5714],
  "Maharashtra_Mumbai": [19.0760, 72.8777],
  "Maharashtra_Pune": [18.5204, 73.8567],
  "Maharashtra_Nagpur": [21.1458, 79.0882],
  "Rajasthan_Jaipur": [26.9124, 75.7873],
  "Rajasthan_Jodhpur": [26.2389, 73.0243],
  "Uttar Pradesh_Lucknow": [26.8467, 80.9462],
  "Uttar Pradesh_Kanpur": [26.4499, 80.3319],
  "Tamil Nadu_Chennai": [13.0827, 80.2707],
  "Karnataka_Bangalore": [12.9716, 77.5946],
  "West Bengal_Kolkata": [22.5726, 88.3639],
  "Telangana_Hyderabad": [17.3850, 78.4867],
  "Andhra Pradesh_Visakhapatnam": [17.6868, 83.2185],
  "Kerala_Thiruvananthapuram": [8.5241, 76.9366],
  "Odisha_Bhubaneswar": [20.2961, 85.8245],
  "Punjab_Ludhiana": [30.9010, 75.8573],
  "Haryana_Gurugram": [28.4595, 77.0266],
  "Delhi_New Delhi": [28.6139, 77.2090],
  "Madhya Pradesh_Bhopal": [23.2599, 77.4126],
  "Bihar_Patna": [25.5941, 85.1376],
  "Jharkhand_Ranchi": [23.3441, 85.3096],
  "Assam_Guwahati": [26.1445, 91.7362],
};

const DistrictHeatmap: React.FC<DistrictMapProps> = ({ districts, onDistrictClick }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629], // India center
      zoom: 5,
      maxBounds: INDIA_BOUNDS,
      minZoom: 4,
      maxZoom: 10,
    });

    mapRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 10,
    }).addTo(map);

    // Group districts by state for approximation
    const stateGroups = new Map<string, DistrictStress[]>();
    districts.forEach((district) => {
      if (!stateGroups.has(district.state)) {
        stateGroups.set(district.state, []);
      }
      stateGroups.get(district.state)!.push(district);
    });

    // Approximate state center coordinates
    const stateCoords: Record<string, [number, number]> = {
      "Gujarat": [22.2587, 71.1924],
      "Maharashtra": [19.7515, 75.7139],
      "Rajasthan": [27.0238, 74.2179],
      "Uttar Pradesh": [26.8467, 80.9462],
      "Tamil Nadu": [11.1271, 78.6569],
      "Karnataka": [15.3173, 75.7139],
      "West Bengal": [22.9868, 87.8550],
      "Telangana": [18.1124, 79.0193],
      "Andhra Pradesh": [15.9129, 79.7400],
      "Kerala": [10.8505, 76.2711],
      "Odisha": [20.9517, 85.0985],
      "Punjab": [31.1471, 75.3412],
      "Haryana": [29.0588, 76.0856],
      "Delhi": [28.7041, 77.1025],
      "Madhya Pradesh": [22.9734, 78.6569],
      "Bihar": [25.0961, 85.3131],
      "Jharkhand": [23.6102, 85.2799],
      "Assam": [26.2006, 92.9376],
      "Chhattisgarh": [21.2787, 81.8661],
      "Uttarakhand": [30.0668, 79.0193],
      "Himachal Pradesh": [31.1048, 77.1734],
      "Jammu and Kashmir": [33.7782, 76.5762],
    };

    // Add markers for each district
    districts.forEach((district, index) => {
      // Try to get specific district coordinates, otherwise use state center with offset
      const key = `${district.state}_${district.district}`;
      let coords = DISTRICT_COORDS[key];
      
      if (!coords) {
        // Use state center with small random offset to avoid overlap
        const stateCenter = stateCoords[district.state] || [20.5937, 78.9629];
        const stateDistricts = stateGroups.get(district.state) || [];
        const districtIndex = stateDistricts.indexOf(district);
        
        // Create a grid offset
        const offsetLat = (districtIndex % 5 - 2) * 0.5;
        const offsetLng = (Math.floor(districtIndex / 5) - 2) * 0.5;
        coords = [stateCenter[0] + offsetLat, stateCenter[1] + offsetLng];
      }

      // Create circle marker colored by stressed_ratio
      const color = getStressColor(district.stressed_ratio);
      const circle = L.circleMarker(coords, {
        radius: Math.max(8, Math.min(Math.sqrt(district.total_stations) * 1.5, 25)),
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
      });

      // Popup content
      const popupContent = `
        <div class="p-3 min-w-[200px]">
          <h3 class="font-bold text-lg mb-2">${district.district}</h3>
          <p class="text-sm text-gray-600 mb-2">${district.state}</p>
          <div class="space-y-1 text-sm">
            <div><strong>Avg GAVI:</strong> ${district.avg_gavi.toFixed(1)}</div>
            <div><strong>Stressed:</strong> <span style="color: ${color}; font-weight: bold;">${district.stressed_ratio.toFixed(1)}%</span></div>
            <div><strong>Stations:</strong> ${district.total_stations}</div>
            <div><strong>Alerts:</strong> ${district.critical_alerts + district.depletion_alerts}</div>
            ${district.stress_category ? `<div class="mt-2 pt-2 border-t"><strong>Status:</strong> ${district.stress_category}</div>` : ''}
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);

      if (onDistrictClick) {
        circle.on('click', () => onDistrictClick(district));
      }

      circle.addTo(map);
    });

    // Add legend
    const legend = new L.Control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'bg-white p-3 rounded-lg shadow-lg');
      div.innerHTML = `
        <div class="text-sm font-bold mb-2">Stress Level</div>
        <div class="space-y-1 text-xs">
          <div class="flex items-center">
            <div class="w-4 h-4 rounded-full mr-2" style="background-color: #d32f2f;"></div>
            <span>Critical (≥75%)</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 rounded-full mr-2" style="background-color: #f57c00;"></div>
            <span>High (50-75%)</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 rounded-full mr-2" style="background-color: #fbc02d;"></div>
            <span>Medium (25-50%)</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 rounded-full mr-2" style="background-color: #388e3c;"></div>
            <span>Low (<25%)</span>
          </div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [districts, onDistrictClick]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-lg" />;
};

function getStressColor(stressedRatio: number): string {
  if (stressedRatio >= 75) return '#d32f2f'; // Critical
  if (stressedRatio >= 50) return '#f57c00'; // High stress
  if (stressedRatio >= 25) return '#fbc02d'; // Medium stress
  return '#388e3c'; // Low stress
}

export default DistrictHeatmap;
