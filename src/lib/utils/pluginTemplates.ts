export const PLUGIN_TEMPLATES = {
    // === AUTHENTICATION ===
    "key-auth": { "key": "auth-key" },
    "jwt-auth": { "key": "user-key", "secret": "your-secret", "algorithm": "HS256" },
    "basic-auth": { "username": "admin", "password": "password" },
    "hmac-auth": { "access_key": "your-access-key", "secret_key": "your-secret-key" },
    "openid-connect": { "client_id": "your-client-id", "client_secret": "your-client-secret", "discovery": "https://idp.example.com/.well-known/openid-configuration" },
    "authz-keycloak": { "discovery": "https://keycloak.example.com/auth/realms/master/.well-known/openid-configuration", "client_id": "apisix", "token_endpoint": "https://keycloak.example.com/auth/realms/master/protocol/openid-connect/token" },
    "authz-casdoor": { "endpoint": "https://casdoor.example.com", "client_id": "your-id", "client_secret": "your-secret", "org_name": "apisix" },
    "wolf-rbac": { "appid": "your-appid", "header_name": "X-RBAC-Token" },
    "ldap-auth": { "ldap_uri": "ldap://ldap.example.com:389", "ldap_base_dn": "dc=example,dc=com", "ldap_user_dn": "cn=admin,dc=example,dc=com" },
    "opa": { "host": "http://opa:8181", "policy": "example/authz" },
    "forward-auth": { "uri": "http://auth-service/auth" },

    // === TRAFFIC CONTROL ===
    "limit-count": { "count": 100, "time_window": 60, "rejected_code": 503, "key": "remote_addr" },
    "limit-req": { "rate": 1, "burst": 2, "rejected_code": 429, "key": "remote_addr" },
    "limit-conn": { "conn": 1, "burst": 2, "default_conn_delay": 0.1, "rejected_code": 503, "key": "remote_addr" },
    "proxy-cache": { "cache_strategy": "disk", "cache_zone": "disk_cache_one", "cache_key": ["$host", "$uri"], "cache_valid": ["200", "302"], "cache_control": true },
    "proxy-rewrite": { "uri": "/new-uri", "host": "new-host.com", "headers": { "set": { "X-Api-Version": "v1" } } },
    "redirect": { "http_to_https": true, "ret_code": 301 },
    "traffic-split": { "rules": [{ "weighted_upstreams": [{ "upstream_id": "1", "weight": 1 }, { "upstream_id": "2", "weight": 1 }] }] },
    "proxy-mirror": { "host": "http://mirror-service" },
    "api-breaker": { "break_response_code": 502, "max_breaker_error": 3, "unhealthy": { "http_statuses": [500, 502, 503, 504], "failures": 3 }, "healthy": { "http_statuses": [200], "successes": 1 } },
    "request-validation": { "header_schema": { "type": "object", "required": ["Content-Type"] } },
    "client-control": { "max_body_size": 1048576 },
    "workflow": { "rules": [{ "case": [["http_x_api_version", "==", "v2"]], "actions": [{ "name": "proxy-rewrite", "conf": { "uri": "/v2" } }] }] },

    // === SECURITY ===
    "cors": { "allow_origins": "*", "allow_methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS", "allow_headers": "*", "allow_credential": true },
    "ip-restriction": { "whitelist": ["127.0.0.1", "10.0.0.0/8"] },
    "ua-restriction": { "allowlist": ["Mozilla/5.0", "curl/7.29.0"] },
    "uri-blocker": { "block_rules": ["root.exe", "admin.php"], "rejected_code": 403 },
    "referer-restriction": { "whitelist": ["example.com"] },
    "consumer-restriction": { "type": "consumer_name", "whitelist": ["user1", "user2"] },
    "csrf": { "key": "your-csrf-key" },
    "public-api": { "uri": "/apisix/admin/public" },

    // === OBSERVABILITY ===
    "prometheus": {},
    "zipkin": { "endpoint": "http://zipkin:9411/api/v2/spans", "sample_ratio": 1 },
    "skywalking": { "endpoint": "http://skywalking:11800", "sample_ratio": 1 },
    "opentelemetry": { "endpoint": "http://otel:4318/v1/traces", "sample_ratio": 1 },
    "http-logger": { "uri": "http://logger:8080/log", "batch_max_size": 1000 },
    "tcp-logger": { "host": "logger", "port": 5044 },
    "udp-logger": { "host": "logger", "port": 5044 },
    "kafka-logger": { "broker_list": { "127.0.0.1": 9092 }, "kafka_topic": "test" },
    "rocketmq-logger": { "nameserver": "rocketmq:9876", "topic": "test" },
    "clickhouse-logger": { "endpoint": "http://clickhouse:8123", "user": "default", "password": "", "database": "default", "table": "test" },
    "syslog": { "host": "syslog-server" },
    "datadog": { "host": "datadog-agent", "port": 8125 },
    "log-rotate": { "max_size": 104857600, "interval": 3600 },
    "error-log-logger": { "host": "logger", "port": 5044 },
    "file-logger": { "path": "/var/log/apisix/access.log" },
    "loggly": { "key": "your-loggly-key" },
    "elasticsearch-logger": { "endpoint": "http://es:9200", "index": "apisix" },

    // === SERVERLESS ===
    "serverless-pre-function": { "functions": ["return function(conf, ctx)\n    -- your lua code here\nend"] },
    "serverless-post-function": { "functions": ["return function(conf, ctx)\n    -- your lua code here\nend"] },
    "aws-lambda": { "function_name": "my-function", "region": "us-east-1", "authorization": { "apikey": "your-key" } },
    "azure-functions": { "function_uri": "https://myfunc.azurewebsites.net", "authorization": { "apikey": "your-key" } },
    "openwhisk": { "api_host": "https://openwhisk.com", "service_token": "your-token" },

    // === TRANSFORMATION ===
    "response-rewrite": { "status_code": 200, "body": "{\"message\":\"hello world\"}" },
    "grpc-transcode": { "proto_id": "your-proto-id", "service": "your.service", "method": "YourMethod" },
    "fault-injection": { "abort": { "http_status": 200, "body": "fault injection" }, "delay": { "duration": 2 } },
    "body-transformer": { "request": { "template": "{\"new_body\": \"{{body}}\"}" } },

    // === AI ===
    "ai-proxy": { "provider": "openai", "model": "gpt-4", "options": { "apikey": "your-api-key" } },
    "ai-proxy-multi": { "plugins": [{ "provider": "openai", "model": "gpt-4", "options": { "apikey": "your-api-key" } }] },
    "ai-rag": { "embeddings": { "provider": "openai", "model": "text-embedding-3-small" } },

    // === GENERAL ===
    "request-id": { "header_name": "X-Request-Id" },
    "real-ip": { "source": "header", "header": "X-Forwarded-For" },
    "ext-plugin-pre-req": { "conf": [{ "name": "my-plugin", "value": "bar" }] },
    "ext-plugin-post-req": { "conf": [{ "name": "my-plugin", "value": "bar" }] },
};

export type PluginName = keyof typeof PLUGIN_TEMPLATES;
