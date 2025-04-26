from pydantic import BaseModel


class UserLogin(BaseModel):
    email: str
    password: str

# Pydantic model for User Response
class UserResponse(BaseModel):
    email: str
    role: str
    status: str
