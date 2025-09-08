// Mock data for the AI Outreach prototype

export const dashboardStats = {
  totalUploads: 12,
  validCompanies: 847,
  emailsSent: 624,
  callsConducted: 156,
  shortlistedCompanies: 89
};

export const activityFeed = [
  {
    id: 1,
    action: 'File uploaded',
    description: 'tech_companies_q4.xlsx uploaded successfully',
    timestamp: '2 minutes ago',
    type: 'upload',
    status: 'success'
  },
  {
    id: 2,
    action: 'AI validation completed',
    description: '127 companies validated, 3 errors found',
    timestamp: '5 minutes ago',
    type: 'validation',
    status: 'warning'
  },
  {
    id: 3,
    action: 'Email campaign sent',
    description: 'Outreach emails sent to 45 companies',
    timestamp: '1 hour ago',
    type: 'email',
    status: 'success'
  },
  {
    id: 4,
    action: 'AI call completed',
    description: 'Call with TechCorp completed - Shortlisted',
    timestamp: '2 hours ago',
    type: 'call',
    status: 'success'
  },
  {
    id: 5,
    action: 'Pipeline updated',
    description: '12 companies moved to review stage',
    timestamp: '3 hours ago',
    type: 'pipeline',
    status: 'info'
  }
];

export const pipelineData = [
  {
    month: 'Jan',
    uploaded: 120,
    validated: 110,
    emailed: 95,
    called: 45,
    shortlisted: 18
  },
  {
    month: 'Feb',
    uploaded: 135,
    validated: 128,
    emailed: 112,
    called: 52,
    shortlisted: 23
  },
  {
    month: 'Mar',
    uploaded: 158,
    validated: 145,
    emailed: 134,
    called: 67,
    shortlisted: 31
  },
  {
    month: 'Apr',
    uploaded: 142,
    validated: 138,
    emailed: 125,
    called: 58,
    shortlisted: 28
  }
];

export const uploadedFiles = [
  {
    id: 1,
    name: 'tech_companies_2024.xlsx',
    size: '2.4 MB',
    uploadDate: '2024-01-15',
    status: 'validated',
    companiesCount: 127,
    validCount: 124,
    errors: ['Missing phone number for 3 companies']
  },
  {
    id: 2,
    name: 'fintech_startups.xlsx',
    size: '1.8 MB',
    uploadDate: '2024-01-14',
    status: 'processing',
    companiesCount: 89,
    validCount: null,
    errors: []
  },
  {
    id: 3,
    name: 'healthcare_leads.xlsx',
    size: '3.1 MB',
    uploadDate: '2024-01-13',
    status: 'error',
    companiesCount: 156,
    validCount: 0,
    errors: ['Invalid email format in column C', 'Missing required sector information']
  }
];

