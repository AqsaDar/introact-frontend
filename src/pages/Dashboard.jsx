import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  FileCheck,
  FileText,
  Mail,
  Phone,
  Send,
  TrendingUp,
  Trophy,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { activityFeed, dashboardStats, pipelineData } from "../data/mockData";

import React from "react";

function Dashboard() {
  const stats = [
    {
      title: "Total Files Uploaded",
      value: dashboardStats.totalUploads,
      icon: FileText,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Valid Companies",
      value: dashboardStats.validCompanies.toLocaleString(),
      icon: CheckCircle,
      color: "bg-green-500",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Emails Sent",
      value: dashboardStats.emailsSent.toLocaleString(),
      icon: Mail,
      color: "bg-purple-500",
      change: "+15%",
      changeType: "positive",
    },
    {
      title: "Calls Conducted",
      value: dashboardStats.callsConducted.toLocaleString(),
      icon: Phone,
      color: "bg-orange-500",
      change: "+5%",
      changeType: "positive",
    },
    {
      title: "Shortlisted Companies",
      value: dashboardStats.shortlistedCompanies.toLocaleString(),
      icon: Trophy,
      color: "bg-emerald-500",
      change: "+22%",
      changeType: "positive",
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "upload":
        return FileText;
      case "validation":
        return FileCheck;
      case "email":
        return Send;
      case "call":
        return Phone;
      case "pipeline":
        return Activity;
      default:
        return AlertCircle;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      case "info":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Welcome to the dashboard
          </p>
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div
                  className={`text-sm font-medium ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-medium text-gray-500">
                {stat.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Progress Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Lead Pipeline Progress
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <TrendingUp className="h-4 w-4" />
                <span>Last 4 months</span>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="uploaded"
                    stroke="#6b7280"
                    strokeWidth={2}
                    name="Uploaded"
                  />
                  <Line
                    type="monotone"
                    dataKey="validated"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    name="Validated"
                  />
                  <Line
                    type="monotone"
                    dataKey="emailed"
                    stroke="#4b5563"
                    strokeWidth={2}
                    name="Emailed"
                  />
                  <Line
                    type="monotone"
                    dataKey="called"
                    stroke="#374151"
                    strokeWidth={2}
                    name="Called"
                  />
                  <Line
                    type="monotone"
                    dataKey="shortlisted"
                    stroke="#1f2937"
                    strokeWidth={2}
                    name="Shortlisted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Recent Activity
              </h3>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {activityFeed.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg ${getActivityColor(
                        activity.status
                      )}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button className="w-full text-sm text-gray-600 hover:text-gray-700 font-medium">
                View all activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
