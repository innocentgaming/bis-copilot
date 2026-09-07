"""Secure password hashing implementation using Argon2."""

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError

# Enterprise-grade Argon2 parameters
_hasher = PasswordHasher(
    time_cost=3,
    memory_cost=65536,  # 64 MiB
    parallelism=4,
    hash_len=32,
    salt_len=16,
)


def hash_password(plain_password: str) -> str:
    """Hash plaintext password using Argon2id algorithm.
    
    Args:
        plain_password: Cleartext password string.
        
    Returns:
        Encoded Argon2id hash string with salt and parameters.
    """
    if not plain_password:
        raise ValueError("Password cannot be empty.")
    return _hasher.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext password against an Argon2 hash.
    
    Args:
        plain_password: Candidate plaintext password.
        hashed_password: Stored Argon2 hash string.
        
    Returns:
        True if password matches hash, False otherwise.
    """
    if not plain_password or not hashed_password:
        return False
    try:
        return _hasher.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def needs_rehash(hashed_password: str) -> bool:
    """Check whether stored hash should be updated to current parameters."""
    try:
        return _hasher.check_needs_rehash(hashed_password)
    except Exception:
        return True
