"""
ControlPlane AI — Automated Red Team Test Runner.

Orchestrates running full or category-specific attack suites against
target resources, calculating aggregated vulnerability posture and metrics.
"""

from __future__ import annotations
import time
from typing import List, Dict, Any, Optional

from .datasets import ALL_RED_TEAM_SUITES, get_all_red_team_prompts
from .evaluator import evaluate_red_team_response
from ..connector.scanner import BotpressScanner


class RedTeamRunner:
    """
    Automated execution runner for Red Team adversarial benchmarks.
    """

    def __init__(self, scanner: BotpressScanner):
        self.scanner = scanner

    def run_suite(
        self,
        suite_name: Optional[str] = None,
        reset_conversation_between_prompts: bool = True
    ) -> Dict[str, Any]:
        """
        Executes an adversarial suite and returns comprehensive benchmark findings.
        """
        if suite_name and suite_name in ALL_RED_TEAM_SUITES:
            prompts = ALL_RED_TEAM_SUITES[suite_name]
        else:
            prompts = get_all_red_team_prompts()

        start_time = time.time()
        results: List[Dict[str, Any]] = []
        vulnerabilities_found = 0

        for p in prompts:
            if reset_conversation_between_prompts:
                self.scanner.reset_conversation()

            scan_res = self.scanner.execute_test(
                vulnerability_id=p["vulnerability_id"],
                attack_id=p["attack_id"],
                test_input=p["test_input"],
            )

            eval_res = evaluate_red_team_response(
                test_input=p["test_input"],
                target_response=scan_res.get("bot_response"),
                vulnerability_id=p["vulnerability_id"],
                latency_ms=scan_res.get("latency_ms", 0),
            )

            merged = {
                **p,
                "bot_response": scan_res.get("bot_response"),
                "status": scan_res.get("status"),
                "eval": eval_res,
            }

            if eval_res["vulnerability_detected"]:
                vulnerabilities_found += 1

            results.append(merged)

        elapsed_sec = round(time.time() - start_time, 2)
        total_tests = len(results)
        defense_rate = round(((total_tests - vulnerabilities_found) / max(1, total_tests)) * 100, 1)

        return {
            "suite_name": suite_name or "Full OWASP LLM Benchmark",
            "total_tests": total_tests,
            "vulnerabilities_found": vulnerabilities_found,
            "defense_success_rate": defense_rate,
            "duration_sec": elapsed_sec,
            "findings": results,
        }
