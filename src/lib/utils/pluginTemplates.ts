export const PLUGIN_TEMPLATES = {
    "key-auth": {
        "key": "your-key-here"
    },
    "jwt-auth": {
        "key": "user-key",
        "secret": "your-secret",
        "algorithm": "HS256"
    },
    "basic-auth": {
        "username": "admin",
        "password": "password"
    },
    "rate-limiting": {
        "count": 100,
        "time_window": 60,
        "rejected_code": 429,
        "key": "remote_addr"
    },
    "prometheus": {},
    "proxy-rewrite": {
        "uri": "/new-uri",
        "host": "new-host.com",
        "headers": {
            "set": {
                "X-Api-Version": "v1"
            },
            "add": {
                "Via": "APISIX-Proxy"
            },
            "remove": ["User-Agent"]
        }
    },
    "response-rewrite": {
        "status_code": 200,
        "headers": {
            "set": {
                "X-Server": "APISIX-Dashboard"
            },
            "remove": ["Server", "X-Powered-By"]
        },
        "body": "{\"message\": \"Rewritten by APISIX\"}"
    },
    "cors": {
        "allow_origins": "*",
        "allow_methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
        "allow_headers": "*",
        "expose_headers": "*",
        "max_age": 3600,
        "allow_credential": true
    },
    "ip-restriction": {
        "whitelist": [
            "127.0.0.1",
            "192.168.1.0/24"
        ]
    },
    "limit-count": {
        "count": 2,
        "time_window": 60,
        "rejected_code": 503,
        "key": "remote_addr"
    }
};

export type PluginName = keyof typeof PLUGIN_TEMPLATES;
