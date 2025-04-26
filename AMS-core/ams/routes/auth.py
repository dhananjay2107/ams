from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from ams.db.database import DatabaseConnection
from ams.schemas.auth import UserLogin
from ams.utils.hash import hash_password
from datetime import timedelta
from ams.utils.hash import verify_password
from ams.core.config import config
from ams.services.auth_services import create_access_token
from pydantic import ValidationError
import io

from ams.services.user_services import user_mgr

router = APIRouter()


@router.post("/login/")
async def login(form_data: UserLogin):

    try:
        token, role, status = await user_mgr.verify_user_login(form_data)
        if status == "Inactive":
            return {"status": status, "message": "Password need to be changed to continue!!"}

        if not token:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {"access_token": token, "token_type": "bearer", "role": role, "message":"Login Successful"}

    except Exception as e:
        raise (e)


@router.post("/change-password/")
async def change_password(form_data: UserLogin):
    try:
        result = await user_mgr.change_password(form_data.password, form_data.email)
        if not result:
            raise HTTPException(
                status_code=401, detail="Password change failed")
        return {"message": "Password changed successfully"}
    except Exception as e:
        raise (e)


# def get_db():
#     db_connection = DatabaseConnection()
#     return db_connection

# @router.post("/signup")
# async def signup(user: UserCreate, db: DatabaseConnection = Depends(get_db)):
#     users_collection = await db.get_collection("users")
#     existing_user = await users_collection.find_one({"email": user.email})
#     if existing_user:
#         raise HTTPException(status_code=400, detail="Email already registered")

#     hashed_password = hash_password(user.password)
#     user_data = user.dict()
#     user_data["password"] = hashed_password

#     result = await users_collection.insert_one(user_data)
#     return {"id": str(result.inserted_id), "message": "User registered successfully"}

# @router.post("/userListUpload")
# async def fileUpload(file: UploadFile = File(...)):
#     contents = file.read()
#     dataframe = pd.read_csv(io.BytesIO(contents))

#     records = dataframe.to_dict(orient="records")

#     validated_records = []

#     for record in records:
#         try:
#             #Verify role based User schema
#             if record["role"] == "student":
#                 validated_record = Student(**record)
#             elif record["role"] == "faculty":
#                 validated_record = Faculty(**record)
#             elif record["role"] == "admin":
#                 validated_record = Admin(**record)
#             else:
#                 raise HTTPException(status_code=400, detail="Invalid role in record")

#             # Hashing Password
#             if "password" in record and record["password"]:
#                 record["password"] = hash_password(record["password"])

#             # Add validated record to list of validated_records
#             validated_records.append(validated_record.dict())

#         except ValidationError as e:
#             raise HTTPException(status_code=400, detail=f"Invalid data in record: {e.errors()}")

#     result = await db["users"].insert_many(validated_records)

#     return {"message": "File Uploaded and data inserted to MongoDB successfully!"}'''
