import os
import sys

# Ensure the project root is on the path and set a test secret before imports
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
os.environ["JWT_SECRET"] = "testsecret"

from auth.utils import hash_password, verify_password, create_access_token
from jose import jwt

def test_hash_and_verify_password():
    hashed = hash_password("secret")
    assert hashed != "secret"
    assert verify_password("secret", hashed)


def test_create_access_token():
    os.environ["JWT_SECRET"] = "testsecret"
    token = create_access_token({"sub": "user@example.com"}, expires_delta=1)
    decoded = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=["HS256"])
    assert decoded["sub"] == "user@example.com"

