import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from typing import Dict, Any

def generate_itinerary_pdf(itinerary_data: Dict[str, Any], trip_info: Dict[str, Any] = None) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Brand Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0f766e'), # teal-700
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#334155'),
        spaceAfter=14
    )
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0f172a'), # navy-900
        spaceBefore=12,
        spaceAfter=6
    )
    day_header_style = ParagraphStyle(
        'DayHeader',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0d9488'),
        spaceBefore=8,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1e293b')
    )
    bold_body_style = ParagraphStyle(
        'BoldBody',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0f172a')
    )

    elements = []

    dest = itinerary_data.get("destination", "Personalized Journey")
    days_count = itinerary_data.get("total_days", 1)
    currency = itinerary_data.get("currency", "USD")
    total_budget = itinerary_data.get("total_estimated_budget", 0)

    # Document Header
    elements.append(Paragraph(f"✈️ RoamAI Travel Itinerary: {dest}", title_style))
    elements.append(Paragraph(
        f"<b>Duration:</b> {days_count} Days &nbsp;|&nbsp; <b>Total Est. Budget:</b> {currency} {total_budget:,.2f} &nbsp;|&nbsp; <b>Generated with RoamAI Engine</b>",
        subtitle_style
    ))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#14b8a6'), spaceBefore=0, spaceAfter=12))

    # Overview
    overview = itinerary_data.get("destination_overview", "")
    if overview:
        elements.append(Paragraph("<b>Destination Overview:</b>", bold_body_style))
        elements.append(Paragraph(overview, body_style))
        elements.append(Spacer(1, 10))

    # Day-wise plans
    days = itinerary_data.get("days", [])
    for day in days:
        d_num = day.get("day_number", 1)
        d_title = day.get("title", f"Day {d_num}")
        d_theme = day.get("theme", "")
        
        elements.append(Paragraph(f"<b>DAY {d_num}: {d_title.upper()}</b>", day_header_style))
        if d_theme:
            elements.append(Paragraph(f"<i>Theme: {d_theme}</i>", body_style))
        
        # Activities Table
        activities = day.get("activities", [])
        if activities:
            table_data = [[
                Paragraph("<b>Time / Slot</b>", bold_body_style),
                Paragraph("<b>Activity & Sights</b>", bold_body_style),
                Paragraph("<b>Location</b>", bold_body_style),
                Paragraph("<b>Est. Cost</b>", bold_body_style)
            ]]
            for act in activities:
                slot = f"{act.get('time_slot', '')} ({act.get('period', '').capitalize()})"
                details = f"<b>{act.get('title', '')}</b><br/>{act.get('description', '')}"
                if act.get("transportation_tip"):
                    details += f"<br/><i>Transport: {act.get('transportation_tip')}</i>"
                loc = act.get("location", "")
                cost = act.get("cost_label", f"{currency} {act.get('estimated_cost', 0):.2f}")
                table_data.append([
                    Paragraph(slot, body_style),
                    Paragraph(details, body_style),
                    Paragraph(loc, body_style),
                    Paragraph(cost, body_style)
                ])

            t = Table(table_data, colWidths=[110, 240, 110, 80])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f0fdfa')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0f766e')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ]))
            elements.append(t)
            elements.append(Spacer(1, 8))

        # Dining & Tip
        dining = day.get("dining", [])
        if dining:
            dine_text = "<b>Recommended Dining:</b> " + " | ".join(
                [f"<b>{m.get('meal_type')}:</b> {m.get('name')} ({m.get('cuisine')} - {m.get('estimated_cost')})" for m in dining]
            )
            elements.append(Paragraph(dine_text, body_style))
        
        tip = day.get("daily_tip")
        if tip:
            elements.append(Paragraph(f"<b>Local Tip:</b> {tip}", body_style))

        elements.append(Spacer(1, 14))

    # Accommodations & Transport tips
    acc = itinerary_data.get("accommodations", [])
    if acc:
        elements.append(Paragraph("Recommended Accommodations", section_title))
        for item in acc:
            elements.append(Paragraph(
                f"• <b>{item.get('name')}</b> ({item.get('area')}) - {item.get('price_range_per_night')} — <i>{item.get('reason')}</i>",
                body_style
            ))
        elements.append(Spacer(1, 8))

    # Disclaimer
    disclaimer = itinerary_data.get("disclaimer", "Costs and schedules are realistic estimates.")
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceBefore=8, spaceAfter=6))
    elements.append(Paragraph(f"<i>Disclaimer: {disclaimer}</i>", body_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
