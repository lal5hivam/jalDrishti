import React, { useState } from 'react';
import Head from 'next/head';
import { Download, FileText, CheckCircle } from 'lucide-react';
import { useReportMetadata } from '@/hooks/useApi';
import { api } from '@/lib/api-client';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { downloadBlob, formatDate } from '@/lib/utils';

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const { data, isLoading, error } = useReportMetadata();

  const handleDownload = async (reportType: string, filename: string) => {
    try {
      setDownloading(reportType);
      const blob = await api.reports.download(reportType);
      downloadBlob(blob, filename);
    } catch (err) {
      alert('Failed to download report. Please try again.');
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading reports..." />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorMessage message="Failed to load report metadata." />;
  }

  return (
    <>
      <Head>
        <title>Reports & Downloads - JalDrishti</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reports & Downloads
          </h1>
          <p className="text-gray-600">
            Export groundwater intelligence data for offline analysis and briefings
          </p>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(data || []).map((report) => (
            <div
              key={report.report_type}
              className={`bg-white rounded-lg border-2 p-6 ${
                report.available ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {report.report_type.replace(/_/g, ' ').toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                </div>
                {report.available && (
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Records:</span>
                  <span className="font-semibold">{report.record_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Last Updated:</span>
                  <span className="font-semibold">{formatDate(report.last_updated)}</span>
                </div>
              </div>

              <button
                onClick={() =>
                  handleDownload(
                    report.report_type,
                    `${report.report_type}_${new Date().toISOString().split('T')[0]}.csv`
                  )
                }
                disabled={!report.available || downloading === report.report_type}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                  report.available && downloading !== report.report_type
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {downloading === report.report_type ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Download CSV
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            📊 How to Use These Reports
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>District Stress Report:</strong> Use for resource allocation decisions and district-level prioritization. Contains aggregated metrics for all districts.
            </p>
            <p>
              <strong>State Summary:</strong> Ideal for state-level budget planning and comparative analysis. Shows state-wise alert distribution.
            </p>
            <p>
              <strong>Station Alerts:</strong> Complete station-level dataset with current GAVI scores and alert classifications. Use for detailed analysis.
            </p>
            <p>
              <strong>Critical Alerts:</strong> Emergency response dataset focusing on stations requiring immediate intervention.
            </p>
            <p>
              <strong>Forecast Data:</strong> Predictive intelligence for planning future interventions. Includes 1-year and 3-year projections.
            </p>
          </div>
        </div>

        {/* File Format Info */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📁 File Format Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Format</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• CSV (Comma-Separated Values)</li>
                <li>• UTF-8 encoding</li>
                <li>• Header row included</li>
                <li>• Compatible with Excel, Python, R</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Recommended Tools</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Microsoft Excel / Google Sheets</li>
                <li>• Python (pandas)</li>
                <li>• R (tidyverse)</li>
                <li>• Tableau / Power BI</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
