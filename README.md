# Blog Application

This is a full-stack blog application featuring Role-Based Access Control (RBAC) for authentication and authorization. Users can create, view, and manage blog posts, while administrators have additional privileges for user management.

## ✨ Features

* **User Authentication & Authorization:** Secure login and registration with JWT-based authentication.

* **Role-Based Access Control (RBAC):**

    * **Readers:** Can view all blog posts.

    * **Authors:** Can create, edit, and delete their own blog posts, and request an Author role.

    * **Admins:** Have full control over all blog posts and comprehensive user management capabilities (view, block/unblock, change roles, approve/reject author requests).

* **Blog Post Management:**

    * Create, view, edit, and delete blog posts.

    * Rich text editor for post content.

    * Pagination for blog listings and dashboard posts.

* **Responsive UI:** Built with Angular and PrimeNG/Tailwind CSS for a modern and adaptive user experience across devices.

* **Dark Mode Toggle:** User-configurable dark mode for improved readability.

* **User Dashboard:** Personalized dashboard for authors to manage their posts, and for admins to manage both posts and users.

## 🚀 Technologies Used

This project leverages a modern tech stack for both frontend and backend development.

### Frontend

* **Angular 19:** A powerful framework for building single-page applications.

* **PrimeNG:** A comprehensive UI component library for Angular, providing rich and interactive components.

* **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.

* **Signals:** Angular's new reactive primitive for state management.

* **`jwt-decode`:** For decoding JWTs on the client-side.

### Backend

* **NestJS:** A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.

* **Prisma:** A next-generation ORM for Node.js and TypeScript, simplifying database access.

* **PostgreSQL (Neon DB):** A powerful, open-source relational database, with Neon providing serverless capabilities.

* **JWT (JSON Web Tokens):** For secure authentication.

* **Bcrypt:** For password hashing.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js:** v18.x or higher (LTS recommended)

* **npm** or **Yarn:** Node.js package manager

* **PostgreSQL Database:** A running PostgreSQL instance. For this project, a Neon DB instance is recommended for ease of setup.

## ⚙️ Getting Started

Follow these steps to get the project up and running on your local machine.

### 1. Clone the Repository

```git clone ```

### 2. Backend Setup (NestJS)

Navigate to the backend directory (e.g., `cd backend`).

**Install Dependencies:**

``` npm i ```

**Environment Variables:**

Create a `.env` file in the `backend` directory and add the following:

``` 
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
JWT_SECRET="your_super_secret_jwt_key" 
```

* Replace `DATABASE_URL` with your PostgreSQL connection string (e.g., from Neon DB).

* Replace `JWT_SECRET` with a strong, random string.

**Database Migration:**

Apply the Prisma migrations to set up your database schema:
`npx prisma migrate dev --name init`

**Generate Prisma Client:**
`npx prisma generate`

**Run the Backend:**
`npm run start`

The backend server will typically run on `http://localhost:3000`.

### 3. Frontend Setup (Angular)

Open a new terminal and navigate to the frontend directory (e.g., `cd sakai-ng`).

**Install Dependencies:**
`npm install`

**Run the Frontend:**
`npm start`

The frontend application will typically run on `http://localhost:4200`.


## 🖥️ Usage

1.  **Access the Application:** Open your browser and navigate to `http://localhost:4200`.

2.  **Register:** Create a new user account. By default, new users will have the 'READER' role.

3.  **Login:** Log in with your registered credentials.

4.  **Explore Posts:** As a 'READER', you can view existing blog posts.

5.  **Request Author Role:** If you wish to create posts, navigate to your dashboard (if available) or use the dropdown menu in the top bar to "Request Author Role". An admin will need to approve this request.

6.  **Author Dashboard:** Once your author request is approved by an admin, you will gain access to the "Your Posts" tab in the dashboard to create, edit, and delete your own blog posts.

7.  **Admin Features:** If you log in as an 'ADMIN' user (you might need to manually set a user's role to ADMIN in your database for initial testing or create an admin user via a backend script), you will see an additional "Manage Users" tab in the dashboard. Here, you can:

    * View all users.

    * Block/Unblock users.

    * Change user roles (USER, AUTHOR, ADMIN).

    * Approve or reject pending author requests.

8.  **Dark Mode:** Toggle dark mode using the switch in the top bar.

## 🤝 Contributing

Contributions are welcome! If you have suggestions or find issues, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License.