# SAP Integration Suite Dashboard - Frontend

A modern, enterprise-grade React frontend for the SAP Integration Suite Dashboard that provides comprehensive metrics and insights for SAP Integration Suite tenants with an intuitive NLP-powered chat interface.

## 🚀 Features

### Core Dashboard Features
- **Overview Dashboard**: Interactive tiles showing key metrics and KPIs
- **Custom Tiles**: User-managed custom metrics with persistent storage
- **Interactive Charts**: Clickable charts with detailed drill-down capabilities
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Advanced Functionality
- **40%/60% Page Split**: Dynamic layout with main content and details panel
- **NLP Chat Interface**: Natural language querying with OpenAI integration
- **Real-time Data**: Live updates from SAP Integration Suite APIs
- **Export Capabilities**: Data export in multiple formats
- **Error Boundaries**: Comprehensive error handling and recovery

### Enterprise-Grade Features
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation
- **Performance**: Optimized loading, lazy loading, and code splitting
- **Security**: Secure API communication with token management
- **Monitoring**: Web Vitals tracking and error reporting
- **PWA Ready**: Service worker support for offline capabilities

## 🏗️ Architecture

### Project Structure
```
src/
├── components/           # React components
│   ├── Dashboard/       # Dashboard overview components
│   ├── Charts/          # Chart visualization components  
│   ├── Chat/            # NLP chat interface components
│   ├── Details/         # Details panel components
│   ├── Navigation/      # Navigation components
│   └── Common/          # Reusable utility components
├── context/             # React Context providers
├── services/            # API services and utilities
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── styles/              # CSS and styling files
```

### Component Architecture
- **Context-based State Management**: Global state with React Context
- **Modular Components**: Reusable, composable component architecture
- **Service Layer**: Separated API communication and business logic
- **Error Boundaries**: Comprehensive error handling at component level

## 🛠️ Technology Stack

### Core Technologies
- **React 18.2+**: Latest React with concurrent features
- **React Router v6**: Modern routing with data loading
- **Tailwind CSS 3.3+**: Utility-first CSS framework
- **Chart.js 4.3+**: Interactive charts and visualizations
- **Lucide React**: Modern icon library

### API Integration
- **Axios**: HTTP client with interceptors and error handling
- **OpenAI Integration**: NLP query processing
- **Real-time Updates**: WebSocket support (ready for implementation)

### Development Tools
- **Create React App**: Zero-config build setup
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing and optimization
- **Web Vitals**: Performance monitoring

## 📦 Installation

### Prerequisites
- Node.js 16.0+ and npm 8.0+
- SAP Integration Suite Backend running on port 3000
- OpenAI API key (optional, for advanced NLP features)

### Setup Steps

1. **Clone and Install**
```bash
git clone <repository-url>
cd sap-integration-dashboard-frontend
npm install
```

2. **Environment Configuration**
Create a `.env` file in the root directory:
```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3000
REACT_APP_WEBSOCKET_URL=ws://localhost:3000

# OpenAI Configuration (Optional)
REACT_APP_OPENAI_API_KEY=your-openai-api-key

# Application Configuration
REACT_APP_VERSION=1.0.0
REACT_APP_BUILD_DATE=2024-01-01
REACT_APP_ENVIRONMENT=development

# Feature Flags
REACT_APP_ENABLE_CHAT=true
REACT_APP_ENABLE_EXPORT=true
REACT_APP_ENABLE_PWA=false
```

3. **Development Server**
```bash
npm start
```
The application will open at `http://localhost:3001`

4. **Production Build**
```bash
npm run build
npm run serve
```

## 🎯 Usage Guide

### Dashboard Overview
1. **Main Dashboard**: View key metrics in interactive tiles
2. **Custom Tiles**: Click "Add Custom Tile" to create personalized metrics
3. **Navigation**: Click any tile to view detailed charts
4. **Refresh**: Use the refresh button to update data

