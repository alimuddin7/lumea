## ADDED Requirements

### Requirement: Zero Hardcoded Default APISIX Credentials
The application SHALL NOT store hardcoded default APISIX Admin API base URLs or API Keys in the application source code.

#### Scenario: Opening application with empty LocalStorage
- **WHEN** user opens the application for the first time or clears LocalStorage
- **THEN** system initializes `baseUrl` and `apiKey` as empty strings and prompts the user to configure credentials in the settings interface.

### Requirement: User Web-Based APISIX Credential Setup
The application SHALL allow users to input, update, test, and persist their custom APISIX Admin API Base URL and X-API-KEY directly via the Web UI.

#### Scenario: Saving custom APISIX credentials via Settings UI
- **WHEN** user inputs custom APISIX Base URL (e.g. `http://localhost:9180/apisix/admin`) and X-API-KEY in Settings page and clicks Save
- **THEN** system persists credentials in browser LocalStorage and re-initiates the health check.
