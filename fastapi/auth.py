from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette import status
from database import SessionLocal
from models import User
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
import models
router=APIRouter(
    prefix='/auth',
    tags=['auth']
)


SECRET_KEY = '756423f546a20121b56654121c285e2132d3746552e23a42024d65452'
ALGORITHM='HS256'

bcrypt_context= CryptContext(schemes=['bcrypt'], deprecated="auto")
oauth2_bearer=OAuth2PasswordBearer(tokenUrl='auth/token')

class CreateUserRequest(BaseModel):
    first_name      : str
    last_name       : str
    email           : str
    password        : str
    employee_role   : str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserBase(BaseModel):
    first_name   : str
    last_name    : str
    email        : str
    hashed_password: str
    employee_role: str
    suspended: bool
    suspender_id:int

class UserModel(UserBase):
    id: int
    class Config:
        from_attributes = True


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session,Depends(get_db)]

@router.post("/")
async def create_user(db:db_dependency,create_user_request:CreateUserRequest):
    if(create_user_request.employee_role=="Superadmin"):
        if (check_SA(db)):
            return JSONResponse(content={}, status_code=status.HTTP_403_FORBIDDEN)
    create_user_model= User(
    first_name = create_user_request.first_name,
    last_name = create_user_request.last_name,
    email = create_user_request.email,
    hashed_password = bcrypt_context.hash(create_user_request.password),
    employee_role = create_user_request.employee_role,
    suspended = False,
    suspender_id=0
    )
    db.add(create_user_model)
    db.commit() 
    db.refresh(create_user_model)
    print("here")

    return JSONResponse(content={}, status_code=status.HTTP_201_CREATED)
    

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data:Annotated[OAuth2PasswordRequestForm,Depends()], db:db_dependency):
    user=authenticate_user(form_data.username,form_data.password,db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    token = create_access_token(user,timedelta(minutes=20))
    return {'access_token': token, 'token_type':'bearer'}

def authenticate_user(username:str, password:str, db):
    user = db.query(User).filter(User.email==username).first()
    if not user:
        return False
    if not bcrypt_context.verify(password,user.hashed_password):
        return False
    if (user.suspended):
        return False
    return user


def create_access_token(user:UserBase ,expires_delta:timedelta):
    encode = {'first_name': user.first_name,
              'last_name': user.last_name,
              'employee_role': user.employee_role,
               'id':user.id}
    expires = datetime.utcnow()+expires_delta
    encode.update({'exp':expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)


def get_user_from_db(db: db_dependency, user_id:int):
    users = db.query(models.User).filter(models.User.id == user_id).first()
    return users

def check_SA(db:db_dependency):
    user = db.query(User).filter(User.employee_role=="Superadmin").first()
    if not user:
        return False
    return True

