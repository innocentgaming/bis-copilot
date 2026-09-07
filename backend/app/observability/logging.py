"""Structured logging with contextual request attributes and privacy filtering."""

import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any, Dict, Optional

SENSITIVE_KEYS = {
    "password", "secret", "token", "access_token", "refresh_token",
    "jwt", "api_key", "authorization", "cookie"
}


def mask_sensitive_data(data: Any) -> Any:
    """Recursively mask sensitive values in dictionaries and lists."""
    if isinstance(data, dict):
        masked = {}
        for k, v in data.items():
            if any(s in k.lower() for s in SENSITIVE_KEYS):
                masked[k] = "***REDACTED***"
            elif isinstance(v, (dict, list)):
                masked[k] = mask_sensitive_data(v)
            else:
                masked[k] = v
        return masked
    elif isinstance(data, list):
        return [mask_sensitive_data(item) for item in data]
    return data


class StructuredJsonFormatter(logging.Formatter):
    """Custom logging formatter outputting single-line JSON records."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Attach custom extra fields if provided
        for attr in (
            "request_id", "user_id", "method", "path", "route",
            "latency_ms", "status_code", "error_category"
        ):
            val = getattr(record, attr, None)
            if val is not None:
                log_entry[attr] = val

        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        # Apply privacy masking
        masked_entry = mask_sensitive_data(log_entry)
        return json.dumps(masked_entry, default=str)


def get_logger(name: str = "bis_copilot") -> logging.Logger:
    """Retrieve configured structured logger."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(StructuredJsonFormatter())
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger


api_logger = get_logger("bis_copilot.api")

