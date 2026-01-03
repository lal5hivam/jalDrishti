import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, MapPin, TrendingUp } from 'lucide-react';
import { useNationalSummary, useCriticalAlerts, useAlertsByType } from '@/hooks/useApi';
import StatCard from '@/components/StatCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { formatPercentage } from '@/lib/utils';
import { getAlertConfig } from '@/types/api';

export default function Home() {
  const {
    data: nationalData,
    isLoading: nationalLoading,
    error: nationalError,
    refetch: refetchNational,
  } = useNationalSummary();

  const {
    data: criticalData,
    isLoading: criticalLoading,
    error: criticalError,
    refetch: refetchCritical,
  } = useCriticalAlerts();

  const {
    data: alertsByType,
    isLoading: alertsLoading,
    error: alertsError,
  } = useAlertsByType();

  if (nationalLoading || criticalLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading national overview..." />
      </div>
    );
  }

  if (nationalError || criticalError || alertsError) {
    return (
      <ErrorMessage
        message="Failed to load national overview. Please check if the API server is running."
        retry={() => {
          refetchNational();
          refetchCritical();
        }}
      />
    );
  }

  if (!nationalData || !criticalData) {
    return <ErrorMessage message="No data available" />;
  }

  return (
    <>
      <Head>
        <title>JalDrishti - National Groundwater Overview</title>
      </Head>

      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-lg p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">
            National Groundwater Status
          </h1>
          <p className="text-xl opacity-90 mb-6">
            Monitoring {nationalData.total_stations} stations across India with {nationalData.stressed_percentage}% under stress.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/districts"
              className="inline-flex items-center px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              View District Map
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/alerts"
              className="inline-flex items-center px-6 py-3 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-600 border-2 border-white transition-colors"
            >
              View Critical Alerts
              <AlertTriangle className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Key Statistics */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Key Statistics ({nationalData.year})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Stations Under Stress"
              value={formatPercentage(nationalData.stressed_percentage)}
              subtitle={`${nationalData.total_stations} total stations monitored`}
              color="warning"
              icon="⚠️"
            />
            <StatCard
              title="Critical Alerts Active"
              value={nationalData.active_critical_alerts}
              subtitle="Immediate intervention required"
              color="danger"
              icon="🔴"
            />
            <StatCard
              title="Average National GAVI"
              value={nationalData.average_gavi.toFixed(1)}
              subtitle="Groundwater Availability Index"
              color={nationalData.average_gavi < 50 ? 'warning' : 'success'}
              icon="💧"
            />
            <StatCard
              title="Forecasted Critical (1y)"
              value={criticalData.future_critical_1y}
              subtitle="Stations at risk within 1 year"
              color="warning"
              icon="🔮"
            />
          </div>
        </div>

        {/* Alert Distribution */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Alert Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(alertsByType) && alertsByType.map((alert) => {
              const config = getAlertConfig(alert.alert_type);
              return (
                <div key={alert.alert_type} className="bg-white rounded-lg border-2 p-6" style={{ borderColor: config.color }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{config.icon}</span>
                    <span className="text-3xl font-bold" style={{ color: config.color }}>
                      {alert.count}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{config.label}</p>
                  <p className="text-xs text-gray-600 mt-1">{alert.percentage.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Critical Districts Summary */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Top Affected Districts
          </h2>
          <p className="text-gray-700 mb-6">
            Districts with highest critical alert counts requiring immediate attention.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    District
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Current Critical
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Future Risk (1y)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Stressed Ratio
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Avg GAVI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {criticalData.top_affected_districts.slice(0, 5).map((district, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {district.district}, {district.state}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600 font-semibold">
                      {district.current_critical}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600 font-semibold">
                      {district.future_critical_1y}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                      {district.stressed_ratio.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {district.avg_gavi.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex items-center justify-end">
            <Link
              href="/alerts"
              className="inline-flex items-center text-sm font-medium text-primary-700 hover:text-primary-800"
            >
              View All Alerts
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Explore Dashboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/districts"
              className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-primary-500 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center mb-3">
                <MapPin className="h-8 w-8 text-primary-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">District Map</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                View district-wise stress levels on an interactive map
              </p>
              <span className="text-sm font-medium text-primary-700 group-hover:underline">
                Explore Map →
              </span>
            </Link>

            <Link
              href="/stations"
              className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-primary-500 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center mb-3">
                <MapPin className="h-8 w-8 text-primary-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Station Search</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Find and analyze specific monitoring stations
              </p>
              <span className="text-sm font-medium text-primary-700 group-hover:underline">
                Search Stations →
              </span>
            </Link>

            <Link
              href="/forecast"
              className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-primary-500 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center mb-3">
                <TrendingUp className="h-8 w-8 text-primary-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Future Risk</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                View predictive forecasts and risk analysis
              </p>
              <span className="text-sm font-medium text-primary-700 group-hover:underline">
                View Forecasts →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