### Chart Views
1. **Interactive Charts**: Click chart segments for detailed information
2. **Data Export**: Export chart data in JSON format
3. **Filters**: Apply filters to customize data views
4. **Back Navigation**: Return to overview using the "Overview" button

### NLP Chat Interface
1. **Toggle Chat**: Click the chat icon to show/hide the interface
2. **Natural Queries**: Ask questions like:
   - "Show me all iFlows with OAuth authentication"
   - "Which iFlows have error handling issues?"
   - "What is the average message processing time?"
3. **Suggestions**: Click the lightbulb icon for query suggestions
4. **Details Panel**: Chat responses automatically show in the details panel

### Page Split Functionality
- **Automatic Split**: The page splits (40%/60%) when:
  - A chat query is submitted
  - A chart element is clicked
- **Manual Close**: Click the "×" button to close the details panel
- **Responsive**: On mobile, panels stack vertically

## 🔧 Configuration

### API Integration
The frontend connects to your SAP Integration Suite backend:
- **Base URL**: Configure in `REACT_APP_API_BASE_URL`
- **Endpoints**: Defined in `src/services/dashboardService.js`
- **Authentication**: Handles OAuth tokens automatically

### Customization
1. **Colors and Themes**: Modify `tailwind.config.js`
2. **Chart Types**: Add new chart types in `src/components/Charts/`
3. **Custom Tiles**: Extend tile types in `src/components/Dashboard/`
4. **Chat Capabilities**: Configure NLP responses in `src/services/chatService.js`

### Performance Optimization
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components loaded on demand
- **Caching**: API responses cached for performance
- **Compression**: Build assets automatically compressed

## 🚦 Available Scripts

### Development
```bash
npm start          # Start development server
npm test           # Run test suite
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

### Production
```bash
npm run build      # Create production build
npm run serve      # Serve production build locally
npm run analyze    # Analyze bundle size
```

### Maintenance
```bash
npm run clean      # Clean build artifacts
npm audit          # Check for security vulnerabilities
npm update         # Update dependencies
```

## 🏢 Enterprise Features

### Accessibility (WCAG 2.1 AA)
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and semantic HTML
- **Color Contrast**: Meets contrast requirements
- **Focus Management**: Proper focus handling

### Security
- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Token-based request validation
- **Content Security Policy**: Restricts resource loading
- **Secure Headers**: Security headers configuration

### Performance
- **Core Web Vitals**: Optimized for Google's metrics
- **Bundle Optimization**: Tree shaking and compression
- **Caching Strategy**: Aggressive caching with cache busting
- **CDN Ready**: Optimized for CDN deployment

### Monitoring & Analytics
- **Error Tracking**: Comprehensive error reporting
- **Performance Monitoring**: Real-time performance metrics
- **User Analytics**: Usage tracking and insights
- **Health Checks**: Application health monitoring

## 🔍 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API Connection Issues**
- Verify backend is running on correct port
- Check CORS configuration
- Validate API endpoints in browser developer tools

**Chat Interface Not Working**
- Verify OpenAI API key is configured
- Check network connectivity
- Review browser console for errors

**Performance Issues**
- Check browser developer tools Network tab
- Verify API response times
- Consider enabling PWA features

### Debug Mode
Enable debug logging:
```env
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- **ESLint**: Follow configured linting rules
- **Prettier**: Use for code formatting
- **Component Structure**: Follow established patterns
- **Testing**: Write tests for new components
- **Documentation**: Update README for new features

### Pull Request Guidelines
- Provide clear description of changes
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation as needed
- Follow semantic commit messages

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- **API Documentation**: Available in the backend repository
- **Component Storybook**: Run `npm run storybook` (if configured)
- **Type Definitions**: TypeScript definitions available

### Getting Help
- **Issues**: Report bugs and feature requests
- **Discussions**: Community discussions and Q&A
- **Wiki**: Detailed guides and tutorials

### Professional Support
For enterprise support and consulting services, please contact the development team.

---

**Built with ❤️ for SAP Integration Suite**