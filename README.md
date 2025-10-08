# Desi Events Leeds

A community platform for posting and discovering Indian cultural events in Leeds.

## 🎯 Features

- **Event Discovery**: Browse upcoming cultural, social, and community events
- **Event Posting**: Registered users can submit events for approval
- **Admin Dashboard**: Manage and approve pending events
- **Email Notifications**: Automated approval workflow via email
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Beautiful UI that works on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- PostgreSQL database (we recommend [Neon](https://neon.tech))
- Gmail account (for sending emails)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/DesiEventsLeeds.git
cd DesiEventsLeeds

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file with your credentials
nano .env
```

### Environment Setup

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YourSecurePassword
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com
SESSION_SECRET=your-random-session-secret-here
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Run Development Servers

```bash
# Terminal 1: Start backend server
npm run dev

# Terminal 2: Start frontend dev server
npm run dev:client
```

Visit:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

### Database Setup

```bash
# Push schema to database
npm run db:push

# Optional: Seed with sample data
npm run seed
```

## 📦 Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Wouter (routing)

### Backend
- Express.js
- TypeScript
- Drizzle ORM
- PostgreSQL (Neon)
- Nodemailer

### DevOps
- GitHub Actions (CI/CD)
- Vercel (recommended deployment)
- Docker (alternative deployment)

## 🏗️ Project Structure

```
DesiEventsLeeds/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and helpers
├── server/              # Backend Express application
│   ├── routes/          # API route handlers
│   ├── middleware/      # Express middleware
│   ├── emailService.ts  # Email functionality
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema (Drizzle)
└── .github/workflows/   # CI/CD pipelines
```

## 🎨 Key Features Explained

### User Features
1. **Browse Events**: View all approved events on the homepage
2. **Event Details**: Click any event to see full details
3. **Register/Login**: Create an account to post events
4. **Submit Events**: Fill out the event form with all details
5. **Approval Status**: Get notified when your event is approved

### Admin Features
1. **Admin Dashboard**: Access at `/admin` with admin credentials
2. **Pending Events**: Review all events awaiting approval
3. **All Events**: View and manage all events in the system
4. **Email Approvals**: Approve/reject events directly from email
5. **Delete Events**: Remove inappropriate or outdated events

### Email Workflow
1. User submits an event
2. Admin receives email notification with event details
3. Admin can approve/reject with one click from email
4. User sees approved events on the main page
5. Success message shown after submission

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend in development mode |
| `npm run dev:client` | Start frontend dev server |
| `npm run build` | Build frontend and backend for production |
| `npm start` | Run production server |
| `npm run db:push` | Push schema changes to database |
| `npm run db:generate` | Generate SQL migrations |
| `npm run seed` | Seed database with sample data |

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- ✅ Vercel (Recommended)
- Railway
- DigitalOcean
- Docker/Custom VPS

### Quick Vercel Deploy

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel --prod
```

## 🔐 Security

- Passwords hashed with bcrypt
- Express sessions with secure cookies
- CORS configured for production
- Helmet.js for HTTP security headers
- Environment variables for secrets
- Admin-only routes protected with middleware

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linter
npm run lint
```

## 📝 API Endpoints

### Public Routes
- `GET /api/auth/public-events` - Get all approved events
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset

### Protected Routes (User)
- `POST /api/events` - Create new event
- `GET /api/events/my-events` - Get user's events
- `POST /api/auth/logout` - Logout

### Admin Routes
- `POST /api/admin/login` - Admin login
- `GET /api/admin/pending` - Get pending events
- `GET /api/admin/events` - Get all events
- `POST /api/admin/events/:id/approve` - Approve event
- `POST /api/admin/events/:id/reject` - Reject event
- `DELETE /api/admin/events/:id` - Delete event

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Asief** - Initial work - Admin & Developer

## 🙏 Acknowledgments

- Leeds Indian Community
- All event organizers
- Contributors and supporters

---

**Made with ❤️ for the Leeds Desi Community**

