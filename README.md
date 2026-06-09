We are continuing the VanMalderStudio.CRM project. ( Screenshots --> docs/screenshots)

Current state:
- The project is now much larger than the original README.
- It now includes:
  - JWT authentication
  - login page
  - admin account settings
  - dashboard with pipeline values and renewal alerts
  - leads with search/filtering
  - lead detail with edit mode, follow-ups and linked tasks
  - clients
  - client detail with edit mode
  - hosting/domain management fields
  - payments page
  - monthly payment generation
  - payment reminder copy action
  - client projects
  - project create/edit mode
- New screenshots are stored in docs/screenshots:
  - login.png
  - dashboard.png
  - leads.png
  - lead-detail.png
  - clients.png
  - client-detail.png
  - payments.png

Task:
Update README.md so it looks professional for recruiters and GitHub visitors.

Requirements:
1. Keep it clear and not too long.
2. Update the project description to explain that this is a full-stack CRM/client management system for a web studio.
3. Mention the tech stack:
   - ASP.NET Core Web API
   - Angular
   - Entity Framework Core
   - SQL Server
   - JWT authentication
   - SCSS
4. Add or update a Features section with:
   - Authentication and account settings
   - Dashboard with lead statistics, pipeline value cards and renewal alerts
   - Lead management with search/filtering and detail edit mode
   - Follow-up/activity tracking
   - Task management
   - Client management
   - Client detail with business, hosting and domain info
   - Monthly payment tracking
   - Monthly payment generation
   - Manual payment reminder copy action
   - Client projects with status, deadline, price and links
5. Screenshots section using:
   - docs/screenshots/login.png
   - docs/screenshots/dashboard.png
   - docs/screenshots/leads.png
   - docs/screenshots/lead-detail.png
   - docs/screenshots/clients.png
   - docs/screenshots/client-detail.png
   - docs/screenshots/payments.png
6. Keep setup instructions correct:
   Backend:
   cd VanMalderStudio.CRM.Api
   dotnet run --launch-profile https

   API/Swagger:
   https://localhost:7242/swagger

   Frontend:
   cd VanMalderStudio.CRM.Web
   npm install
   ng serve

   Angular:
   http://localhost:4200

   7. 
The seeded login is only for a fresh local development database.
Default seeded dev login:
admin@vanmalderstudio.local
Admin123!
After first login, the admin can change the email/password from the Account page.
Personal credentials are stored only in the local database and must never be committed.
Do not add any real/personal credentials.
Do not change code.

   But clearly say this is only a local development seeded user.
8. Add a security note:
   - appsettings.Development.json should not be committed
   - production JWT secrets should use environment variables
   - no real SSH passwords/API keys should be stored
9. Do not change code.
10. Only update README.md.

After implementation, summarize what changed.
