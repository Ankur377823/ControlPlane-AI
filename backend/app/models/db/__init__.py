"""
Database package initializer.
Re-exposes all domain operations to preserve the public api backwards compatibility.
"""

from __future__ import annotations

from .connection import (
    DB_PATH,
    SCHEMA,
    get_conn,
    init_db,
    _migrate_db,
    _ts_offset,
    _now,
)
from .users import (
    ALL_TENANTS,
    is_valid_tenant,
    list_users,
    authenticate_user,
    google_login_or_register,
    approve_user,
    reject_user,
)
from .resources import (
    create_resource,
    get_resource,
    list_resources,
    update_validation_status,
    to_public_dict,
    _redact,
)
from .policies import (
    get_policy,
    get_policy_for_resource,
    update_policy,
)
from .scans import (
    create_scan,
    list_scans,
)
from .interceptions import (
    TENANT_API_KEYS,
    get_tenant_api_key,
    log_interception,
    list_interceptions,
    get_interception,
    update_interception_status,
    get_analytics_summary,
    record_feedback,
)
from .reviews import (
    list_review_queue,
    process_review_decision,
    get_trustworthiness_metrics,
)
from .tokens import (
    generate_token,
    list_tokens,
    revoke_token,
    get_active_token,
    validate_token_key,
    record_device_heartbeat,
    list_devices_for_token,
)

