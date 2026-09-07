"""Structured logging helpers for the document ingestion pipeline."""

import logging
import sys

LOGGER_NAME = "bis_copilot.ingestion"


def get_ingestion_logger(verbose: bool = False) -> logging.Logger:
    """Return configured logger for ingestion tasks."""
    logger = logging.getLogger(LOGGER_NAME)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "%(asctime)s [%(levelname)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    logger.setLevel(logging.DEBUG if verbose else logging.INFO)
    return logger


def log_stage(logger: logging.Logger, stage: str, message: str) -> None:
    """Log a pipeline stage with standardized prefix."""
    prefix = f"[{stage.upper()}]"
    logger.info(f"{prefix:<12} {message}")


def log_warning(logger: logging.Logger, stage: str, message: str) -> None:
    """Log a pipeline warning."""
    prefix = f"[{stage.upper()}]"
    logger.warning(f"{prefix:<12} WARNING: {message}")


def log_error(logger: logging.Logger, stage: str, message: str) -> None:
    """Log a pipeline error."""
    prefix = f"[{stage.upper()}]"
    logger.error(f"{prefix:<12} ERROR: {message}")
