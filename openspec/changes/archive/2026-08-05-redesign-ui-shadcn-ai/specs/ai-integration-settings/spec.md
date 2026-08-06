## ADDED Requirements

### Requirement: AI Provider and API Key Configuration
The system SHALL provide a dedicated settings UI to input, validate, and store AI credentials including API Key, Provider Base URL/Link (e.g. OpenAI, Google Gemini, Anthropic, or custom OpenAI-compatible endpoint).

#### Scenario: Saving valid AI Key and Endpoint
- **WHEN** user inputs provider endpoint URL and API Key in the AI Settings form and clicks "Save Configuration"
- **THEN** system securely saves the credentials locally and validates connectivity to the specified provider endpoint.

### Requirement: Dynamic AI Model Selection
The system SHALL allow users to select from a dynamic list of AI models supported by the configured provider (e.g., gpt-4o, gpt-4o-mini, gemini-1.5-pro, claude-3-5-sonnet, deepseek-r1) and persist the selected active model.

#### Scenario: Selecting active model for AI Manager
- **WHEN** user opens the Model Selection dropdown and chooses a target model
- **THEN** system sets the chosen model as active and uses it for all subsequent AI API Manager tasks.
