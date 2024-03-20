from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import JSONResponse
from typing import Annotated
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import SessionLocal, engine
from models import *
from fastapi.middleware.cors import CORSMiddleware
from auth import create_access_token,router
from datetime import timedelta, datetime


app = FastAPI()
app.include_router(router)
origins = [
    'http://localhost:3000'
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'])

security = HTTPBasic()

class LogsBase(BaseModel):
    log_message:str

class LogsModel(LogsBase):
    id: int
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    first_name   : str
    last_name    : str
    email        : str
    hashed_password: str
    employee_role: str
    suspended:bool
    suspender_id:int

class UserModel(UserBase):
    id: int
    class Config:
        from_attributes = True


class ItemBase(BaseModel):
    item_name        : str
    item_description : str
    item_data        : str
    creator_id       : str

class ItemModel(ItemBase):
    id: int
    class Config:
        from_attributes = True

class CreateUserRequest(BaseModel):
    first_name      : str
    last_name       : str
    email           : str
    hashed_password : str
    employee_role   : str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session,Depends(get_db)]

Base.metadata.create_all(bind=engine)

'''Returns all users.'''
@app.get("/users/all/",response_model=list[UserModel])
async def read_users_all(db: db_dependency): # type: ignore
    users = db.query(User).all()
    return users

'''Returns all basic users.'''
@app.get("/users/",response_model=list[UserModel])
async def read_users_basic(db: db_dependency):
    users = db.query(User).filter(User.employee_role == "Basic").all()
    return users

'''Updates the user data of the user with user_id'''
@app.patch("/users/", response_model=UserModel)
def update_user(db: db_dependency, user_id: int, updated_user: CreateUserRequest):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db_user.first_name = updated_user.first_name
        db_user.last_name = updated_user.last_name
        #Users’ emails, passwords, and roles cannot be altered.
        db.commit()
        db.refresh(db_user)
        token= create_access_token(db_user,timedelta(minutes=20))
        log = Logs(log_message="User with ID: " + str(db_user.id) + " updated")
        db.add(log)
        db.commit() 
        db.refresh(log)
        return JSONResponse(content={'access_token': token, 'token_type':'bearer'}, status_code=status.HTTP_200_OK)
    return JSONResponse(content={}, status_code=status.HTTP_404_NOT_FOUND)

'''Suspends a user'''
@app.patch("/users/suspend/", response_model=UserModel)
def suspend_user(db: db_dependency, suspended_user_id: int, suspender_id: int):
    db_user = db.query(User).filter(User.id == suspended_user_id).first()
    if db_user:
        db_user.suspended = True
        db_user.suspender_id = suspender_id
        db.commit()
        db.refresh(db_user)
        log = Logs(log_message="User with ID: " + str(db_user.id) + " suspended by " + str(suspender_id) )
        db.add(log)
        db.commit() 
        db.refresh(log)
        return JSONResponse(content={}, status_code=status.HTTP_200_OK)
    return JSONResponse(content={}, status_code=status.HTTP_404_NOT_FOUND)

'''Enables suspended user if the suspender and the enabler are the same admin'''
@app.patch("/users/enable/", response_model=UserModel)
def enable_user(db: db_dependency, suspended_user_id: int, suspender_id: int):
    db_user = db.query(User).filter(User.id == suspended_user_id).first()
    if db_user:
        if(db_user.suspender_id == suspender_id):
            db_user.suspended = False
        #among admins, only same suspender can enable user
            db.commit()
            db.refresh(db_user)
            log = Logs(log_message="User with ID: " + str(db_user.id) + " enabled by " + str(suspender_id) )
            db.add(log)
            db.commit() 
            db.refresh(log)
            return JSONResponse(content={}, status_code=status.HTTP_200_OK)
        return JSONResponse(content={}, status_code=status.HTTP_401_UNAUTHORIZED)
    return JSONResponse(content={}, status_code=status.HTTP_404_NOT_FOUND)

'''Enables any user regardles of the suspender'''
@app.patch("/users/enable/sa/", response_model=UserModel)
def enable_user_SA(db: db_dependency, suspended_user_id: int):
    db_user = db.query(User).filter(User.id == suspended_user_id).first()
    if db_user:
        db_user.suspended = False
    #SA can enable any user
        
        db.commit()
        db.refresh(db_user)
        log = Logs(log_message="User with ID: " + str(db_user.id) + " enabled by Superadmin" )
        db.add(log)
        db.commit() 
        db.refresh(log)
        return JSONResponse(content={}, status_code=status.HTTP_200_OK)
    return JSONResponse(content={}, status_code=status.HTTP_404_NOT_FOUND)

'''Deletes the user with user_id'''
@app.delete("/users/", response_model=UserModel)
def delete_user(db: db_dependency, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()#maybe delete with username?
    if db_user:
        db.delete(db_user)
        db.commit()
        log = Logs(log_message="User with ID: " + str(db_user.id) + " deleted")
        db.add(log)
        db.commit() 
        db.refresh(log)

        return db_user
    return JSONResponse(content={}, status_code=status.HTTP_404_NOT_FOUND)

'''Creates item from provided data.'''
@app.post("/items/", response_model=ItemModel)
async def create_item(item: ItemBase, db: db_dependency):
    db_item = Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    log = Logs(log_message="Item with ID: " + str(db_item.id) + " created")
    db.add(log)
    db.commit() 
    db.refresh(log)
    return db_item

'''Returns items of one creator with creator_id'''
@app.get("/items/",response_model=list[ItemModel])
async def read_items(db: db_dependency,creator_id:str):
    items = db.query(Item).filter(Item.creator_id == creator_id).all()
    return items


'''Returns all items'''
@app.get("/items/all",response_model=list[ItemModel])
async def read_items_all(db: db_dependency):
    items = db.query(Item).all()
    return items

'''Updates the item with item_id'''
@app.patch("/items/", response_model=ItemModel)
def update_item(db: db_dependency, item_id: int, updated_item: ItemBase):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if db_item:
        db_item.item_name = updated_item.item_name
        db_item.item_description = updated_item.item_description
        db_item.item_data = updated_item.item_data

        db.commit()
        db.refresh(db_item)

        log = Logs(log_message="Item with ID: " + str(db_item.id) + " updated")
        db.add(log)
        db.commit() 
        db.refresh(log)
        return db_item
    return JSONResponse(content={}, status_code=status.HTTP_404_NOT_FOUND)


'''Deletes item with item_id'''
@app.delete("/items/", response_model=ItemModel)
def delete_item(db: db_dependency, item_id: str):
    item_id=int(item_id)
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        log = Logs(log_message="Item with ID: " + str(db_item.id) + " deleted")
        db.add(log)
        db.commit() 
        db.refresh(log)
        return db_item
    return JSONResponse(content={}, status_code=status.HTTP_404_NOT_FOUND)

