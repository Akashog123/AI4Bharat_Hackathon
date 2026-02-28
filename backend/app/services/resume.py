import io
import os
from uuid import UUID, uuid4
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Resume

class ResumeService:
    def __init__(self, db: AsyncSession = None):
        self.db = db

    def generate_pdf(self, resume_data: dict) -> bytes:
        """Generate a resume PDF from structured data. Returns PDF bytes."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4,
                                topMargin=0.5*inch, bottomMargin=0.5*inch,
                                leftMargin=0.75*inch, rightMargin=0.75*inch)

        styles = getSampleStyleSheet()
        name_style = ParagraphStyle('Name', parent=styles['Title'], fontSize=20, spaceAfter=6)
        heading_style = ParagraphStyle('Heading', parent=styles['Heading2'], fontSize=13,
                                        textColor=colors.HexColor('#1a56db'), spaceAfter=6)
        body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=11, spaceAfter=4)

        elements = []

        # Name
        name = resume_data.get("name", "Name")
        elements.append(Paragraph(name, name_style))

        # Contact info
        contact_parts = []
        if resume_data.get("phone"):
            contact_parts.append(resume_data["phone"])
        if resume_data.get("email"):
            contact_parts.append(resume_data["email"])
        if resume_data.get("location"):
            contact_parts.append(resume_data["location"])
        if contact_parts:
            elements.append(Paragraph(" | ".join(contact_parts), body_style))

        elements.append(Spacer(1, 12))

        # Objective
        if resume_data.get("objective"):
            elements.append(Paragraph("Career Objective", heading_style))
            elements.append(Paragraph(resume_data["objective"], body_style))
            elements.append(Spacer(1, 8))

        # Education
        if resume_data.get("education"):
            elements.append(Paragraph("Education", heading_style))
            edu = resume_data["education"]
            if isinstance(edu, str):
                elements.append(Paragraph(f"• {edu}", body_style))
            elif isinstance(edu, list):
                for item in edu:
                    elements.append(Paragraph(f"• {item}", body_style))
            elements.append(Spacer(1, 8))

        # Skills
        if resume_data.get("skills"):
            elements.append(Paragraph("Skills", heading_style))
            skills = resume_data["skills"]
            if isinstance(skills, list):
                skills_text = " | ".join(skills)
            else:
                skills_text = str(skills)
            elements.append(Paragraph(skills_text, body_style))
            elements.append(Spacer(1, 8))

        # Work Experience
        if resume_data.get("experience"):
            elements.append(Paragraph("Work Experience", heading_style))
            exp = resume_data["experience"]
            if isinstance(exp, list):
                for item in exp:
                    if isinstance(item, dict):
                        elements.append(Paragraph(
                            f"• <b>{item.get('role', '')}</b> at {item.get('company', '')} ({item.get('duration', '')})",
                            body_style))
                        if item.get("description"):
                            elements.append(Paragraph(f"  {item['description']}", body_style))
                    else:
                        elements.append(Paragraph(f"• {item}", body_style))
            elements.append(Spacer(1, 8))

        # Languages
        if resume_data.get("languages"):
            elements.append(Paragraph("Languages", heading_style))
            langs = resume_data["languages"]
            if isinstance(langs, list):
                elements.append(Paragraph(" | ".join(langs), body_style))
            elements.append(Spacer(1, 8))

        doc.build(elements)
        return buffer.getvalue()

    async def save_resume(self, user_id: UUID, resume_data: dict, pdf_bytes: bytes) -> Resume:
        """Save resume to database and return the record."""
        # Save PDF locally (for prototype; use S3 in production)
        os.makedirs("generated_resumes", exist_ok=True)
        resume_id = uuid4()
        filename = f"generated_resumes/{resume_id}.pdf"
        with open(filename, "wb") as f:
            f.write(pdf_bytes)

        resume = Resume(
            id=resume_id,
            user_id=user_id,
            local_path=filename,
            resume_data=resume_data,
        )
        self.db.add(resume)
        await self.db.commit()
        await self.db.refresh(resume)
        return resume
