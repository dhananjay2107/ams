from fastapi.testclient import TestClient
from ams.main import app
from ams.db.database import db
import pytest
import asyncio
from ams.utils.hash import hash_password

client = TestClient(app)

# Helper function to create a test user
@pytest.fixture(scope="module", autouse=True)
async def setup_test_user():
    test_user = {
        "name": "Test User",
        "email": "testuser@example.com",
        "hashed_password": hash_password("password123"),
    }
    # Insert test user into the database
    await db["users"].insert_one(test_user)
    yield
    # Cleanup after tests
    await db["users"].delete_many({})

@pytest.mark.asyncio
async def test_login_success():
    # Send login request
    response = client.post(
        "/auth/login",
        data={"email": "testuser@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

@pytest.mark.asyncio
async def test_login_invalid_credentials():
    # Send login request with invalid credentials
    response = client.post(
        "/auth/login",
        data={"email": "wronguser@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

@pytest.mark.asyncio
async def test_admin_access():
    # Login as admin
    response = client.post(
        "/auth/login",
        data={"email": "admin@example.com", "password": "admin123"},
    )
    token = response.json()["access_token"]

    # Access admin dashboard
    headers = {"Authorization": f"Bearer {token}"}
    admin_response = client.get("/admin/dashboard", headers=headers)
    assert admin_response.status_code == 200
    assert admin_response.json()["message"] == "Welcome to the admin dashboard!"

@pytest.mark.asyncio
async def test_user_access_denied():
    # Login as regular user
    response = client.post(
        "/auth/login",
        data={"email": "user@example.com", "password": "user123"},
    )
    token = response.json()["access_token"]

    # Attempt to access admin dashboard
    headers = {"Authorization": f"Bearer {token}"}
    admin_response = client.get("/admin/dashboard", headers=headers)
    assert admin_response.status_code == 403
    assert admin_response.json()["detail"] == "You do not have access to this resource"
