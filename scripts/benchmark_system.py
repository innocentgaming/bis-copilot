"""System performance and latency benchmarking tool for BIS Copilot (SIH 26107).

Measures latency distribution across:
1. Health endpoint (/health)
2. Readiness endpoint (/ready)
3. Direct Search (/api/v1/search)
4. Grounded Chat Generation (/api/v1/chat)
5. SSE Streaming First-Token Latency (TTFT) and Total Streaming Duration

Reports: Environment, Hardware, Sample Count, Mean, p50, p95, and p99.
"""

import argparse
import json
import os
import platform
import statistics
import sys
import time
import urllib.request
from typing import List, Tuple

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")


def compute_percentiles(values: List[float]) -> Tuple[float, float, float, float]:
    """Calculate mean, p50, p95, and p99 from a list of measurements."""
    if not values:
        return 0.0, 0.0, 0.0, 0.0
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    mean_val = statistics.mean(sorted_vals)
    p50 = sorted_vals[int(0.50 * (n - 1))]
    p95 = sorted_vals[int(0.95 * (n - 1))]
    p99 = sorted_vals[int(0.99 * (n - 1))]
    return mean_val, p50, p95, p99


def measure_endpoint(url: str, method: str = "GET", data: dict = None, samples: int = 10) -> List[float]:
    """Measure request latency in milliseconds over multiple runs."""
    latencies = []
    body_bytes = json.dumps(data).encode("utf-8") if data else None
    headers = {"Content-Type": "application/json"} if data else {}

    for _ in range(samples):
        req = urllib.request.Request(url, data=body_bytes, headers=headers, method=method)
        start = time.perf_counter()
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                _ = resp.read()
            latencies.append((time.perf_counter() - start) * 1000.0)
        except Exception:
            pass
    return latencies


def measure_streaming_ttft(url: str, data: dict, samples: int = 5) -> Tuple[List[float], List[float]]:
    """Measure streaming Time to First Token (TTFT) and Total Streaming Latency in milliseconds."""
    ttft_list = []
    total_list = []
    body_bytes = json.dumps(data).encode("utf-8")
    headers = {"Content-Type": "application/json"}

    for _ in range(samples):
        req = urllib.request.Request(url, data=body_bytes, headers=headers, method="POST")
        start = time.perf_counter()
        first_token_time = None
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                while True:
                    line = resp.readline()
                    if not line:
                        break
                    if first_token_time is None and b"token" in line:
                        first_token_time = time.perf_counter()
            end = time.perf_counter()
            if first_token_time:
                ttft_list.append((first_token_time - start) * 1000.0)
            total_list.append((end - start) * 1000.0)
        except Exception:
            pass
    return ttft_list, total_list


def benchmark_in_process():
    """Benchmark in-process Deterministic AI generation when live backend is offline."""
    print("Running in-process benchmark for Deterministic RAG Generation...")
    from backend.app.generation.deterministic_provider import DeterministicLLMProvider
    provider = DeterministicLLMProvider()
    test_prompt = (
        '<EVIDENCE id="ev-1">\n'
        'Standard: IS 12269:2015\n'
        'Clause: 6.2\n'
        'Pages: 4-5\n'
        'Citation: IS 12269:2015 Clause 6.2\n'
        'Content: The 28-day compressive strength of 53 grade cement shall be not less than 53 MPa.\n'
        '</EVIDENCE>\n\nQuestion: What is 28-day compressive strength?'
    )

    latencies = []
    for _ in range(50):
        start = time.perf_counter()
        _ = provider._generate_answer_json(test_prompt)
        latencies.append((time.perf_counter() - start) * 1000.0)

    mean, p50, p95, p99 = compute_percentiles(latencies)
    print(f"Sample Count: {len(latencies)}")
    print(f"Mean: {mean:.2f} ms | p50: {p50:.2f} ms | p95: {p95:.2f} ms | p99: {p99:.2f} ms")


