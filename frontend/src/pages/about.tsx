import React from 'react';
import Head from 'next/head';
import { Info, Database, TrendingUp, Bell, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About & Methodology - JalDrishti</title>
      </Head>

      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center mb-4">
            <Info className="h-12 w-12 mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">
                About JalDrishti
              </h1>
              <p className="text-xl opacity-90">
                Complete groundwater intelligence system for policy decision-making
              </p>
            </div>
          </div>
        </div>

        {/* What is JalDrishti */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What is JalDrishti?
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            JalDrishti ("Water Vision") is a production-ready groundwater monitoring and early warning system that processes CGWB (Central Ground Water Board) data from 2015-2024. The system provides station-normalized GAVI scoring, multi-layered alerts, district intelligence, and predictive forecasting.
          </p>
          <p className="text-gray-700 leading-relaxed">
            <strong>Innovation:</strong> Unlike traditional monitoring systems that only report current status, JalDrishti provides <strong>anticipation, not just detection</strong> - enabling policy makers to act BEFORE crisis hits through predictive risk analysis.
          </p>
        </div>

        {/* GAVI Methodology */}
        <div className="bg-white rounded-lg border-2 border-blue-200 p-8">
          <div className="flex items-center mb-4">
            <Database className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              What is GAVI?
            </h2>
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            <strong>GAVI (Groundwater Availability Index)</strong> is a station-normalized metric that scores groundwater health from 0-100, enabling fair comparison across India's diverse geology.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-4">
            <h3 className="font-bold text-blue-900 mb-3">Formula</h3>
            <code className="block bg-white p-4 rounded border border-blue-200 text-sm mb-3 overflow-x-auto">
              GAVI = 100 × (1 - (Current_WL - Min_WL) / (Max_WL - Min_WL))
            </code>
            <p className="text-sm text-gray-700">
              Where Current_WL, Min_WL, and Max_WL are water levels specific to each station's historical baseline (2015-2024).
            </p>
          </div>

          <h3 className="font-bold text-gray-900 mb-3">Why Station Normalization?</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Absolute water levels cannot be compared across stations due to varying geology, aquifer characteristics, and measurement depths. A 10m water level may be critical in one location but safe in another.
          </p>
          <p className="text-gray-700 leading-relaxed">
            <strong>Solution:</strong> Each station is scored relative to its own historical range, making GAVI a universally comparable metric.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600 mb-1">0-25</div>
              <div className="text-sm font-semibold text-red-900 mb-2">Critical</div>
              <div className="text-xs text-gray-700">Immediate intervention required</div>
            </div>
            <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600 mb-1">25-50</div>
              <div className="text-sm font-semibold text-orange-900 mb-2">Stressed</div>
              <div className="text-xs text-gray-700">Close monitoring needed</div>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600 mb-1">50-75</div>
              <div className="text-sm font-semibold text-yellow-900 mb-2">Watch</div>
              <div className="text-xs text-gray-700">Stable but declining</div>
            </div>
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 mb-1">75-100</div>
              <div className="text-sm font-semibold text-green-900 mb-2">Safe</div>
              <div className="text-xs text-gray-700">Healthy groundwater levels</div>
            </div>
          </div>
        </div>

        {/* Alert System */}
        <div className="bg-white rounded-lg border-2 border-yellow-200 p-8">
          <div className="flex items-center mb-4">
            <Bell className="h-8 w-8 text-yellow-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              Multi-Layered Alert System
            </h2>
          </div>
          <p className="text-gray-700 mb-6 leading-relaxed">
            JalDrishti uses 4 alert types to capture different failure modes and recovery signals:
          </p>

          <div className="space-y-4">
            <div className="bg-red-50 border-l-4 border-red-600 p-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">🔴</span>
                <h3 className="font-bold text-red-900">Critical Groundwater</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Condition:</strong> GAVI &lt; 25 for 2+ consecutive years
              </p>
              <p className="text-sm text-gray-700">
                <strong>Action:</strong> Immediate intervention required - extraction limits, emergency recharge projects
              </p>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-600 p-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">🟠</span>
                <h3 className="font-bold text-orange-900">Depletion Warning</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Condition:</strong> GAVI &lt; 50 AND declining over 3 years
              </p>
              <p className="text-sm text-gray-700">
                <strong>Action:</strong> Preventive measures before reaching critical - monitoring increase, awareness campaigns
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">🟡</span>
                <h3 className="font-bold text-yellow-900">Sudden Drop</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Condition:</strong> Water level dropped ≥2m year-over-year
              </p>
              <p className="text-sm text-gray-700">
                <strong>Action:</strong> Investigate cause - drought, extraction surge, aquifer breach
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 p-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">🟢</span>
                <h3 className="font-bold text-green-900">Recovery Signal</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Condition:</strong> Water level improved ≥1m year-over-year
              </p>
              <p className="text-sm text-gray-700">
                <strong>Action:</strong> Validate success - recharge activities working, extraction reduced
              </p>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Why Multiple Alert Types?</strong> Different groundwater problems require different responses. A sudden drop may indicate drilling activity, while gradual depletion suggests over-extraction. This layered approach enables targeted interventions.
            </p>
          </div>
        </div>

        {/* Forecasting */}
        <div className="bg-white rounded-lg border-2 border-purple-200 p-8">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              Predictive Forecasting
            </h2>
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            JalDrishti forecasts future groundwater conditions using trend-based linear regression on historical data (2015-2024).
          </p>

          <h3 className="font-bold text-gray-900 mb-3">Methodology</h3>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Linear Regression:</strong> Fit trend line to historical water levels per station
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <strong>1-Year & 3-Year Projections:</strong> Extrapolate trend to predict future water levels
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Future GAVI:</strong> Calculate GAVI scores using predicted water levels
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Alert Classification:</strong> Assign forecast alerts based on predicted GAVI thresholds
              </div>
            </div>
          </div>

          <div className="mt-6 bg-purple-50 rounded-lg p-4">
            <h4 className="font-bold text-purple-900 mb-2">Limitations & Assumptions</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Assumes current extraction and recharge trends continue</li>
              <li>• Does not account for policy interventions or behavioral changes</li>
              <li>• Rainfall variability may affect actual outcomes</li>
              <li>• Confidence decreases for longer forecast horizons</li>
            </ul>
          </div>
        </div>

        {/* Data Source */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Data Source & Coverage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Source</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                <strong>Central Ground Water Board (CGWB)</strong>, Ministry of Jal Shakti, Government of India. Data sourced from the India-WRIS portal covering DWLR (Digital Water Level Recorder) monitoring stations.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Coverage</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• <strong>Timeline:</strong> 2015-2024 (10 years)</li>
                <li>• <strong>Stations:</strong> ~10,000 monitoring wells</li>
                <li>• <strong>States:</strong> 36 (Pan-India)</li>
                <li>• <strong>Records:</strong> ~86,000 observations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Why January Data */}
        <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6">
          <h3 className="font-bold text-blue-900 mb-3">
            📅 Why January Data?
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            January water levels represent post-monsoon stabilized conditions after kharif extraction, providing a consistent annual snapshot. This timing captures the net effect of monsoon recharge minus agricultural extraction, making year-over-year comparisons meaningful for policy analysis.
          </p>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Backend</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• FastAPI 0.109 (Python)</li>
                <li>• Pandas & NumPy (Analytics)</li>
                <li>• Uvicorn (ASGI Server)</li>
                <li>• Pydantic (Data Validation)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Frontend</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• Next.js 14 (React)</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• Leaflet (Maps)</li>
                <li>• Recharts (Visualizations)</li>
                <li>• React Query (Data Fetching)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-primary-50 rounded-lg border-2 border-primary-200 p-6 text-center">
          <h3 className="font-bold text-primary-900 mb-2">
            🌊 JalDrishti - Groundwater Intelligence for India 🇮🇳
          </h3>
          <p className="text-sm text-gray-700">
            Production-ready system for policy decision-making | Version 1.0.0
          </p>
        </div>
      </div>
    </>
  );
}
