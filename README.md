New Project Setup from an Existing GitHub Repository
1. Clone the Repository
git clone https://github.com/USERNAME/OLD-REPOSITORY.git
cd OLD-REPOSITORY
2. Create New GitHub Repository
Create a new repo on GitHub, then change the remote:
git remote remove origin
git remote add origin https://github.com/USERNAME/NEW-REPOSITORY.git
git remote -v
3. Install Packages
npm i
4. Authentication Setup
Create/update .env or .env.local and add new credentials:
Google OAuth credentials
GitHub OAuth credentials
5. Database Setup — Prisma
Install Prisma
npm install -D prisma@7
Initialize Prisma
npx prisma init
Create Database Schema
Open:
prisma/schema.prisma
Write your models/schema there.
Create First Migration
npx prisma migrate dev --name init
Whenever Schema Changes
Change schema.prisma, then create a new migration:
npx prisma migrate dev --name <change-name>
Example:
npx prisma migrate dev --name add-user-role
Every time you make a database schema change:
Schema Change → Migration → Database Updated
View Database Visually
npx prisma studio
Prisma Studio allows you to view and manage the database visually.
6. Add New Database Credentials
Add the new database connection URL to .env:
DATABASE_URL="your-new-database-url"
7. Run the Project
npm run dev
Open:
http://localhost:3000
Remember
Clone → New GitHub Repo → New Remote → npm i → New Auth Credentials → Prisma Setup → Database → Migration → Prisma Studio → Run

Port removal:
netstat -ano | findstr :3000
taskkill /PID 10932 /F

