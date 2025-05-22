# Project Marketplace

This project is a marketplace application built using FastAPI. It provides functionalities for user management, repository management, and purchase processing, along with GitHub integration.

## Project Structure

```
project-marketplace/
│
├── app/                     # Main application package
│   ├── __init__.py         # Initializes the app package
│   ├── main.py              # Entry point of the FastAPI application
│   ├── config.py            # General configuration settings
│   ├── database.py          # Database connection and session management
│   ├── models/              # ORM models
│   │   ├── __init__.py
│   │   ├── user.py          # User model
│   │   ├── repository.py     # Repository model
│   │   ├── purchase.py      # Purchase model
│   │   └── connection.py     # Database connection management
│   │
│   ├── schemas/             # Pydantic schemas for validation
│   │   ├── __init__.py
│   │   ├── user.py          # User validation schema
│   │   ├── repository.py     # Repository validation schema
│   │   ├── auth.py          # Authentication schemas
│   │   └── purchase.py      # Purchase validation schema
│   │
│   ├── routers/             # API routes
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication routes
│   │   ├── user.py          # User management routes
│   │   ├── repository.py     # Repository management routes
│   │   ├── github.py        # GitHub integration routes
│   │   └── purchase.py      # Purchase management routes
│   │
│   ├── services/            # Business logic services
│   │   ├── __init__.py
│   │   ├── auth_service.py  # Authentication logic
│   │   ├── github_service.py # GitHub integration logic
│   │   ├── purchase_service.py # Purchase processing logic
│   │   └── repository_service.py # Repository management logic
│   │
│   ├── utils/               # Utility functions
│   │   ├── __init__.py
│   │   ├── security.py      # Security utilities
│   │   ├── github_oauth.py  # GitHub OAuth utilities
│   │   └── google_oauth.py  # Google OAuth utilities
│
├── .env                     # Environment variables
├── requirements.txt         # Project dependencies
├── README.md                # Project documentation
├── alembic/                 # Database migration scripts
└── tests/                   # Unit and integration tests
    ├── __init__.py
    ├── test_auth.py         # Tests for authentication
    ├── test_repository.py    # Tests for repository management
    └── test_purchase.py     # Tests for purchase processing
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd project-marketplace
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up the environment variables in the `.env` file.

## Usage

To run the application, execute the following command:
```
uvicorn app.main:app --reload
```

Visit `http://localhost:8000` to access the API documentation and test the endpoints.

## Testing

To run the tests, use:
```
pytest
```

## License

This project is licensed under the MIT License.