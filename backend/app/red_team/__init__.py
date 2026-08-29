"""
ControlPlane AI — Red Team & Adversarial Testing Module.

Dedicated package grouping all Red Team attack suites, automated security scanners,
adversarial payload datasets, and benchmark response evaluators.
"""

from .datasets import (
    ALL_RED_TEAM_SUITES,
    get_all_red_team_prompts,
    PROMPT_INJECTION_SUITE,
    SENSITIVE_DATA_EXFILTRATION_SUITE,
    MALICIOUS_TOOL_EXECUTION_SUITE,
    MULTI_TURN_ADVERSARIAL_SUITE,
)
from .evaluator import evaluate_red_team_response
from .runner import RedTeamRunner
from ..connector.scanner import BotpressScanner
from ..connector.client import BotpressChatClient

__all__ = [
    "RedTeamRunner",
    "evaluate_red_team_response",
    "ALL_RED_TEAM_SUITES",
    "get_all_red_team_prompts",
    "PROMPT_INJECTION_SUITE",
    "SENSITIVE_DATA_EXFILTRATION_SUITE",
    "MALICIOUS_TOOL_EXECUTION_SUITE",
    "MULTI_TURN_ADVERSARIAL_SUITE",
    "BotpressScanner",
    "BotpressChatClient",
]
