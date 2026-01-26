"""
ClientMax Pro - Backend API
FastAPI backend for ClientMax Pro application
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="ClientMax Pro API",
    description="Backend API for ClientMax Pro - Client Management System",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "https://max.amzdudes.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Pydantic models
class HealthCheck(BaseModel):
    status: str
    message: str

class ClientResponse(BaseModel):
    id: str
    company_name: str
    contact_name: str
    email: str
    client_type: str
    health_score: int
    health_status: str
    mrr: float

# Routes
@app.get("/", response_model=HealthCheck)
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "message": "ClientMax Pro API is running"}

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "ClientMax Pro API",
        "version": "1.0.0"
    }

@app.get("/api/clients", response_model=List[ClientResponse])
async def get_clients():
    """Get all clients"""
    # TODO: Implement Supabase client fetching
    return []

@app.get("/api/clients/{client_id}", response_model=ClientResponse)
async def get_client(client_id: str):
    """Get a specific client by ID"""
    # TODO: Implement Supabase client fetching
    raise HTTPException(status_code=404, detail="Client not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

