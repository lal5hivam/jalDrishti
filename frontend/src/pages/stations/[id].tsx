import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, MapPin, TrendingDown, TrendingUp } from 'lucide-react';
import { useStationTimeSeries } from '@/hooks/useApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import GAVIBadge from '@/components/GAVIBadge';
import AlertBadge from '@/components/AlertBadge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StationDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const stationId = typeof id === 'string' ? id : '';

  const { data, isLoading, error } = useStationTimeSeries(stationId, !!stationId);

  if (!stationId) {
    return <div>Invalid station ID</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading station data..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorMessage message="Failed to load station data. Station may not exist or API is unavailable." />
    );
  }

  // Prepare chart data
  const historicalData = data.historical.map((point) => ({
    year: point.year,
    water_level: point.water_level,
    gavi: point.gavi,
    type: 'Historical',
  }));

  const forecastData = data.forecast.map((point) => ({
    year: point.year,
    water_level: point.predicted_water_level,
    gavi: point.predicted_gavi,
    type: 'Forecast',
    confidence: point.confidence,
  }));

  const combinedData = [...historicalData, ...forecastData];

  return (
    <>
      <Head>
        <title>Station {stationId} - JalDrishti</title>
      </Head>

      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/stations"
          className="inline-flex items-center text-primary-700 hover:text-primary-800 font-medium"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Stations
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Station {data.station_id}
              </h1>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{data.district}, {data.state}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Current Status ({data.current_status.latest_year})</p>
              <GAVIBadge gavi={data.current_status.latest_gavi} size="lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">Latest Alert</p>
              <AlertBadge alert={data.current_status.latest_alert} size="md" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">Min Water Level</p>
              <p className="text-xl font-bold text-gray-900">{data.baseline.min_water_level.toFixed(2)}m</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">Max Water Level</p>
              <p className="text-xl font-bold text-gray-900">{data.baseline.max_water_level.toFixed(2)}m</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Water Level</p>
              <p className="text-xl font-bold text-gray-900">{data.baseline.avg_water_level.toFixed(2)}m</p>
            </div>
          </div>
        </div>

        {/* Time Series Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Water Level Chart */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Water Level Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis label={{ value: 'Water Level (m)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="water_level"
                  stroke="#1890ff"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Water Level"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* GAVI Chart */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              GAVI Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis label={{ value: 'GAVI Score', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="gavi"
                  stroke="#52c41a"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="GAVI"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forecast Panel */}
        <div className="bg-white rounded-lg border-2 border-primary-300 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🔮 Future Projections
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {data.forecast.map((point, idx) => (
              <div key={idx} className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-5 border-2 border-blue-200">
                <h4 className="text-lg font-bold text-blue-900 mb-3">
                  {point.year} Forecast
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Predicted GAVI:</span>
                    <GAVIBadge gavi={point.predicted_gavi} size="md" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Predicted Water Level:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {point.predicted_water_level.toFixed(2)}m
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Alert Forecast:</span>
                    <AlertBadge alert={point.forecast_alert} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Confidence:</span>
                    <span className="text-sm font-semibold text-blue-700 uppercase">
                      {point.confidence}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-5">
            <h4 className="text-lg font-bold text-yellow-900 mb-2">
              📊 Analysis
            </h4>
            <p className="text-gray-800 text-sm leading-relaxed">
              {data.explanation}
            </p>
          </div>
        </div>

        {/* Historical Data Table */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Historical Data
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Year</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Water Level (m)</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">GAVI</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.historical.slice().reverse().map((point, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{point.year}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {point.water_level.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <GAVIBadge gavi={point.gavi} size="sm" showLabel={false} />
                    </td>
                    <td className="px-4 py-3">
                      {point.alert ? (
                        <AlertBadge alert={point.alert} size="sm" showIcon={false} />
                      ) : (
                        <span className="text-sm text-gray-500">No alert</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
