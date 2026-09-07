"""Streaming manager for real-time SSE token delivery with telemetry."""

import json
import time
from typing import Any, AsyncIterator, Dict

from backend.app.observability.logging import api_logger


class StreamingManager:
    """Formats streaming tokens and verified final payloads as Server-Sent Events (SSE)."""

    @staticmethod
    def format_sse_event(event_type: str, data: Any) -> str:
        """Format an SSE message with named event and JSON payload."""
        data_str = json.dumps(data, ensure_ascii=False) if not isinstance(data, str) else data
        return f"event: {event_type}\ndata: {data_str}\n\n"

    @classmethod
    async def create_stream(
        cls,
        token_stream: AsyncIterator[str],
        final_payload_getter,
        request_id: str = "stream-unknown",
    ) -> AsyncIterator[str]:
        """Stream token chunks followed by the final validated answer payload.
        
        Emits:
            - 'token': Incremental text chunks during generation.
            - 'final': Verified AnswerResponse with citations, grounding, and SSE metrics.
        """
        t_stream_start = time.perf_counter()
        first_token_time = None
        chunk_count = 0

        async for token in token_stream:
            if first_token_time is None:
                first_token_time = time.perf_counter()
            chunk_count += 1
            yield cls.format_sse_event("token", {"chunk": token})

        first_token_latency_ms = (
            round((first_token_time - t_stream_start) * 1000, 2)
            if first_token_time is not None
            else round((time.perf_counter() - t_stream_start) * 1000, 2)
        )
        stream_duration_ms = round((time.perf_counter() - t_stream_start) * 1000, 2)

        # Generate and yield the final verified payload
        final_response = await final_payload_getter()
        payload_dict = final_response.model_dump(mode="json")
        payload_dict["sse_metrics"] = {
            "request_to_first_token_ms": first_token_latency_ms,
            "stream_duration_ms": stream_duration_ms,
            "tokens_or_chunks_streamed": chunk_count,
        }

        api_logger.info(
            f"SSE stream completed: {chunk_count} chunks in {stream_duration_ms}ms (first token {first_token_latency_ms}ms)",
            extra={
                "request_id": request_id,
                "latency_ms": stream_duration_ms,
                "status_code": 200,
                "route": "/api/v1/chat/stream",
            },
        )

        yield cls.format_sse_event("final", payload_dict)

