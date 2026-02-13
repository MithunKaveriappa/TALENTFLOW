from xhtml2pdf import pisa
from jinja2 import Environment, FileSystemLoader
import io
import os

class PDFGenerator:
    @staticmethod
    def generate_resume_pdf(data: dict, template_name: str = "professional") -> bytes:
        """
        Generates a PDF from a resume template and data.
        Returns the PDF as bytes.
        """
        # 1. Setup Jinja2 environment
        template_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates", "resumes")
        env = Environment(loader=FileSystemLoader(template_dir))
        
        try:
            template = env.get_template(f"{template_name}.html")
        except:
            # Fallback to professional
            template = env.get_template("professional.html")
        
        # 2. Render HTML
        html_content = template.render(**data)
        
        # 3. Create PDF
        pdf_buffer = io.BytesIO()
        pisa_status = pisa.CreatePDF(io.StringIO(html_content), dest=pdf_buffer)
        
        if pisa_status.err:
            raise Exception("Failed to generate PDF")
            
        return pdf_buffer.getvalue()
