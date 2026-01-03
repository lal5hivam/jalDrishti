import React, { useState } from 'react';
import Head from 'next/head';
import { AlertTriangle, TrendingDown, AlertCircle, TrendingUp } from 'lucide-react';
import { useCriticalAlerts, useAlertsByType, useFutureRisk } from '@/hooks/useApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import AlertBadge from '@/components/AlertBadge';
import { getAlertConfig } from '@/types/api';

type TabType = 'current' | 'depletion' | 'recovery' | 'future';

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('current');
  const [futureHorizon, setFutureHorizon] = useState<'1y' | '3y'>('1y');

  const {
    data: criticalData,
    isLoading: criticalLoading,
    error: criticalError,
  } = useCriticalAlerts();

  const {
    data: alertsByType,
    isLoading: alertsLoading,
    error: alertsError,
  } = useAlertsByType();

  const {
    data: futureRiskData,
    isLoading: riskLoading,
    error: riskError,
  } = useFutureRisk(futureHorizon);

  if (criticalLoading || alertsLoading || riskLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading alerts..." />
      </div>
    );
  }

  if (criticalError || alertsError || riskError) {
    return (
      <ErrorMessage message="Failed to load alert data. Please check if the API server is running." />
    );
  }

  if (!criticalData || !alertsByType || !futureRiskData) {
    return <ErrorMessage message="No data available" />;
  }

  const tabs = [
    { id: 'current' as TabType, label: 'Current Critical', icon: AlertCircle, color: 'red' },
    { id: 'depletion' as TabType, label: 'Depletion Warnings', icon: TrendingDown, color: 'orange' },
    { id: 'recovery' as TabType, label: 'Recovery Signals', icon: TrendingUp, color: 'green' },
    { id: 'future' as TabType, label: 'Future Risk', icon: AlertTriangle, color: 'yellow' },
  ];

  return (
    <>
      <Head>
        <title>Alert & Early Warning Center - JalDrishti</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Alert & Early Warning Center
          </h1>
          <p className="text-gray-600">
            Real-time monitoring and predictive risk analysis for groundwater stress
          </p>
        </div>

        {/* Summary Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                ⚠️ {criticalData.current_critical_count} Critical Alerts Active
              </h2>
              <p className="text-lg opacity-90 mb-4">Stations requiring immediate intervention for groundwater depletion.</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <span className="block font-bold text-2xl">{criticalData.future_critical_1y}</span>
                  <span className="block">At risk (1 year)</span>
                </div>
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <span className="block font-bold text-2xl">{criticalData.future_critical_3y}</span>
                  <span className="block">At risk (3 years)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Distribution Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.isArray(alertsByType) && alertsByType.map((alert) => {
            const config = getAlertConfig(alert.alert_type);
            return (
              <div
                key={alert.alert_type}
                className="bg-white rounded-lg border-2 p-4"
                style={{ borderColor: config.color }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{config.icon}</span>
                  <span className="text-3xl font-bold" style={{ color: config.color }}>
                    {alert.count}
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-1">{config.label}</h3>
                <p className="text-xs text-gray-600 mb-2">{config.description}</p>
                <div className="text-sm font-bold" style={{ color: config.color }}>
                  {alert.percentage.toFixed(1)}% of stations
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? `border-${tab.color}-500 text-${tab.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'current' && (
            <div className="space-y-4">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  Current Critical Groundwater Conditions
                </h3>
                <p className="text-red-800 mb-4">
                  {criticalData.current_critical_count} stations are currently in critical condition (GAVI &lt; 25)
                </p>
                <p className="text-sm text-red-700">
                  <strong>Action Required:</strong> Immediate intervention needed for critical groundwater stations.
                </p>
              </div>

              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Top Affected Districts
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          District
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          Current Critical
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          Future Risk (1y)
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          Stressed Ratio
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          Avg GAVI
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {criticalData.top_affected_districts.map((district, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {district.district}, {district.state}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-red-600">
                            {district.current_critical}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-orange-600">
                            {district.future_critical_1y}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">
                            {district.stressed_ratio.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                            {district.avg_gavi.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'depletion' && (
            <div className="bg-white rounded-lg border-2 border-orange-300 p-6">
              <div className="flex items-start mb-4">
                <TrendingDown className="h-8 w-8 text-orange-600 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-orange-900 mb-2">
                    Depletion Warnings
                  </h3>
                  <p className="text-orange-800 mb-4">
                    {(alertsByType || []).find((a) => a.alert_type === 'DEPLETION_WARNING')?.count || 0} stations showing declining trends with GAVI below 50
                  </p>
                  <p className="text-sm text-gray-700">
                    These stations are not yet critical but show concerning downward trends that require close monitoring and preventive action.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recovery' && (
            <div className="bg-white rounded-lg border-2 border-green-300 p-6">
              <div className="flex items-start mb-4">
                <TrendingUp className="h-8 w-8 text-green-600 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-green-900 mb-2">
                    Recovery Signals
                  </h3>
                  <p className="text-green-800 mb-4">
                    {(alertsByType || []).find((a) => a.alert_type === 'RECOVERY_SIGNAL')?.count || 0} stations showing positive recovery (≥1m improvement)
                  </p>
                  <p className="text-sm text-gray-700">
                    These stations demonstrate successful recharge activities or reduced extraction, validating conservation efforts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'future' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Predictive Risk Analysis
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFutureHorizon('1y')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      futureHorizon === '1y'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    1 Year
                  </button>
                  <button
                    onClick={() => setFutureHorizon('3y')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      futureHorizon === '3y'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    3 Years
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border-2 border-red-200 p-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Stations at Risk</h4>
                  <p className="text-4xl font-bold text-red-600 mb-2">
                    {futureRiskData.total_stations}
                  </p>
                  <p className="text-sm text-gray-700">
                    Total monitored stations
                  </p>
                </div>

                <div className="bg-white rounded-lg border-2 border-orange-200 p-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Future Critical</h4>
                  <p className="text-4xl font-bold text-orange-600 mb-2">
                    {futureRiskData.future_alert_distribution?.FUTURE_CRITICAL?.count || 0}
                  </p>
                  <p className="text-sm text-gray-700">
                    Predicted critical stations
                  </p>
                </div>

                <div className="bg-white rounded-lg border-2 border-yellow-200 p-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">States at Risk</h4>
                  <p className="text-4xl font-bold text-yellow-600 mb-2">
                    {Object.keys(futureRiskData.top_10_states_at_risk || {}).length}
                  </p>
                  <p className="text-sm text-gray-700">
                    Top affected states
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                <h4 className="text-lg font-bold text-yellow-900 mb-2">
                  Forecast Horizon: {futureRiskData.horizon === '1y' ? '1 Year' : '3 Years'}
                </h4>
                <p className="text-yellow-800 mb-4">
                  Based on current trends, {futureRiskData.future_alert_distribution?.FUTURE_CRITICAL?.percentage || 0}% of stations may enter critical condition.
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Monitoring Period:</strong> {futureHorizon === '1y' ? '1 year' : '3 years'} ahead based on historical water level patterns
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
