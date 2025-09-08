# 🚀 AI Outreach Automation - Frontend Prototype

A stunning, modern React application that demonstrates an AI-powered pipeline for identifying, contacting, and evaluating potential companies for outreach and AI-driven call screening.

![AI Outreach Dashboard](https://via.placeholder.com/800x400/2563eb/ffffff?text=AI+Outreach+Dashboard)

## ✨ Features

### 📊 Dashboard
- **Real-time Analytics**: Monitor key performance metrics with beautiful stat cards
- **Interactive Charts**: Visualize lead pipeline progress with dynamic line charts
- **Activity Feed**: Track all system activities in real-time
- **Responsive Design**: Perfect on desktop, tablet, and mobile devices

### 📁 Upload System
- **Drag & Drop**: Intuitive file upload with drag-and-drop support
- **AI Validation**: Automatic validation of uploaded Excel/CSV files
- **File Preview**: Preview file contents before processing
- **Multi-file Support**: Upload multiple files simultaneously
- **Error Handling**: Clear validation feedback and error reporting

### 🔄 Pipeline Management
- **Visual Kanban Board**: Track leads through 4 distinct stages
- **Stage Progression**: Validation → Email → Call → Review
- **Company Cards**: Rich information display for each prospect
- **Modal Interactions**: Email previews, call transcripts, and configurations
- **AI Decision Making**: Automated shortlisting with reasoning

### 📈 Reports & Analytics
- **Conversion Funnel**: Visual representation of lead progression
- **Performance Charts**: Monthly trends and conversion rates
- **Sector Analysis**: Pie charts showing industry breakdowns
- **Export Functionality**: Download reports in PDF, Excel, or CSV formats
- **Key Insights**: AI-generated recommendations and insights

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom components
- **Charts & Visualization**: Recharts library
- **Icons**: Lucide React (modern, beautiful icons)
- **Routing**: React Router DOM
- **State Management**: React Hooks (useState, useCallback)

## 🎨 Design Features

- **Modern UI/UX**: Clean, professional interface with attention to detail
- **Gradient Backgrounds**: Beautiful gradients for enhanced visual appeal
- **Smooth Animations**: Subtle transitions and hover effects
- **Glass Morphism**: Modern glass effects for depth
- **Custom Scrollbars**: Styled scrollbars for consistency
- **Responsive Grid**: Adaptive layouts for all screen sizes

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-outreach-prototype
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

## 📱 Application Structure

```
src/
├── components/
│   └── Layout.jsx          # Main layout with navigation
├── pages/
│   ├── Dashboard.jsx       # Analytics dashboard
│   ├── Upload.jsx          # File upload interface
│   ├── Pipeline.jsx        # Lead management pipeline
│   └── Reports.jsx         # Reports and analytics
├── data/
│   └── mockData.js         # Mock data for demonstrations
├── App.jsx                 # Main application component
├── main.jsx               # Application entry point
└── index.css              # Global styles and Tailwind imports
```

## 🎯 Key Pages

### 🏠 Dashboard (`/dashboard`)
- Overview of system performance
- Real-time activity monitoring
- Pipeline progress visualization
- Quick access to key metrics

### 📤 Upload (`/upload`)
- Drag-and-drop file upload
- Excel/CSV file support
- AI-powered validation
- File preview and management

### 🔄 Pipeline (`/pipeline`)
- Visual lead progression tracking
- Interactive company cards
- Email preview functionality
- Call transcript analysis
- Configurable AI call questions

### 📊 Reports (`/reports`)
- Comprehensive analytics dashboard
- Conversion funnel visualization
- Sector breakdown analysis
- Export functionality
- Performance insights

## 🎨 UI Components

### Cards & Containers
- **Stat Cards**: Animated metric displays with icons
- **Company Cards**: Rich lead information with actions
- **Glass Cards**: Modern glass morphism effects

### Modals & Overlays
- **File Preview**: Tabular data display
- **Email Preview**: Formatted email content
- **Call Configuration**: Editable question lists
- **Export Options**: Multiple format selection

### Charts & Visualizations
- **Line Charts**: Time-series data with multiple series
- **Pie Charts**: Sector distribution with legends
- **Funnel Charts**: Conversion pipeline visualization
- **Bar Charts**: Performance comparisons

## 🔧 Customization

### Colors & Themes
The application uses a carefully crafted color palette defined in `tailwind.config.js`:
- **Primary**: Blue gradient (#2563eb → #9333ea)
- **Secondary**: Green gradient (#10b981 → #0d9488)
- **Warning**: Amber gradient (#f59e0b → #f97316)
- **Danger**: Red gradient (#ef4444 → #ec4899)

### Adding New Features
1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Update routing in `src/App.jsx`
4. Add mock data in `src/data/mockData.js`

## 📊 Mock Data

The application includes comprehensive mock data simulating:
- **Dashboard Statistics**: Key performance metrics
- **Activity Feed**: Recent system activities
- **Company Data**: Lead information and progress
- **File Uploads**: Sample uploaded files
- **Reports Data**: Analytics and performance data

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Deployment Options
- **Vercel**: Zero-config deployment
- **Netlify**: Drag-and-drop deployment
- **GitHub Pages**: Free hosting for repositories
- **AWS S3**: Scalable cloud hosting

## 🎯 Future Enhancements

### Backend Integration
- Real API endpoints for data management
- User authentication and authorization
- File processing and storage
- Email automation integration
- AI model integration for real analysis

### Advanced Features
- Real-time notifications
- Advanced filtering and search
- Bulk operations
- Advanced analytics and ML insights
- Multi-tenant support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team**: For the amazing React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Recharts**: For beautiful and responsive charts
- **Lucide**: For the comprehensive icon library
- **Vite**: For the fast and modern build tool

---

**Built with ❤️ using React and Tailwind CSS**

For questions or support, please open an issue in the repository.
