# SkillSwap Hub

A minimalist and elegant platform where users can exchange skills and knowledge with each other. Built with React, TypeScript, Express.js, and PostgreSQL.

TishyaJha tishyajha04@gmail.com
YuvrajSingh yuvrajsingh0251@gmail.com
VideoLink:https://drive.google.com/file/d/1UgDX076e_AsHY9RxB26xFd0cEN884vmE/view?usp=drive_link
## Features

- **User Authentication**: JWT-based authentication system
- **Skill Management**: Add, edit, and manage your skills
- **Skill Swapping**: Request and accept skill exchanges with other users
- **Search & Discovery**: Find users with specific skills
- **Real-time Messaging**: Communicate with other users
- **Admin Dashboard**: User management, skill moderation, and analytics
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching
- Shadcn/ui components

### Backend
- Node.js with Express.js
- TypeScript
- PostgreSQL with Drizzle ORM
- JWT for authentication
- CORS enabled

  ### Create Account
<img src = "https://github.com/overlord00007/overlord00007/blob/main/ss1.jpeg" style="width:600px">

 ### Profile
<img src = "https://github.com/overlord00007/overlord00007/blob/main/ss2.jpeg" style="width:600px">

 ### Inbox
<img src = "https://github.com/overlord00007/overlord00007/blob/main/ss3.jpeg" style="width:600px">

 ### Swap Request
<img src = "https://github.com/overlord00007/overlord00007/blob/main/ss4.jpeg" style="width:600px">

 ### Admin Dashboard
<img src = "https://github.com/overlord00007/overlord00007/blob/main/ss5.jpeg" style="width:600px">

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-github-repo-url>
   cd SkillSwapHub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/skillswap
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   ```

4. **Set up the database**
   ```bash
   # Create the database
   createdb skillswap
   
   # Run migrations
   npm run db:migrate
   ```

5. **Start the development servers**
   ```bash
   # Start backend server
   npm run server:dev
   
   # In a new terminal, start frontend
   npm run client:dev
   ```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server:dev` - Start backend server only
- `npm run client:dev` - Start frontend development server
- `npm run build` - Build the frontend for production
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate new migration files

## Project Structure

```
SkillSwapHub/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Backend Express.js application
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── db.ts             # Database configuration
├── shared/                # Shared types and schemas
└── drizzle.config.ts      # Drizzle ORM configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (admin only)

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Add new skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

### Swap Requests
- `GET /api/swaps` - Get user's swap requests
- `POST /api/swaps` - Create swap request
- `PUT /api/swaps/:id/accept` - Accept swap request
- `PUT /api/swaps/:id/reject` - Reject swap request

## Admin Features

To access admin features, you need to be assigned admin privileges. Use the provided script:

```bash
npm run make-admin <user-email>
```

Admin features include:
- User management (view, ban, delete users)
- Skill moderation (approve/reject skills)
- Swap monitoring
- System analytics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub. 
