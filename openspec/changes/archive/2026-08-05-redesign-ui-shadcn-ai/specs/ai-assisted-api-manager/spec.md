## ADDED Requirements

### Requirement: AI-Assisted Route & Plugin Generation
The system SHALL enable users to generate, configure, and optimize APISIX routes, upstream services, and security plugins (such as rate-limiting, key-auth, CORS) automatically via AI natural language prompts using the active configured model.

#### Scenario: Prompting AI to build rate-limited route
- **WHEN** user enters a natural language prompt like "Buat rute /v1/users dengan rate limiting 100 req/min dan auth JWT" into the AI Assistant interface
- **THEN** system queries the configured AI model and auto-generates the corresponding APISIX JSON configuration, displaying a preview and one-click apply button.

### Requirement: Automated API Health & Security Recommendation
The system SHALL analyze existing API routes and plugins via AI to detect security gaps, performance bottlenecks, or missing rate-limiting policies and propose automated fixes.

#### Scenario: Running AI Audit on existing routes
- **WHEN** user clicks "AI Analyze Routes" on the API list view
- **THEN** system analyzes route security configurations using the active model and displays recommendations to apply missing security plugins.
