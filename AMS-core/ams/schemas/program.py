from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId



class Program(BaseModel):
    program_name: str
