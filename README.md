# NewsTrust - AI-Powered News Verification Platform

## 🌟 Overview

NewsTrust is a comprehensive news verification platform that combines AI-powered fact-checking, blockchain verification, and community-driven validation to combat misinformation. The platform provides real-time news analysis, multilingual support, and transparent verification processes.

## 🚀 Key Features

### 🔍 **AI-Powered Verification**
- Real-time content analysis using advanced AI models
- Credibility scoring and flag detection
- Source verification and cross-referencing
- Automated fact-checking workflows

### 🌍 **Multilingual Support**
- Hybrid translation system (Lingvanex, DeepL, Lingo)
- In-memory and database caching for efficiency
- Support for 50+ languages
- Real-time translation progress tracking

### ⛓️ **Blockchain Verification**
- Immutable verification records on Algorand blockchain
- Transparent audit trail for all verifications
- Public proof of verification integrity
- Decentralized trust system

### 📰 **Real-Time News Feed**
- Live news aggregation from multiple sources
- Breaking news alerts and notifications
- Regional and category-based filtering
- Automatic content deduplication

### 👥 **Community Features**
- User voting system (Valid/Fake/Not Sure)
- Community comments and discussions
- User-submitted news articles
- Moderation and reporting tools

### 🎯 **Smart Caching System**
- Hybrid in-memory and database caching
- Translation caching to avoid duplicate API calls
- Performance optimization for faster loading
- Intelligent cache invalidation

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation

### Backend & Database
- **Supabase** for backend services
- **PostgreSQL** database
- **Edge Functions** for serverless operations
- **Real-time subscriptions**

### AI & Translation
- **Lingvanex API** for primary translation
- **DeepL API** for fallback translation
- **Custom AI verification models**
- **Hybrid translation caching**

### Blockchain
- **Algorand** for verification records
- **Smart contracts** for verification logic
- **Public blockchain explorer integration**

## 📁 Project Structure

```
NewsTrust-main/
├── src/
│   ├── components/          # React components
│   ├── contexts/           # React contexts (state management)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries and services
│   ├── pages/              # Page components
│   └── utils/              # Utility functions
├── supabase/
│   ├── functions/          # Edge functions
│   └── migrations/         # Database migrations
├── docs/                   # Feature documentation
└── public/                 # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Translation API keys (Lingvanex, DeepL)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/NewsTrust.git
   cd NewsTrust
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_LINGVANEX_API_KEY=your_lingvanex_key
   VITE_DEEPL_API_KEY=your_deepl_key
   VITE_NEWS_API_KEY=your_news_api_key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations in `supabase/migrations/`
   - Deploy the edge functions in `supabase/functions/`

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

### Frontend Architecture
- **Component-based** architecture with React
- **Context API** for global state management
- **Custom hooks** for reusable logic
- **TypeScript** for type safety

### Backend Architecture
- **Supabase** as the backend-as-a-service
- **Edge Functions** for serverless operations
- **Real-time subscriptions** for live updates
- **Row Level Security (RLS)** for data protection

### AI & Translation Architecture
- **Hybrid translation system** with multiple providers
- **Intelligent caching** to minimize API calls
- **Fallback mechanisms** for service reliability
- **Progress tracking** for user feedback

## 🔧 Configuration

### Translation Services
The platform supports multiple translation services with automatic fallback:
- **Primary**: Lingvanex API
- **Secondary**: DeepL API
- **Fallback**: Mock translations for development

### Caching Strategy
- **In-memory cache**: Fastest access for frequently used translations
- **Database cache**: Persistent storage for all translations
- **Cache invalidation**: Automatic cleanup of old entries

### Performance Optimization
- **Lazy loading** of components and images
- **Code splitting** for faster initial load
- **Service worker** for offline capabilities
- **Performance monitoring** and metrics

## 📊 Features in Detail

### 1. AI Verification System
- Analyzes news content for credibility
- Detects suspicious patterns and flags
- Provides confidence scores (0-100)
- Cross-references with known sources

### 2. Translation System
- Supports 50+ languages
- Hybrid caching for efficiency
- Real-time progress tracking
- Fallback mechanisms for reliability

### 3. Blockchain Integration
- Stores verification records on Algorand
- Provides immutable proof of verification
- Public audit trail for transparency
- Smart contract integration

### 4. Community Features
- User voting on article credibility
- Community comments and discussions
- User-submitted news articles
- Moderation and reporting system

### 5. Real-Time News
- Live news aggregation
- Breaking news alerts
- Regional filtering
- Category-based organization

### 6. Admin Dashboard
- Article management
- User moderation
- Translation monitoring
- System health checks

## 🔒 Security Features

- **Row Level Security (RLS)** in Supabase
- **JWT authentication** with Supabase Auth
- **Rate limiting** for API calls
- **Content moderation** for user submissions
- **Secure environment variable** handling

## 📈 Performance Features

- **Hybrid caching** system
- **Lazy loading** of components
- **Image optimization** and compression
- **Code splitting** for faster loads
- **Performance monitoring** and metrics

## 🌐 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your repository to Vercel/Netlify
2. Set environment variables in the deployment platform
3. Deploy automatically on push to main branch

### Supabase Deployment
```bash
supabase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `docs/` folder
- Review the feature-specific documentation

## 🔮 Roadmap

- [ ] Enhanced AI verification models
- [ ] Additional blockchain networks
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations
- [ ] Machine learning model training

---

**NewsTrust** - Building trust in news through AI, blockchain, and community verification. 