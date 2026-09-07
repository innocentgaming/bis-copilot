"""Lightweight in-memory telemetry metrics collector."""

import time
from typing import Any, Dict


class MetricsCollector:
    """Collects API throughput, error rates, and latency observations."""

    def __init__(self):
        self.api_requests_total: int = 0
        self.api_errors_total: int = 0
        self.chat_requests_total: int = 0
        self.ingestion_jobs_total: int = 0
        self.feedback_positive: int = 0
        self.feedback_negative: int = 0
        self._total_retrieval_latency: float = 0.0
        self._retrieval_count: int = 0
        self._total_generation_latency: float = 0.0
        self._generation_count: int = 0
        self.start_time: float = time.time()

    def record_request(self, status_code: int):
        self.api_requests_total += 1
        if status_code >= 400:
            self.api_errors_total += 1

    def record_chat(self, retrieval_ms: float, generation_ms: float):
        self.chat_requests_total += 1
        self._total_retrieval_latency += retrieval_ms
        self._retrieval_count += 1
        self._total_generation_latency += generation_ms
        self._generation_count += 1

    def record_feedback(self, rating: int):
        if rating > 0:
            self.feedback_positive += 1
        elif rating < 0:
            self.feedback_negative += 1

    def record_ingestion_job(self):
        self.ingestion_jobs_total += 1

    def get_summary(self) -> Dict[str, Any]:
        uptime = time.time() - self.start_time
        avg_retrieval = (self._total_retrieval_latency / self._retrieval_count) if self._retrieval_count > 0 else 0.0
        avg_generation = (self._total_generation_latency / self._generation_count) if self._generation_count > 0 else 0.0

        return {
            "uptime_seconds": round(uptime, 2),
            "api_requests_total": self.api_requests_total,
            "api_errors_total": self.api_errors_total,
            "chat_requests_total": self.chat_requests_total,
            "ingestion_jobs_total": self.ingestion_jobs_total,
            "feedback_positive": self.feedback_positive,
            "feedback_negative": self.feedback_negative,
            "avg_retrieval_ms": round(avg_retrieval, 2),
            "avg_generation_ms": round(avg_generation, 2),
        }


metrics = MetricsCollector()