def main():
    parser = argparse.ArgumentParser(description="Benchmark BIS Copilot system latencies.")
    parser.add_argument("--backend-url", default=BACKEND_URL, help="Backend URL")
    parser.add_argument("--samples", type=int, default=10, help="Number of samples per endpoint")
    args = parser.parse_args()

    print("=" * 70)
    print("             BIS COPILOT - SYSTEM PERFORMANCE BENCHMARK            ")
    print("=" * 70)
    print(f"Host OS:          {platform.system()} {platform.release()} ({platform.machine()})")
    print(f"Python Version:   {platform.python_version()}")
    print(f"Target Backend:   {args.backend_url}")
    print(f"Samples per Test: {args.samples}")
    print("-" * 70)

    # Check if backend responds
    try:
        urllib.request.urlopen(f"{args.backend_url}/health", timeout=2)
        backend_online = True
    except Exception:
        backend_online = False

    if not backend_online:
        print("\n[NOTE] Backend is not currently running at URL. Executing in-process RAG benchmark:\n")
        benchmark_in_process()
        print("\nStart the backend server (`uvicorn backend.app.main:app`) to benchmark live HTTP/SSE endpoints.")
        return

    # 1. Health Latency
    health_lats = measure_endpoint(f"{args.backend_url}/health", samples=args.samples)
    m, p50, p95, p99 = compute_percentiles(health_lats)
    print(f"1. Liveness (/health):       Mean: {m:6.2f} ms | p50: {p50:6.2f} ms | p95: {p95:6.2f} ms | p99: {p99:6.2f} ms (N={len(health_lats)})")

    # 2. Readiness Latency
    ready_lats = measure_endpoint(f"{args.backend_url}/ready", samples=args.samples)
    m, p50, p95, p99 = compute_percentiles(ready_lats)
    print(f"2. Readiness (/ready):      Mean: {m:6.2f} ms | p50: {p50:6.2f} ms | p95: {p95:6.2f} ms | p99: {p99:6.2f} ms (N={len(ready_lats)})")

    # 3. Search Latency
    search_lats = measure_endpoint(f"{args.backend_url}/api/v1/search?q=cement&method=hybrid&top_k=5", samples=args.samples)
    m, p50, p95, p99 = compute_percentiles(search_lats)
    print(f"3. Search (/search):        Mean: {m:6.2f} ms | p50: {p50:6.2f} ms | p95: {p95:6.2f} ms | p99: {p99:6.2f} ms (N={len(search_lats)})")

    # 4. Chat Latency
    chat_payload = {"query": "What is the 28-day compressive strength of IS 12269?", "language": "en"}
    chat_lats = measure_endpoint(f"{args.backend_url}/api/v1/chat", method="POST", data=chat_payload, samples=max(3, args.samples // 2))
    m, p50, p95, p99 = compute_percentiles(chat_lats)
    print(f"4. Chat Non-stream (/chat):  Mean: {m:6.2f} ms | p50: {p50:6.2f} ms | p95: {p95:6.2f} ms | p99: {p99:6.2f} ms (N={len(chat_lats)})")

    # 5. Streaming TTFT & Duration
    stream_payload = {"query": "What is the compressive strength of 53 grade cement?", "language": "en"}
    ttft_lats, total_lats = measure_streaming_ttft(f"{args.backend_url}/api/v1/chat/stream", data=stream_payload, samples=max(2, args.samples // 3))
    if ttft_lats:
        m, p50, p95, p99 = compute_percentiles(ttft_lats)
        print(f"5. Stream TTFT (/stream):   Mean: {m:6.2f} ms | p50: {p50:6.2f} ms | p95: {p95:6.2f} ms | p99: {p99:6.2f} ms (N={len(ttft_lats)})")
    if total_lats:
        m, p50, p95, p99 = compute_percentiles(total_lats)
        print(f"6. Stream Total (/stream):  Mean: {m:6.2f} ms | p50: {p50:6.2f} ms | p95: {p95:6.2f} ms | p99: {p99:6.2f} ms (N={len(total_lats)})")

    print("=" * 70)


if __name__ == "__main__":
    main()
