import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { useDistrictSummary, useStationAlerts } from '@/hooks/useApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import GAVIBadge from '@/components/GAVIBadge';
import AlertBadge from '@/components/AlertBadge';
import dynamic from 'next/dynamic';
import type { DistrictStress } from '@/types/api';

// Dynamic import for map to avoid SSR issues
const StationMap = dynamic(() => import('@/components/StationMap'), {
  ssr: false,
  loading: () => <LoadingSpinner size="lg" text="Loading map..." />,
});

type SortField = 'stressed_ratio' | 'critical_ratio' | 'avg_gavi' | 'total_alerts';

export default function DistrictsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [minStressRatio, setMinStressRatio] = useState<number>(0);
  const [sortField, setSortField] = useState<SortField>('stressed_ratio');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictStress | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(5);
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | null>(null);

  const { data, isLoading, error, refetch } = useDistrictSummary({
    state: selectedState || undefined,
    min_stressed_ratio: minStressRatio || undefined,
    sort_by: sortField,
  });

  // Fetch all station data for map
  const { data: stationData, isLoading: stationsLoading } = useStationAlerts({
    state: selectedState || undefined,
    limit: 10000, // Fetch all stations
  });

  // Filter districts by search term
  const filteredDistricts = useMemo(() => {
    if (!data) return [];
    return data.filter(
      (d) =>
        d.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.state.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Get unique states for filter
  const uniqueStates = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map((d) => d.state))).sort();
  }, [data]);

  if (isLoading || stationsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading district data..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message="Failed to load district data. Please check if the API server is running."
        retry={refetch}
      />
    );
  }

  return (
    <>
      <Head>
        <title>District Stress Map - JalDrishti</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            District Stress Map
          </h1>
          <p className="text-gray-600">
            Interactive visualization of groundwater stress levels across {filteredDistricts.length} districts
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search district or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* State Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
              >
                <option value="">All States</option>
                {uniqueStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Stress Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Stress Ratio: {minStressRatio}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minStressRatio}
                onChange={(e) => setMinStressRatio(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
              >
                <option value="stressed_ratio">Sort by Stress Ratio</option>
                <option value="critical_ratio">Sort by Critical Ratio</option>
                <option value="avg_gavi">Sort by GAVI</option>
                <option value="total_alerts">Sort by Total Alerts</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-4 h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Stress Level Heatmap
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-bold text-primary-600">{stationData?.length || 0}</span> stations {selectedState && `in ${selectedState}`}
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-[#388e3c] mr-2"></div>
                      <span>Low (&lt;25%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-[#fbc02d] mr-2"></div>
                      <span>Medium (25-50%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-[#f57c00] mr-2"></div>
                      <span>High (50-75%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-[#d32f2f] mr-2"></div>
                      <span>Critical (&gt;75%)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-[520px]">
                {stationData && (
                  <StationMap
                    stations={stationData}
                    onZoomChange={setMapZoom}
                    onBoundsChange={setMapBounds}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Rankings Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-4 max-h-[600px] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                District Rankings
              </h2>

              {selectedDistrict && (
                <div className="bg-primary-50 border-2 border-primary-300 rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-lg mb-2">{selectedDistrict.district}</h3>
                  <p className="text-sm text-gray-600 mb-3">{selectedDistrict.state}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">GAVI:</span>
                      <GAVIBadge gavi={selectedDistrict.avg_gavi} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Stressed:</span>
                      <span className="text-lg font-bold text-orange-600">
                        {selectedDistrict.stressed_ratio.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Stations:</span>
                      <span className="text-lg font-bold">{selectedDistrict.total_stations}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Alerts:</span>
                      <span className="text-lg font-bold text-red-600">
                        {selectedDistrict.critical_alerts + selectedDistrict.depletion_alerts}
                      </span>
                    </div>
                    {selectedDistrict.future_risk_flag && (
                      <div className="mt-2 pt-2 border-t border-primary-300">
                        <span className="text-sm font-medium text-red-600">
                          ⚠️ Future risk identified
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {filteredDistricts.slice(0, 20).map((district, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedDistrict(district)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedDistrict?.district === district.district
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{district.district}</h4>
                        <p className="text-xs text-gray-600">{district.state}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">
                          {district.stressed_ratio.toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-600">stressed</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>GAVI: {district.avg_gavi.toFixed(1)}</span>
                      <span>Stations: {district.total_stations}</span>
                      <span className="text-red-600 font-medium">
                        {district.critical_alerts + district.depletion_alerts} alerts
                      </span>
                    </div>
                    {district.future_risk_flag && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs text-red-600 font-medium">
                          🔮 Future risk
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
