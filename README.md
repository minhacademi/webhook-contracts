# Webhook Contracts

Payload documentation for webhooks dispatched by our application.

Each collection represents a feature domain and contains JSON examples of every event the system fires.

## Collections

| Collection | Events | Description |
|------------|--------|-------------|
| [framework-diamond-funnel](collections/framework-diamond-funnel/) | 11 | Diamond funnel lifecycle webhooks (SpyHub) |

## Payload Convention

All payloads follow this envelope:

```json
{
  "event": "namespace.domain.action",
  "version": "2",
  "data": { }
}
```

- `event` — dot-notation identifier
- `version` — payload schema version
- `data` — event-specific payload
