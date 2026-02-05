export interface Recipe {
    id: string;
    name: string;
    description: string;
    type: 'plugin' | 'route' | 'vars';
    content: any;
}

export const APISIX_RECIPES: Recipe[] = [
    {
        id: 'header-routing',
        name: 'Route by Header',
        description: 'Direct traffic to specific backends based on header presence/value.',
        type: 'vars',
        content: [
            ["http_x_user_type", "==", "admin"],
            ["http_api_key", "~~", "a.*"] // Contains 'a'
        ]
    },
    {
        id: 'response-status-rewrite',
        name: 'Custom Error Status',
        description: 'Intercept and rewrite backend status codes for client-facing consistency.',
        type: 'plugin',
        content: {
            "response-rewrite": {
                "status_code": 403,
                "body": "{\"message\": \"Access Denied by Gateway\"}",
                "headers": {
                    "set": { "X-Blocked-Reason": "Invalid-Credential" }
                }
            }
        }
    },
    {
        id: 'canary-release',
        name: 'Canary Release (10%)',
        description: 'Traffic splitting between two upstreams for safe deployments.',
        type: 'plugin',
        content: {
            "traffic-split": {
                "rules": [
                    {
                        "weighted_upstreams": [
                            { "upstream_id": "v2-id", "weight": 1 },
                            { "upstream_id": "v1-id", "weight": 9 }
                        ]
                    }
                ]
            }
        }
    },
    {
        id: 'advanced-rewrite',
        name: 'Request URI & Header Fix',
        description: 'Clean up legacy paths and add tracing headers.',
        type: 'plugin',
        content: {
            "proxy-rewrite": {
                "uri": "/api/v1/auth",
                "headers": {
                    "set": { "X-Proxied-By": "APISIX" },
                    "remove": ["User-Agent", "Accept-Encoding"]
                }
            }
        }
    },
    {
        id: 'cors-hardening',
        name: 'Secure CORS Policy',
        description: 'Strict browser security for multi-origin environments.',
        type: 'plugin',
        content: {
            "cors": {
                "allow_origins": "https://myapp.com",
                "allow_methods": "GET,POST,OPTIONS",
                "allow_headers": "Content-Type,Authorization",
                "expose_headers": "Content-Length",
                "max_age": 3600,
                "allow_credential": true
            }
        }
    }
];
