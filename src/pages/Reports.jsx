import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Building2,
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Filter,
  Mail,
  Phone,
  PieChart,
  TrendingUp,
  Trophy,
} from "lucide-react";
import React, { useState } from "react";

import { reportsData } from "../data/mockData";

function Reports() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  const [showExportModal, setShowExportModal] = useState(false);

  const summaryStats = [
    {
      title: "Files Uploaded",
      value: "12",
      icon: FileText,
      color: "bg-blue-500",
      change: "+2 this month",
    },
    {
      title: "Companies Processed",
      value: "847",
      icon: Building2,
      color: "bg-purple-500",
      change: "+156 this month",
    },
    {
      title: "Valid Entries",
      value: "798",
      icon: CheckCircle,
      color: "bg-green-500",
      change: "94.2% success rate",
    },
    {
      title: "Emails Sent",
      value: "624",
      icon: Mail,
      color: "bg-orange-500",
      change: "78.2% of valid entries",
    },
    {
      title: "Calls Completed",
      value: "156",
      icon: Phone,
      color: "bg-red-500",
      change: "25.0% of emails",
    },
    {
      title: "Companies Shortlisted",
      value: "89",
      icon: Trophy,
      color: "bg-emerald-500",
      change: "57.1% conversion",
    },
  ];

  const COLORS = ["#6b7280", "#9ca3af", "#4b5563", "#374151", "#1f2937"];

  const FunnelStep = ({ data, index, isLast }) => {
    const sumTotal = reportsData.conversionFunnel.reduce((acc, curr) => acc + curr.count, 0)
    const percentage =
      index === 0
        ? 100
        : ((data.count / sumTotal) * 100).toFixed(
            1
          );
    const width = Math.max(20, percentage);

    return (
      <div className="relative">
        <div className="flex items-center space-x-4 mb-2">
          <div
            className="bg-gray-600 text-white px-4 py-3 rounded-lg flex-1 text-center font-medium text-sm relative"
            style={{
              width: `${width}%`,
              minWidth: "200px",
              clipPath: isLast
                ? "none"
                : "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)",
            }}
          >
            <div className="flex items-center justify-between">
              <span>{data.stage}</span>
              <span>{data.count.toLocaleString()}</span>
            </div>
            <div className="text-xs opacity-90 mt-1">{percentage}%</div>
          </div>
        </div>
        {!isLast && (
          <div className="flex justify-center mb-4">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[15px] border-l-transparent border-r-transparent border-b-gray-300" />
          </div>
        )}
      </div>
    );
  };

  const handleExport = (format) => {
    // Simulate export functionality
    setTimeout(() => {
      setShowExportModal(false);
      // In a real app, this would trigger an actual download
      alert(`Report exported as ${format.toUpperCase()} format!`);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-gray-600">
            Comprehensive performance analysis of your AI outreach campaigns
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>

          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        {summaryStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm font-medium text-gray-500 mb-2">
              {stat.title}
            </div>
            <div className="text-xs text-green-600 font-medium">
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Conversion Funnel */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Conversion Funnel
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <BarChart3 className="h-4 w-4" />
                <span>Lead progression analysis</span>
              </div>
            </div>

            <div className="space-y-4">
              {reportsData.conversionFunnel.map((step, index) => (
                <FunnelStep
                  key={step.stage}
                  data={step}
                  index={index}
                  isLast={index === reportsData.conversionFunnel.length - 1}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sector Breakdown */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Sector Breakdown
              </h3>
              <PieChart className="h-4 w-4 text-gray-400" />
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={reportsData.sectorBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {reportsData.sectorBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} companies`,
                      props.payload.sector,
                    ]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2">
              {reportsData.sectorBreakdown.map((sector, index) => (
                <div
                  key={sector.sector}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-600">{sector.sector}</span>
                  </div>
                  <div className="text-gray-900 font-medium">
                    {sector.count} ({sector.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Monthly Performance Trends
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <TrendingUp className="h-4 w-4" />
            <span>Conversion rate over time</span>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportsData.monthlyPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="leads"
                fill="#6b7280"
                name="Total Leads"
              />
              <Bar
                yAxisId="left"
                dataKey="converted"
                fill="#9ca3af"
                name="Converted"
              />
              <Line
                type="monotone"
                yAxisId="right"
                dataKey="rate"
                stroke="#4b5563"
                strokeWidth={3}
                name="Conversion Rate (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gray-600 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">
              Top Performing Sector
            </h4>
          </div>
          <p className="text-gray-800 text-sm mb-2">
            <span className="font-bold">SaaS companies</span> show the highest
            conversion rate at
            <span className="font-bold"> 28.1%</span> of all shortlisted leads.
          </p>
          <p className="text-xs text-gray-600">
            Focus outreach efforts on SaaS prospects for better ROI
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gray-600 rounded-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">Quality Score</h4>
          </div>
          <p className="text-gray-800 text-sm mb-2">
            <span className="font-bold">94.2%</span> of uploaded leads pass AI
            validation, indicating high-quality data sources.
          </p>
          <p className="text-xs text-gray-600">
            Maintain current data sourcing strategies
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gray-600 rounded-lg">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">Call Conversion</h4>
          </div>
          <p className="text-gray-800 text-sm mb-2">
            <span className="font-bold">57.1%</span> of completed calls result
            in shortlisted prospects, showing strong AI call quality.
          </p>
          <p className="text-xs text-gray-600">
            AI calling system is performing exceptionally well
          </p>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowExportModal(false)}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Export Report
                  </h3>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  Choose the format for your analytics report export.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => handleExport("pdf")}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-red-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          PDF Report
                        </div>
                        <div className="text-sm text-gray-500">
                          Complete formatted report
                        </div>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => handleExport("excel")}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Excel Spreadsheet
                        </div>
                        <div className="text-sm text-gray-500">
                          Raw data for analysis
                        </div>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => handleExport("csv")}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          CSV Data
                        </div>
                        <div className="text-sm text-gray-500">
                          Machine-readable format
                        </div>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
