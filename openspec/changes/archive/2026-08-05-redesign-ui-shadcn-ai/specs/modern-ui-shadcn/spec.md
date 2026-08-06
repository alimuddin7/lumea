## ADDED Requirements

### Requirement: DaisyUI Removal and Shadcn UI Integration
The web application UI SHALL remove DaisyUI component library and replace all visual components with Shadcn UI primitives powered by Tailwind CSS and Radix UI.

#### Scenario: Rendering dashboard with Shadcn UI components
- **WHEN** user opens the API Management application
- **THEN** system renders navigation, sidebar, cards, tables, buttons, and modals built exclusively using Shadcn UI components without any DaisyUI classes or dependencies.

### Requirement: Modern API Management Layout
The system SHALL provide a modern, high-density dashboard UI layout designed for enterprise API management including Routes, Upstreams, Services, Consumers, and Plugin managers.

#### Scenario: Navigating API Management dashboard views
- **WHEN** user switches between Routes, Services, and Upstreams navigation items
- **THEN** system updates view smoothly using dark/light modern UI aesthetics with standardized status indicators, metrics cards, and responsive tables.
