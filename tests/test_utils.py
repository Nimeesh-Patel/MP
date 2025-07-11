import os
import sys

# Ensure the project root is on the path and set a test secret before imports
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
os.environ["JWT_SECRET"] = "testsecret"

from auth import utils as auth_utils
from jose import jwt
from datetime import datetime, timezone
import importlib

def test_hash_and_verify_password():
    hashed = auth_utils.hash_password("secret")
    assert hashed != "secret"
    assert auth_utils.verify_password("secret", hashed)


def test_create_access_token():
    os.environ["JWT_SECRET"] = "testsecret"
    token = auth_utils.create_access_token({"sub": "user@example.com"}, expires_delta=1)
    decoded = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=["HS256"])
    assert decoded["sub"] == "user@example.com"


def test_default_expiry_from_env():
    os.environ["JWT_SECRET"] = "testsecret"
    os.environ["TOKEN_MINUTES"] = "1"
    importlib.reload(auth_utils)
    token = auth_utils.create_access_token({"sub": "user@example.com"})
    decoded = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=["HS256"])
    assert decoded["sub"] == "user@example.com"
    exp = datetime.fromtimestamp(decoded["exp"], timezone.utc)
    remaining = exp - datetime.now(timezone.utc)
    assert 0 < remaining.total_seconds() <= 60