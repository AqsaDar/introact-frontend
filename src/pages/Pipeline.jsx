import React, { useState } from 'react';
import { 
  Settings, 
  Mail, 
  Phone, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Send,
  Calendar,
  MessageCircle,
  ChevronDown,
  ExternalLink,
  FileText,
  Brain,
  Users,
  TrendingUp,
  DollarSign,
  Building,
  Star,
  AlertTriangle,
  Award,
  Target
} from 'lucide-react';
import { companies, callQuestions } from '../data/mockData';

function Pipeline() {
  const [showCallConfig, setShowCallConfig] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [questions, setQuestions] = useState(callQuestions);

  const stages = [
    { 
      id: 'validation', 
      title: 'Data Validation', 
      description: 'AI validates company data',
      color: 'bg-gray-600',
      icon: FileText,
      companies: companies.filter(c => c.stage === 'validation')
    },
    { 
      id: 'email_outreach', 
      title: 'Email Outreach', 
      description: 'Automated email campaigns',
      color: 'bg-gray-600',
      icon: Send,
      companies: companies.filter(c => c.stage === 'email_outreach')
    },
    { 
      id: 'call_initiated', 
      title: 'AI Call Initiated', 
      description: 'Scheduled AI conversations',
      color: 'bg-gray-600',
      icon: Phone,
      companies: companies.filter(c => c.stage === 'call_initiated')
    },
    { 
      id: 'ai_analysis', 
      title: 'AI Analysis', 
      description: 'Processing call transcripts',
      color: 'bg-gray-600',
      icon: Brain,
      companies: companies.filter(c => c.stage === 'ai_analysis')
    },
    { 
      id: 'human_review', 
      title: 'Human Review', 
      description: 'Expert evaluation required',
      color: 'bg-gray-600',
      icon: Users,
      companies: companies.filter(c => c.stage === 'human_review')
    },
    { 
      id: 'final_decision', 
      title: 'Final Decision', 
      description: 'Approved or rejected',
      color: 'bg-gray-600',
      icon: TrendingUp,
      companies: companies.filter(c => c.stage === 'final_decision')
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return AlertTriangle;
      case 'high': return Star;
      case 'medium': return TrendingUp;
      case 'low': return Clock;
      default: return Clock;
    }
  };

  const getStatusColor = (company) => {
    const statusMap = {
      'high_priority': 'text-red-700 bg-red-100 border-red-200',
      'pending_human_review': 'text-gray-700 bg-gray-100 border-gray-200',
      'analyzing': 'text-gray-700 bg-gray-100 border-gray-200',
      'call_scheduled': 'text-gray-700 bg-gray-100 border-gray-200',
      'email_sent': 'text-gray-700 bg-gray-100 border-gray-200',
      'approved': 'text-green-700 bg-green-100 border-green-200',
      'rejected': 'text-red-700 bg-red-100 border-red-200'
    };
    return statusMap[company.status] || 'text-gray-700 bg-gray-100 border-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
                {company.name}
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
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(company.priority)}`}>
              <PriorityIcon className="w-3 h-3 mr-1" />
              {company.priority}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium border ${getStatusColor(company)}`}>
            {company.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>

        {/* Company Details */}
        <div className="space-y-2 mb-4">
          {company.revenue && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center">
                <DollarSign className="w-3 h-3 mr-1" />
                Revenue:
              </span>
              <span className="font-semibold text-gray-900">{company.revenue}</span>
            </div>
          )}
          {company.funding && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Funding:
              </span>
              <span className="font-semibold text-gray-900">{company.funding}</span>
            </div>
          )}
        </div>

        {/* Special Notes for IPO Company */}
        {company.specialNotes && (
          <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 rounded-xl">
            <p className="text-sm text-orange-800 font-medium mb-1">🚀 Special Opportunity</p>
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
            
            {company.stage === 'email_outreach' && (
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
            
            {(company.stage === 'ai_analysis' || company.stage === 'human_review' || company.stage === 'final_decision') && company.transcript && (
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
        {company.callDate && company.callStatus === 'scheduled' && (
          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center text-sm text-orange-800">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="font-medium">Scheduled: {formatDate(company.callDate)}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Pipeline</h1>
          <p className="mt-2 text-gray-600">Track your leads through the AI-powered outreach process</p>
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
            <span>Total: {companies.length} companies</span>
            <span>•</span>
            <span>Critical: {companies.filter(c => c.priority === 'critical').length}</span>
            <span>•</span>
            <span>High Priority: {companies.filter(c => c.priority === 'high').length}</span>
          </div>
        </div>
        
        <button
          onClick={() => setShowCallConfig(true)}
          className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          <Settings className="w-4 h-4 mr-2" />
          Configure Call Questions
        </button>
      </div>

      {/* Pipeline Stages */}
      <div className="relative">
        {/* Scroll hint */}
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500">← Scroll horizontally to view all pipeline stages →</p>
        </div>
        
        <div className="flex overflow-x-auto pb-6 space-x-6 scrollbar-thin pipeline-scroll">
          {stages.map((stage) => {
            const StageIcon = stage.icon;
            return (
              <div key={stage.id} className="flex-shrink-0 w-80 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${stage.color} text-white shadow-md`}>
                      <StageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{stage.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{stage.description}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center w-8 h-8 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-full shadow-sm">
                    {stage.companies.length}
                  </span>
                </div>
                
                {/* Companies */}
                <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
                  {stage.companies.map((company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))}
                </div>
                
                {stage.companies.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <StageIcon className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-medium">No companies in this stage</p>
                    <p className="text-xs mt-1">Companies will appear here as they progress</p>
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
              <div
                key={index}
                className="flex items-center space-x-1"
              >
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

      {/* Company Details Modal */}
      {showCompanyDetails && selectedCompany && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={() => setShowCompanyDetails(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedCompany.name}</h3>
                    <p className="text-gray-600 mt-1">{selectedCompany.sector} • {selectedCompany.employees} employees</p>
                  </div>
                  <button
                    onClick={() => setShowCompanyDetails(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Company Overview</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Revenue:</span>
                          <span className="font-semibold">{selectedCompany.revenue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Funding Stage:</span>
                          <span className="font-semibold">{selectedCompany.funding}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Priority:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedCompany.priority)}`}>
                            {selectedCompany.priority}
                          </span>
                        </div>
                        {selectedCompany.ipoPlan && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">IPO Plan:</span>
                            <span className="font-semibold text-orange-600">{selectedCompany.ipoPlan}</span>
                          </div>
                        )}
                        {selectedCompany.marketCap && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Est. Market Cap:</span>
                            <span className="font-semibold">{selectedCompany.marketCap}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{selectedCompany.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{selectedCompany.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                          <a href={`https://${selectedCompany.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:underline">
                            {selectedCompany.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {selectedCompany.specialNotes && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Special Notes</h4>
                        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 rounded-xl">
                          <p className="text-sm text-orange-800">{selectedCompany.specialNotes}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Pipeline Status</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Current Stage:</span>
                          <span className="font-semibold">{selectedCompany.stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCompany)}`}>
                            {selectedCompany.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        {selectedCompany.callDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Call Date:</span>
                            <span className="font-semibold">{formatDate(selectedCompany.callDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedCompany.aiDecision && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">AI Analysis</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">AI Decision:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedCompany.aiDecision === 'approved' || selectedCompany.aiDecision === 'shortlisted' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {selectedCompany.aiDecision}
                            </span>
                          </div>
                          {selectedCompany.aiReasoning && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-800">{selectedCompany.aiReasoning}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCompanyDetails(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedCompany.transcript && (
                  <button
                    onClick={() => {
                      setShowCompanyDetails(false);
                      setShowTranscript(true);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    View Transcript
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call Questions Configuration Modal */}
      {showCallConfig && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={() => setShowCallConfig(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Configure Call Questions</h3>
                  <button
                    onClick={() => setShowCallConfig(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="flex-shrink-0 w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          newQuestions[index] = e.target.value;
                          setQuestions(newQuestions);
                        }}
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-900 font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCallConfig(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCallConfig(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {showEmailPreview && selectedCompany && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={() => setShowEmailPreview(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Email Preview</h3>
                  <button
                    onClick={() => setShowEmailPreview(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="border-b border-gray-300 pb-4 mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-semibold text-gray-900">To: {selectedCompany.email}</span>
                      <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs">AI Generated</span>
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      Subject: Partnership Opportunity - AI Automation Solutions
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-800 space-y-4 leading-relaxed">
                    <p>Dear {selectedCompany.name} Team,</p>
                    <p>
                      I hope this email finds you well. I'm reaching out because I noticed your company's 
                      innovative work in the {selectedCompany.sector} space and believe we could help 
                      streamline your operations with our AI-powered automation solutions.
                    </p>
                    <p>
                      Our platform has helped similar companies in your industry increase efficiency by 
                      40% while reducing operational costs. I'd love to schedule a brief 15-minute call 
                      to discuss how this could benefit {selectedCompany.name}.
                    </p>
                    <p>
                      Would you be available for a quick conversation this week? I'm confident we can 
                      provide significant value to your organization.
                    </p>
                    <p>Best regards,<br />AI Outreach Team</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setShowEmailPreview(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Modal */}
      {showTranscript && selectedCompany && selectedCompany.transcript && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={() => setShowTranscript(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Call Transcript - {selectedCompany.name}
                  </h3>
                  <button
                    onClick={() => setShowTranscript(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <MessageCircle className="w-5 h-5 text-gray-500" />
                      <span className="font-semibold text-gray-900">Call Summary</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(selectedCompany.callDate)}
                      </span>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{selectedCompany.transcript}</p>
                  </div>
                  
                  {selectedCompany.aiDecision && (
                    <div className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <Brain className="w-5 h-5 mr-2" />
                          AI Decision
                        </h4>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedCompany.aiDecision === 'approved' || selectedCompany.aiDecision === 'shortlisted' 
                            ? 'text-green-700 bg-green-100' 
                            : 'text-red-700 bg-red-100'
                        }`}>
                          {selectedCompany.aiDecision === 'approved' || selectedCompany.aiDecision === 'shortlisted' ? '✅ Approved' : '❌ Rejected'}
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">AI Reasoning</h5>
                        <p className="text-sm text-gray-800 leading-relaxed">{selectedCompany.aiReasoning}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setShowTranscript(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pipeline; 