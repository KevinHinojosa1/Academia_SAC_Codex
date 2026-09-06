from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "formato-recepcion-sac.pdf"

NAVY = colors.HexColor("#092B3D")
INK = colors.HexColor("#173846")
TEAL = colors.HexColor("#08A991")
MINT = colors.HexColor("#DDF7F0")
SKY = colors.HexColor("#E9F5FA")
LINE = colors.HexColor("#C8DCE4")
MUTED = colors.HexColor("#5C7480")
CORAL = colors.HexColor("#EF6A5B")

CONSENT = (
    "Confirmo que el personal me mostró el estado observado del armazón, me explicó "
    "el procedimiento solicitado y los riesgos posibles antes de continuar. Tuve la "
    "oportunidad de hacer preguntas y recibí respuestas. Este registro documenta la "
    "información entregada; no sustituye las validaciones internas ni determina por sí "
    "solo la responsabilidad de las partes."
)


def rounded(c, x, y, w, h, fill, stroke=LINE, radius=4 * mm):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)


def label(c, text, x, y, size=7.5, color=MUTED):
    c.setFillColor(color)
    c.setFont("Helvetica-Bold", size)
    c.drawString(x, y, text.upper())


def field(c, title, x, y, w, h=12 * mm, hint=""):
    rounded(c, x, y, w, h, colors.white)
    label(c, title, x + 4 * mm, y + h - 4.8 * mm)
    if hint:
        c.setFillColor(colors.HexColor("#92A5AE"))
        c.setFont("Helvetica", 8)
        c.drawString(x + 4 * mm, y + 3.2 * mm, hint)


def header(c, page_number):
    c.saveState()
    c.resetTransforms()
    width, height = A4
    c.setFillColor(NAVY)
    c.rect(0, height - 38 * mm, width, 38 * mm, fill=1, stroke=0)
    c.setFillColor(TEAL)
    c.roundRect(15 * mm, height - 27 * mm, 17 * mm, 17 * mm, 5 * mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 15)
    c.drawCentredString(23.5 * mm, height - 21 * mm, "SAC")
    c.setFont("Helvetica-Bold", 19)
    c.drawString(39 * mm, height - 18 * mm, "Recepción segura de armazones")
    c.setFillColor(colors.HexColor("#AEECE1"))
    c.setFont("Helvetica", 8.5)
    c.drawString(39 * mm, height - 25 * mm, "Registro de estado, información y trazabilidad")
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 8)
    c.drawRightString(width - 15 * mm, height - 18 * mm, f"PÁGINA {page_number} DE 2")
    c.setFont("Helvetica", 7)
    c.drawRightString(width - 15 * mm, height - 24 * mm, "VERSIÓN SAC-REC-2026.1")
    c.restoreState()


