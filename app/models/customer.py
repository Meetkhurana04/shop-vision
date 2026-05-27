from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    family_name = Column(String, nullable=False)
    display_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    faces = relationship("CustomerFace", back_populates="customer", cascade="all, delete-orphan")
    visits = relationship("CustomerVisit", back_populates="customer", cascade="all, delete-orphan")

class CustomerFace(Base):
    __tablename__ = "customer_faces"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    image_path = Column(String, nullable=False)
    embedding = Column(String, nullable=False) # Store JSON string of the 128D vector
    created_at = Column(DateTime, default=func.now())
    
    customer = relationship("Customer", back_populates="faces")

class CustomerVisit(Base):
    __tablename__ = "customer_visits"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True) # Nullable for unknown visits
    detected_at = Column(DateTime, default=func.now())
    confidence = Column(Float, nullable=True)
    snapshot_path = Column(String, nullable=True)
    
    customer = relationship("Customer", back_populates="visits")
