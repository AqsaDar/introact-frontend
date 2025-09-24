import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  FileText,
  Mail,
  Phone,
  Brain,
  Users,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Eye,
  XCircle,
  Send,
  Calendar,
  MessageCircle,
  ChevronDown,
  ExternalLink,
  DollarSign,
  Building,
  Star,
  AlertTriangle,
  Award,
  Target,
  Settings,
} from "lucide-react";
import { companies, callQuestions } from "../data/mockData";
import { getRequest } from "../utils/httpClient";
import Loader from "../components/Loader";

function Pipeline() {
  const [showCallConfig, setShowCallConfig] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [questions, setQuestions] = useState(callQuestions);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await getRequest("company/pipeline-items/");
        setCompanies(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const stages = [
    {
      id: "validation",
      title: "Data Validation",
      description: "AI validates company data",
      color: "bg-blue-500",
      icon: FileText,
      order: 1,
      companies: companies.filter((c) => c.stage?.order === 1),
    },
    {
      id: "email_outreach",
      title: "Email Outreach",
      description: "Automated email campaigns",
      color: "bg-green-500",
      icon: Send,
      order: 2,
      companies: companies.filter((c) => c.stage?.order === 2),
    },
    {
      id: "call_initiated",
      title: "AI Call Initiated",
      description: "Scheduled AI conversations",
      color: "bg-purple-500",
      icon: Phone,
      order: 3,
      companies: companies.filter((c) => c.stage?.order === 3),
    },
    {
      id: "ai_analysis",
      title: "AI Analysis",
      description: "Processing call transcripts",
      color: "bg-indigo-500",
      icon: Brain,
      order: 4,
      companies: companies.filter((c) => c.stage?.order === 4),
    },
    {
      id: "human_review",
      title: "Human Review",
      description: "Expert evaluation required",
      color: "bg-pink-500",
      icon: Users,
      order: 5,
      companies: companies.filter((c) => c.stage?.order === 5),
    },
    {
      id: "final_decision",
      title: "Final Decision",
      description: "Approved or rejected",
      color: "bg-orange-500",
      icon: TrendingUp,
      order: 6,
      companies: companies.filter((c) => c.stage?.order === 6),
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "critical":
        return AlertTriangle;
      case "high":
        return Star;
      case "medium":
        return TrendingUp;
      case "low":
        return Clock;
      default:
        return Clock;
    }
  };

  const getStatusColor = (company) => {
    const statusMap = {
      high_priority: "text-red-700 bg-red-100 border-red-200",
      pending_human_review: "text-gray-700 bg-gray-100 border-gray-200",
      analyzing: "text-gray-700 bg-gray-100 border-gray-200",
      call_scheduled: "text-gray-700 bg-gray-100 border-gray-200",
      email_sent: "text-gray-700 bg-gray-100 border-gray-200",
      approved: "text-green-700 bg-green-100 border-green-200",
      rejected: "text-red-700 bg-red-100 border-red-200",
    };
    return (
      statusMap[company.status] || "text-gray-700 bg-gray-100 border-gray-200"
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const CompanyCard = ({ company }) => {
    const PriorityIcon = getPriorityIcon(company.priority);

    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-bold text-gray-900 text-base group-hover:text-gray-600 transition-colors">
                {company.company_name}
              </h4>
              {company.ipoPlan && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-orange-200">
                  <Award className="w-3 h-3 mr-1" />
                  IPO {company.ipoPlan}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="inline-flex items-center">
                <Building className="w-3 h-3 mr-1" />
                {company.sector}
              </span>
              <span className="inline-flex items-center">
                <Users className="w-3 h-3 mr-1" />
                {company.employees}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                company.priority
              )}`}
            >
              <PriorityIcon className="w-3 h-3 mr-1" />
              {company.priority}
            </span>
          </div>
        </div>

        {/* Status */}
        {/* <div className="mb-4">
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium border ${getStatusColor(
              company
            )}`}
          >
            {company.status
              ?.replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        </div> */}

        {/* Company Details */}
        <div className="space-y-2 mb-4">
          {company.revenue && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center">
                <DollarSign className="w-3 h-3 mr-1" />
                Revenue:
              </span>
              <span className="font-semibold text-gray-900">
                {company.revenue}
              </span>
            </div>
          )}
          {company.industry && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                industry:
              </span>
              <span className="font-semibold text-gray-900">
                {company.industry}
              </span>
            </div>
          )}
        </div>

        {/* Special Notes for IPO Company */}
        {company.specialNotes && (
          <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 rounded-xl">
            <p className="text-sm text-orange-800 font-medium mb-1">
              🚀 Special Opportunity
            </p>
            <p className="text-xs text-orange-700">{company.specialNotes}</p>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2 text-xs text-gray-600 mb-4">
          <div className="flex items-center space-x-2">
            <Mail className="w-3 h-3" />
            <span className="truncate">{company.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-3 h-3" />
            <span>{company.phone}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setSelectedCompany(company);
                setShowCompanyDetails(true);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>

            {company.stage?.order === 2 && (
              <button
                onClick={() => {
                  setSelectedCompany(company);
                  setShowEmailPreview(true);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                title="View Email"
              >
                <Send className="w-4 h-4" />
              </button>
            )}

            {[4, 5, 6].includes(company.stage?.order) && company.transcript && (
              <button
                onClick={() => {
                  setSelectedCompany(company);
                  setShowTranscript(true);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                title="View Transcript"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {company.website && (
            <a
              href={`https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              title="Visit Website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Call Date for scheduled calls */}
        {company.callDate && company.callStatus === "scheduled" && (
          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center text-sm text-orange-800">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="font-medium">
                Scheduled: {formatDate(company.callDate)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Loader isVisible={loading} message="Loading companies..." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lead Pipeline</h1>
            <p className="mt-2 text-gray-600">
              Track your leads through the AI-powered outreach process
            </p>
          </div>

          <button
            onClick={() => setShowCallConfig(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure Call Questions
          </button>
        </div>

        {/* Top Stats Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Companies
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {companies.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-gray-900">
                  {companies.filter((c) => c.priority === "critical").length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  High Priority
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {companies.filter((c) => c.priority === "high").length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Stages */}
        <div className="relative">
          {/* Scroll hint */}
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-500">
              ← Scroll horizontally to view all pipeline stages →
            </p>
          </div>

          <div className="flex overflow-x-auto pb-6 space-x-6 scrollbar-thin pipeline-scroll">
            {stages.map((stage) => {
              const StageIcon = stage.icon;
              return (
                <div
                  key={stage.id}
                  className="flex-shrink-0 w-80 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Stage Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-xl ${stage.color} text-white shadow-md`}
                      >
                        <StageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          {stage.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center justify-center w-8 h-8 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-full shadow-sm">
                      {stage.companies.length}
                    </span>
                  </div>

                  {/* Companies */}
                  <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
                    {stage.companies.map((company) => (
                      <CompanyCard key={company.id} company={company.company} />
                    ))}
                  </div>

                  {stage.companies.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <StageIcon className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-medium">
                        No companies in this stage
                      </p>
                      <p className="text-xs mt-1">
                        Companies will appear here as they progress
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stage indicators */}
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {stages.map((stage, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <span className="text-xs font-medium text-gray-600 hidden sm:inline">
                    {stage.title}
                  </span>
                  {index < stages.length - 1 && (
                    <div className="w-4 h-0.5 bg-gray-300 mx-2 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pipeline;