def section_title(c, text, number, y):
    c.setFillColor(TEAL)
    c.circle(19 * mm, y + 1.5 * mm, 4.5 * mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(19 * mm, y - 1.1 * mm, str(number))
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(27 * mm, y - 2 * mm, text)
    c.setStrokeColor(LINE)
    c.line(27 * mm, y - 5 * mm, A4[0] - 15 * mm, y - 5 * mm)


def footer(c):
    c.saveState()
    c.resetTransforms()
    width, _ = A4
    c.setStrokeColor(LINE)
    c.line(15 * mm, 13 * mm, width - 15 * mm, 13 * mm)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 6.8)
    c.drawString(15 * mm, 8.5 * mm, "Documento interno SAC · Use el número generado por la plataforma como identificador oficial.")
    c.drawRightString(width - 15 * mm, 8.5 * mm, "ÓPTICA LOS ANDES")
    c.restoreState()


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle("SAC - Formato de recepción segura de armazones")
    c.setAuthor("SAC")
    c.setSubject("Plantilla anonimizada para recepción y trazabilidad de armazones")
    width, height = A4
    margin = 15 * mm
    gap = 4 * mm
    content_w = width - 2 * margin

    header(c, 1)
    y = height - 48 * mm
    section_title(c, "Identificación de la recepción", 1, y)
    y -= 23 * mm
    half = (content_w - gap) / 2
    field(c, "Número de recepción", margin, y, half, hint="Se genera al guardar")
    field(c, "Fecha y hora", margin + half + gap, y, half, hint="AAAA-MM-DD · HH:MM")
    y -= 16 * mm
    field(c, "Local", margin, y, half)
    field(c, "OT / arreglo", margin + half + gap, y, half)
    y -= 16 * mm
    field(c, "Colaborador responsable", margin, y, half)
    field(c, "Cargo", margin + half + gap, y, half, hint="Asesor / Optómetra")

    y -= 14 * mm
    section_title(c, "Datos del cliente", 2, y)
    y -= 23 * mm
    field(c, "Nombres y apellidos", margin, y, content_w)
    y -= 16 * mm
    field(c, "Cédula / RUC", margin, y, half)
    field(c, "Teléfono", margin + half + gap, y, half)
    y -= 16 * mm
    field(c, "Correo electrónico", margin, y, content_w)

    y -= 14 * mm
    section_title(c, "Estado del armazón y las lunas", 3, y)
    y -= 23 * mm
    third = (content_w - 2 * gap) / 3
    field(c, "Material", margin, y, third, hint="Metal / acetato / mixto")
    field(c, "Tipo", margin + third + gap, y, third, hint="Completo / ranurado / al aire")
    field(c, "Antigüedad", margin + 2 * (third + gap), y, third)
    y -= 16 * mm
    field(c, "Marca y código", margin, y, half)
    field(c, "Tipo de luna", margin + half + gap, y, half)
    y -= 27 * mm
    field(c, "Condición observada", margin, y, content_w, h=23 * mm, hint="Describa hallazgos concretos y su ubicación")

    y -= 26 * mm
    rounded(c, margin, y, content_w, 25 * mm, SKY)
    label(c, "Criterios estructurados", margin + 4 * mm, y + 18.5 * mm, color=INK)
    checks = ["Fisura", "Reparación previa", "Bisagra floja", "Deformación", "Desgaste", "Sin novedad"]
    x = margin + 4 * mm
    for item in checks:
        c.setStrokeColor(TEAL)
        c.rect(x, y + 8 * mm, 4 * mm, 4 * mm, fill=0, stroke=1)
        c.setFillColor(INK)
        c.setFont("Helvetica", 7.6)
        c.drawString(x + 5.5 * mm, y + 8.4 * mm, item)
        x += 29 * mm
    footer(c)
    c.showPage()
    c.setPageSize(A4)
    c.resetTransforms()

    header(c, 2)
    y = height - 48 * mm
    section_title(c, "Evidencia fotográfica", 4, y)
    y -= 18 * mm
    photo_w = (content_w - 2 * gap) / 3
    photo_h = 50 * mm
    for idx, title in enumerate(["Vista frontal", "Lateral derecha", "Lateral izquierda"]):
        x = margin + idx * (photo_w + gap)
        rounded(c, x, y - photo_h, photo_w, photo_h, colors.HexColor("#F5F9FB"), radius=3 * mm)
        c.setFillColor(LINE)
        c.setFont("Helvetica-Bold", 25)
        c.drawCentredString(x + photo_w / 2, y - 27 * mm, "+")
        label(c, title, x + 4 * mm, y - photo_h + 4 * mm)

    y -= 62 * mm
    section_title(c, "Evaluación y escalamiento", 5, y)
    y -= 20 * mm
    for idx, (name, color) in enumerate([("BAJO", colors.HexColor("#22B887")), ("MEDIO", colors.HexColor("#E7A82B")), ("ALTO", CORAL)]):
        x = margin + idx * (third + gap)
        rounded(c, x, y, third, 14 * mm, colors.white)
        c.setFillColor(color)
        c.circle(x + 6 * mm, y + 7 * mm, 2.5 * mm, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(x + 11 * mm, y + 5.5 * mm, f"RIESGO {name}")
    y -= 19 * mm
    field(c, "Referencia de escalamiento (obligatoria para riesgo alto)", margin, y, content_w, h=15 * mm)

    y -= 23 * mm
    section_title(c, "Confirmación informada", 6, y)
    y -= 36 * mm
    rounded(c, margin, y, content_w, 31 * mm, MINT)
    styles = getSampleStyleSheet()
    style = ParagraphStyle(
        "consent",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=INK,
        alignment=TA_LEFT,
    )
    paragraph = Paragraph(CONSENT, style)
    paragraph.wrapOn(c, content_w - 10 * mm, 24 * mm)
    paragraph.drawOn(c, margin + 5 * mm, y + 5 * mm)

    y -= 17 * mm
    label(c, "Nombre de quien confirma", margin, y + 10 * mm)
    c.setStrokeColor(LINE)
    c.line(margin, y + 4 * mm, margin + 82 * mm, y + 4 * mm)
    label(c, "Firma", margin + 101 * mm, y + 10 * mm)
    c.line(margin + 101 * mm, y + 4 * mm, width - margin, y + 4 * mm)

    y -= 20 * mm
    rounded(c, margin, y, content_w, 20 * mm, SKY)
    label(c, "Resultado de la plataforma", margin + 4 * mm, y + 13.5 * mm, color=INK)
    c.setFont("Helvetica", 8)
    c.setFillColor(MUTED)
    c.drawString(margin + 4 * mm, y + 6 * mm, "Estado: __________________  ·  Guardado: __________________  ·  Código: __________________")
    footer(c)
    c.save()


if __name__ == "__main__":
    build()
    print(OUTPUT)
