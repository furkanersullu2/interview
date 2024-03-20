from sqlalchemy import Column, Integer, String, Boolean
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, unique=False)
    last_name = Column(String, unique=False)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, unique=False)
    employee_role = Column(String, unique=False)
    suspended = Column(Boolean, unique=False)
    suspender_id = Column(Integer, unique=False)

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, unique=False, index=True)
    item_description = Column(String, unique=False, index=True)
    item_data = Column(String, unique=False, index=True)
    creator_id = Column(String, unique=False, index=True)

class Logs(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    log_message = Column(String, unique=False, index=True)

