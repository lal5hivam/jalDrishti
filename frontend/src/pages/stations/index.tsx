import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Search, MapPin, Filter, ArrowRight } from 'lucide-react';
import { useStationList } from '@/hooks/useApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import AlertBadge from '@/components/AlertBadge';
import GAVIBadge from '@/components/GAVIBadge';
import dynamic from 'next/dynamic';
import type { StationListItem } from '@/types/api';

const StationMap = dynamic(() => import('@/components/StationMap'), {
  ssr: false,
  loading: () => <LoadingSpinner size="lg" text="Loading map..." />,
});

export default function StationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedAlert, setSelectedAlert] = useState('');
  const [selectedStation, setSelectedStation] = useState<StationListItem | null>(null);

  const { data, isLoading, error, refetch } = useStationList({
    state: selectedState || undefined,
    district: selectedDistrict || undefined,
    alert_type: selectedAlert || undefined,
  });

  const filteredStations = useMemo(() => {
    if (!data) return [];
    return data.filter(
      (station) =>
        station.station_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.district.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const uniqueStates = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map((s) => s.state))).sort();
  }, [data]);

  const uniqueDistricts = useMemo(() => {
    if (!data) return [];
    const districts = data
      .filter((s) => !selectedState || s.state === selectedState)
      .map((s) => s.district);
    return Array.from(new Set(districts)).sort();
  }, [data, selectedState]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading stations..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message="Failed to load station data."
        retry={refetch}
      />
    );
  }

  return (
    <>
      <Head>
        <title>Station Search & Map - JalDrishti</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Station Search & Map
          </h1>
          <p className="text-gray-600">
            Search and analyze {filteredStations.length} groundwater monitoring stations
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search station ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict('');
              }}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All States</option>
              {uniqueStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={!selectedState}
            >
              <option value="">All Districts</option>
              {uniqueDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>

            <select
              value={selectedAlert}
              onChange={(e) => setSelectedAlert(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Alerts</option>
              <option value="CRITICAL_GROUNDWATER">Critical Groundwater</option>
              <option value="DEPLETION_WARNING">Depletion Warning</option>
              <option value="SUDDEN_DROP">Sudden Drop</option>
              <option value="RECOVERY_SIGNAL">Recovery Signal</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Station Locations
            </h2>
            <div className="h-[600px]">
              <StationMap
                stations={filteredStations}
                onStationClick={(alert) => {
                  const station = filteredStations.find(s => s.station_id === alert.station_id);
                  if (station) setSelectedStation(station);
                }}
              />
            </div>
          </div>

          {/* Station List */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Stations ({filteredStations.length})
            </h2>
            <div className="h-[600px] overflow-y-auto space-y-2 pr-2">
              {filteredStations.map((station) => (
                <div
                  key={station.station_id}
                  onClick={() => setSelectedStation(station)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedStation?.station_id === station.station_id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-sm">{station.station_id}</h4>
                      <p className="text-xs text-gray-600">
                        {station.district}, {station.state}
                      </p>
                    </div>
                    <GAVIBadge gavi={station.latest_gavi} size="sm" showLabel={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <AlertBadge alert={station.latest_alert} size="sm" />
                    <Link
                      href={`/stations/${station.station_id}`}
                      className="text-xs font-medium text-primary-700 hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Station Detail */}
        {selectedStation && (
          <div className="bg-white rounded-lg border-2 border-primary-300 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedStation.station_id}
                </h3>
                <p className="text-gray-600">
                  {selectedStation.district}, {selectedStation.state}
                </p>
              </div>
              <Link
                href={`/stations/${selectedStation.station_id}`}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                View Full Details
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Latest GAVI</p>
                <GAVIBadge gavi={selectedStation.latest_gavi} size="lg" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Alert Status</p>
                <AlertBadge alert={selectedStation.latest_alert} size="lg" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Location</p>
                <p className="text-sm text-gray-700">
                  {selectedStation.latitude.toFixed(4)}, {selectedStation.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