export const companies = [
  {
    id: 1,
    name: 'TechCorp Solutions',
    sector: 'SaaS',
    email: 'contact@techcorp.com',
    phone: '+1-555-0123',
    website: 'techcorp.com',
    stage: 'human_review',
    status: 'pending_human_review',
    validationStatus: 'valid',
    emailStatus: 'sent',
    callStatus: 'completed',
    callDate: '2024-01-15T10:00:00Z',
    transcript: 'Company shows strong interest in AI automation. Budget confirmed at $50k annually. Decision maker available.',
    aiDecision: 'shortlisted',
    aiReasoning: 'Strong product-market fit, confirmed budget, and decision maker engagement indicate high conversion potential.',
    revenue: '$2.4M ARR',
    employees: '45-60',
    funding: 'Series A',
    priority: 'high'
  },
  {
    id: 2,
    name: 'InnovateLabs',
    sector: 'FinTech',
    email: 'hello@innovatelabs.io',
    phone: '+1-555-0124',
    website: 'innovatelabs.io',
    stage: 'ai_analysis',
    status: 'analyzing',
    validationStatus: 'valid',
    emailStatus: 'sent',
    callStatus: 'completed',
    callDate: '2024-01-16T14:00:00Z',
    transcript: 'Interested in automation but needs to discuss with board. Budget allocation available Q2.',
    aiDecision: null,
    aiReasoning: null,
    revenue: '$8.2M ARR',
    employees: '120-150',
    funding: 'Series B',
    priority: 'medium'
  },
  {
    id: 3,
    name: 'HealthTech Innovations',
    sector: 'Healthcare',
    email: 'info@healthtech.com',
    phone: '+1-555-0125',
    website: 'healthtech.com',
    stage: 'call_initiated',
    status: 'call_scheduled',
    validationStatus: 'valid',
    emailStatus: 'sent',
    callStatus: 'scheduled',
    callDate: '2024-01-18T11:00:00Z',
    transcript: null,
    aiDecision: null,
    aiReasoning: null,
    revenue: '$1.8M ARR',
    employees: '25-40',
    funding: 'Seed',
    priority: 'medium'
  },
  {
    id: 4,
    name: 'GreenEnergy Co',
    sector: 'Clean Energy',
    email: 'contact@greenenergy.com',
    phone: '+1-555-0126',
    website: 'greenenergy.com',
    stage: 'email_outreach',
    status: 'email_sent',
    validationStatus: 'valid',
    emailStatus: 'sent',
    callStatus: 'not_scheduled',
    callDate: null,
    transcript: null,
    aiDecision: null,
    aiReasoning: null,
    revenue: '$950K ARR',
    employees: '15-25',
    funding: 'Pre-seed',
    priority: 'low'
  },
  {
    id: 5,
    name: 'DataDriven Analytics',
    sector: 'AI/ML',
    email: 'team@datadriven.ai',
    phone: '+1-555-0127',
    website: 'datadriven.ai',
    stage: 'final_decision',
    status: 'rejected',
    validationStatus: 'valid',
    emailStatus: 'sent',
    callStatus: 'completed',
    callDate: '2024-01-14T16:00:00Z',
    transcript: 'Company already has established AI infrastructure. Not looking for external solutions at this time.',
    aiDecision: 'rejected',
    aiReasoning: 'Existing infrastructure and no immediate need for external AI solutions indicate low conversion probability.',
    revenue: '$12.5M ARR',
    employees: '200+',
    funding: 'Series C',
    priority: 'low'
  },
  {
    id: 6,
    name: 'NextGen Robotics',
    sector: 'Robotics',
    email: 'investors@nextgenrobotics.com',
    phone: '+1-555-0128',
    website: 'nextgenrobotics.com',
    stage: 'validation',
    status: 'high_priority',
    validationStatus: 'valid',
    emailStatus: 'not_sent',
    callStatus: 'not_scheduled',
    callDate: null,
    transcript: null,
    aiDecision: null,
    aiReasoning: null,
    revenue: '$45M ARR',
    employees: '500+',
    funding: 'Pre-IPO',
    priority: 'critical',
    specialNotes: 'Going public Q3 2024. Major automation initiative announced. $100M budget allocated for AI solutions.',
    ipoPlan: 'Q3 2024',
    marketCap: '$2.8B (estimated)',
    lastFunding: '$150M Series D'
  },
  {
    id: 7,
    name: 'CloudSync Technologies',
    sector: 'Cloud Infrastructure',
    email: 'partnerships@cloudsync.io',
    phone: '+1-555-0129',
    website: 'cloudsync.io',
    stage: 'final_decision',
    status: 'approved',
    validationStatus: 'valid',
    emailStatus: 'sent',
    callStatus: 'completed',
    callDate: '2024-01-12T15:30:00Z',
    transcript: 'Excellent fit. Ready to proceed with pilot program. Contract value $250K.',
    aiDecision: 'approved',
    aiReasoning: 'Strong technical alignment, confirmed budget, and immediate implementation timeline.',
    revenue: '$6.7M ARR',
    employees: '85-100',
    funding: 'Series A',
    priority: 'high'
  }
];

export const callQuestions = [
  'What is your company\'s current approach to lead generation?',
  'What challenges are you facing with your current outreach process?',
  'What is your budget range for automation solutions?',
  'Who would be the decision maker for implementing new technology?',
  'What is your timeline for implementing new solutions?',
  'How do you currently measure outreach success?',
  'What would success look like for you with an AI solution?'
];

export const reportsData = {
  conversionFunnel: [
    { stage: 'Files Uploaded', count: 12, percentage: 100 },
    { stage: 'Companies Processed', count: 847, percentage: 100 },
    { stage: 'Valid Entries', count: 798, percentage: 94.2 },
    { stage: 'Emails Sent', count: 624, percentage: 78.2 },
    { stage: 'Calls Completed', count: 156, percentage: 25.0 },
    { stage: 'Companies Shortlisted', count: 89, percentage: 57.1 }
  ],
  monthlyPerformance: [
    { month: 'Oct', leads: 180, converted: 23, rate: 12.8 },
    { month: 'Nov', leads: 220, converted: 31, rate: 14.1 },
    { month: 'Dec', leads: 195, converted: 28, rate: 14.4 },
    { month: 'Jan', leads: 252, converted: 35, rate: 13.9 }
  ],
  sectorBreakdown: [
    { sector: 'SaaS', count: 45, percentage: 28.1 },
    { sector: 'FinTech', count: 38, percentage: 23.8 },
    { sector: 'Healthcare', count: 32, percentage: 20.0 },
    { sector: 'E-commerce', count: 25, percentage: 15.6 },
    { sector: 'Clean Energy', count: 20, percentage: 12.5 }
  ]
}; 