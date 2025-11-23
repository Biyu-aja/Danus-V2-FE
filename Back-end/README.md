# Boilerplate Express.js with TypeScript

This is a robust boilerplate for building RESTful APIs using Express.js, TypeScript, and Prisma ORM. It provides a solid foundation with pre-configured authentication, validation, file handling, and a clear project structure, allowing developers to quickly bootstrap their backend projects.

## Features

-   **TypeScript:** Strongly typed codebase for better maintainability and fewer runtime errors.
-   **Express.js:** Fast, unopinionated, minimalist web framework for Node.js.
-   **Prisma ORM:** Modern database toolkit for Node.js and TypeScript, providing type-safe database access.
-   **JWT Authentication:** Secure user authentication using JSON Web Tokens.
-   **Joi Validation:** Schema-based data validation for incoming requests.
-   **Bcrypt:** Password hashing for secure storage.
-   **Multer:** Middleware for handling `multipart/form-data`, primarily used for uploading files.
-   **Socket.IO:** Real-time bidirectional event-based communication.
-   **Modular Project Structure:** Organized into `config`, `core`, `exceptions`, `helpers`, and `middlewares` for clear separation of concerns.
-   **Error Handling:** Centralized error handling for consistent API responses.
-   **Code Generation:** A simple script to generate new module structures (controller, service, router, validator).

## Technologies Used

-   Node.js
-   Express.js
-   TypeScript
-   Prisma ORM
-   PostgreSQL (or any other database supported by Prisma)
-   Joi
-   jsonwebtoken
-   bcrypt
-   multer
-   socket.io

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

-   Node.js (v18 or higher)
-   npm or Yarn
-   PostgreSQL (or Docker for easy setup)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Razdan12/boilerplate-express-js-with-typescript.git
    cd Boilerplate
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory based on `.env.example` (if available, otherwise create one with the following structure):

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/database_name?schema=public"
    JWT_SECRET="your_jwt_secret_key"
    JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"
    PORT=3000
    ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
    ```
    *Replace `user`, `password`, `localhost:5432`, `database_name`, `your_jwt_secret_key`, and `your_jwt_refresh_secret_key` with your actual database credentials and secret keys.*

4.  **Database Setup (Prisma):
    **Ensure your PostgreSQL database is running.**

    Run Prisma migrations to create the database schema:
    ```bash
    npx prisma migrate dev --name init
    ```

### Running the Project

-   **Development Mode (with hot-reloading):**
    ```bash
    npm run dev
    ```

-   **Build and Start (Production Mode):**
    First, build the TypeScript code:
    ```bash
    npm run build
    ```
    Then, start the compiled JavaScript application:
    ```bash
    npm run start
    ```

    The API server will run on the port specified in your `.env` file (default: `3000`).

## Project Structure
```
/Boilerplate/
├───.env.example            # Example environment variables. Copy to .env and fill in your configuration.
├───.gitignore              # Specifies files and directories to be ignored by Git.
├───.prettierignore         # Specifies files and directories to be ignored by Prettier.
├───.prettierrc             # Configuration file for Prettier.
├───package-lock.json       # Records the exact version of each dependency.
├───package.json            # Project manifest with metadata, scripts, and dependencies.
├───README.md               # Project documentation.
├───tsconfig.json           # TypeScript compiler configuration.
├───generator/              # Directory for generator scripts.
│   ├───core.ts             # Core script for the generator.
│   └───seed.ts             # Script to seed the database with initial data.
├───logs/                   # Directory for log files.
│   └───app-2025-10-10.log  # Application log file for a specific date.
├───prisma/                 # Directory for Prisma ORM configuration.
│   ├───schema.prisma       # Prisma schema file defining data models and database connection.
│   └───migrations/         # Directory for database migration files.
│       ├───migration_lock.toml # Lock file to prevent concurrent migrations.
│       └───20251010114426_testing/ # Individual migration directory.
│           └───migration.sql # SQL file for the database migration.
└───src/                    # Main directory for the application's source code.
    ├───app.ts              # Main Express.js application file.
    ├───index.ts            # Main entry point of the application.
    ├───router.ts           # Defines the main application routes.
    ├───assets/             # Directory for static assets like images, stylesheets, etc.
    │   └───images/         # Directory for image files.
    │       └───logo-sade.png # Logo image file.
    ├───base/               # Directory for base classes.
    │   ├───controller.base.ts # Base class for controllers.
    │   ├───service.base.ts    # Base class for services.
    │   └───validator.base.ts  # Base class for validators.
    ├───core/               # Directory for the application's core business logic.
    │   └───user/           # Directory for user-related functionality.
    │       ├───user.controller.ts # Controller for handling user-related requests.
    │       ├───user.router.ts     # Router for user-related routes.
    │       ├───user.service.ts    # Service for user-related business logic.
    │       └───user.validator.ts  # Validator for user-related request data.
    ├───db/                 # Directory for database configuration and connection.
    │   └───prisma.ts       # File to initialize and configure the Prisma client.
    ├───lib/                # Directory for libraries and helper modules.
    │   ├───file-manager/   # Module for file management.
    │   │   └───index.ts    # Entry point for the file-manager module.
    │   ├───logger/         # Module for logging.
    │   │   └───index.ts    # Entry point for the logger module.
    │   └───mailer/         # Module for sending emails.
    │       └───index.ts    # Entry point for the mailer module.
    ├───middlewares/        # Directory for Express.js middlewares.
    │   ├───auth.middleware.ts      # Middleware for authentication.
    │   ├───exception.middleware.ts # Middleware for handling exceptions.
    │   ├───upload.middleware.ts    # Middleware for handling file uploads.
    │   └───validator.middleware.ts # Middleware for request data validation.
    ├───types/                # Directory for TypeScript type definitions.
    │   └───express.d.ts    # Type definition file to extend Express.js objects.
    ├───utils/                # Directory for utility functions.
    │   ├───array.ts        # Utility functions for arrays.
    │   ├───date.ts         # Utility functions for dates.
    │   ├───number.ts       # Utility functions for numbers.
    │   ├───string.ts       # Utility functions for strings.
    │   ├───transform.ts    # Utility functions for data transformation.
    │   └───type.ts         # Utility functions for data types.
    └───views/                # Directory for view templates.
        └───email-activation.html # HTML template for email activation.
```

## Code Generation

This boilerplate includes a simple code generator to scaffold new modules (controller, service, router, validator) quickly.

To use it, run:

```bash
npm run gen:core -- --name <ModuleName> --model-name <PrismaModelName>
```

-   Replace `<ModuleName>` with the desired name for your module (e.g., `Product`, `Order`). This will be used for folder and file naming.
-   Replace `<PrismaModelName>` with the exact name of your Prisma model (e.g., `Product`, `Order`). This is used by the service layer to interact with the database.

Example:

```bash
npm run gen:core -- --name Product --model-name Product
```

This will create a `product` folder under `src/core` with `product.controller.ts`, `product.router.ts`, `product.service.ts`, and `product.validator.ts` files, pre-filled with basic CRUD operations and imports.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is licensed under the ISC License - see the `LICENSE` file for details. (Note: A `LICENSE` file is not included in this boilerplate. You should add one if you plan to open-source your project.)
