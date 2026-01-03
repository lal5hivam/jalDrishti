import React, { useState } from 'react';
import Head from 'next/head';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { useFutureRisk } from '@/hooks/useApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

export default function ForecastPage() {
  const [horizon, setHorizon] = useState<'1y' | '3y'>('1y');

  const { data, isLoading, error } = useFutureRisk(horizon);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading forecast data..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorMessage message="Failed to load forecast data." />
    );
  }

  return (
    <>
      <Head>
        <title>Future Risk & Scenarios - JalDrishti</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-12 w-12 mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Future Risk & Scenarios
              </h1>
              <p className="text-xl opacity-90">
                Anticipation, Not Reaction - Predictive groundwater intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Horizon Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setHorizon('1y')}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
              horizon === '1y'
                ? 'bg-primary-600 text-white shadow-lg scale-105'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            1 Year Forecast
          </button>
          <button
            onClick={() => setHorizon('3y')}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
              horizon === '3y'
                ? 'bg-primary-600 text-white shadow-lg scale-105'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            3 Year Forecast
          </button>
        </div>

        {/* Risk Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border-2 border-red-300 p-8 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Total Stations</h3>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-5xl font-bold text-red-600 mb-2">
              {data.total_stations.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Groundwater monitoring stations
            </p>
          </div>

          <div className="bg-white rounded-xl border-2 border-orange-300 p-8 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Future Critical</h3>
              <span className="text-4xl">🗺️</span>
            </div>
            <p className="text-5xl font-bold text-orange-600 mb-2">
              {data.future_alert_distribution?.FUTURE_CRITICAL?.count || 0}
            </p>
            <p className="text-sm text-gray-600">
              Stations predicted to be critical
            </p>
          </div>

          <div className="bg-white rounded-xl border-2 border-yellow-300 p-8 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Risk Percentage</h3>
              <span className="text-4xl">🇮🇳</span>
            </div>
            <p className="text-5xl font-bold text-yellow-600 mb-2">
              {data.future_alert_distribution?.FUTURE_CRITICAL?.percentage?.toFixed(1) || 0}%
            </p>
            <p className="text-sm text-gray-600">
              Of stations at risk
            </p>
          </div>
        </div>

        {/* Risk Level Banner */}
        <div className="bg-white rounded-xl border-2 border-yellow-400 p-8 shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-6">
              <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-yellow-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Forecast Horizon: {data.horizon === '1y' ? '1 Year' : '3 Years'}
              </h3>
              <p className="text-lg text-gray-800 leading-relaxed">
                Based on historical trends, approximately {data.future_alert_distribution?.FUTURE_CRITICAL?.percentage?.toFixed(1) || 0}% of monitoring stations are predicted to reach critical groundwater levels.
              </p>
            </div>
          </div>
        </div>

        {/* Methodology */}
        <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-8">
          <h3 className="text-xl font-bold text-blue-900 mb-4">
            📊 Forecast Methodology
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Trend-Based Prediction:</strong> Forecasts are generated using linear regression on historical water level trends (2015-2024).
            </p>
            <p>
              <strong>GAVI Calculation:</strong> Future GAVI scores are computed using predicted water levels normalized against station-specific baselines.
            </p>
            <p>
              <strong>Alert Classification:</strong> Forecast alerts are assigned based on predicted GAVI thresholds (Critical &lt; 25, Stressed &lt; 50).
            </p>
            <p>
              <strong>Confidence Levels:</strong> Medium confidence for 1-year projections, lower confidence for 3-year projections due to increased uncertainty.
            </p>
            <p>
              <strong>Limitations:</strong> Forecasts assume current extraction and recharge trends continue. Actual outcomes may vary based on policy interventions, rainfall patterns, and human activities.
            </p>
          </div>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              1-Year Horizon
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Stations at Risk:</span>
                <span className="text-xl font-bold text-red-600">
                  {horizon === '1y' ? (data.future_alert_distribution?.FUTURE_CRITICAL?.count || 0).toLocaleString() : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Confidence:</span>
                <span className="text-sm font-semibold text-green-600">MEDIUM</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700">Planning Window:</span>
                <span className="text-sm font-semibold text-gray-900">Short-term</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              3-Year Horizon
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Stations at Risk:</span>
                <span className="text-xl font-bold text-orange-600">
                  {horizon === '3y' ? (data.future_alert_distribution?.FUTURE_CRITICAL?.count || 0).toLocaleString() : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Confidence:</span>
                <span className="text-sm font-semibold text-yellow-600">LOWER</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700">Planning Window:</span>
                <span className="text-sm font-semibold text-gray-900">Strategic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Recommendations */}
        <div className="bg-green-50 rounded-xl border-2 border-green-300 p-8">
          <h3 className="text-xl font-bold text-green-900 mb-4">
            ✅ Policy Recommendations
          </h3>
          <ul className="space-y-3 text-gray-800">
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-2">1.</span>
              <span>Prioritize districts with highest risk percentage for immediate groundwater recharge projects.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-2">2.</span>
              <span>Implement extraction limits in stations forecasted to reach critical levels within 1 year.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-2">3.</span>
              <span>Launch awareness campaigns in affected states about sustainable groundwater use.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-2">4.</span>
              <span>Establish monitoring frequency increases for stations showing declining trends.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-2">5.</span>
              <span>Allocate budget for artificial recharge structures in high-risk districts.</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
