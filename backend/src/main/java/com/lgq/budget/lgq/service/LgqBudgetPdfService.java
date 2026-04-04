package com.lgq.budget.lgq.service;

import com.lgq.budget.lgq.dto.LgqBudgetResponse;
import com.lgq.budget.lgq.dto.LgqCatalogLine;
import com.lgq.budget.lgq.dto.LgqLaborLine;
import com.lgq.budget.lgq.dto.LgqTaskLine;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
public class LgqBudgetPdfService {
  private static final Locale LOCALE_ES = new Locale("es", "ES");
  private static final String LOGO_PATH = "assets/lgq-logo.png";
  private static final String COMPANY_NAME = "LGQ Interiorismo";
  private static final String COMPANY_ADDRESS = "Av. President Francesc Macià 7";
  private static final String COMPANY_CITY = "43005 Tarragona";
  private static final String COMPANY_EMAIL = "info@lgqinteriorismo.com";
  private static final String COMPANY_PHONE = "+34 877 22 11 60";

  private final LgqEngineService engineService;

  public LgqBudgetPdfService(LgqEngineService engineService) {
    this.engineService = engineService;
  }

  public byte[] generateBudgetPdf(long projectId, long userId, boolean isAdmin) {
    LgqBudgetResponse budget = engineService.calculate(projectId, userId, isAdmin);
    return renderPdf(budget, projectId);
  }

  private byte[] renderPdf(LgqBudgetResponse budget, long projectId) {
    Document document = new Document(PageSize.A4, 36, 36, 40, 36);
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    try {
      PdfWriter.getInstance(document, output);
      document.open();

      addHeader(document);
      addTitle(document, projectId);
      addCatalogSection(document, budget.catalog());
      addTaskSection(document, budget.tasks());
      addLaborSection(document, budget.labor());
      addTotals(document, budget);

      document.close();
      return output.toByteArray();
    } catch (Exception ex) {
      document.close();
      throw new IllegalStateException("Failed to generate budget PDF", ex);
    }
  }

  private void addHeader(Document document) throws Exception {
    PdfPTable header = new PdfPTable(2);
    header.setWidthPercentage(100);
    header.setWidths(new float[] { 1.2f, 2.2f });

    PdfPCell logoCell = new PdfPCell(loadLogo(), false);
    logoCell.setBorder(Rectangle.NO_BORDER);
    logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
    header.addCell(logoCell);

    Font headerFont = new Font(Font.HELVETICA, 12, Font.BOLD);
    Font bodyFont = new Font(Font.HELVETICA, 10);
    Paragraph info = new Paragraph();
    info.add(new Phrase(COMPANY_NAME + "\n", headerFont));
    info.add(new Phrase(COMPANY_ADDRESS + "\n", bodyFont));
    info.add(new Phrase(COMPANY_CITY + "\n", bodyFont));
    info.add(new Phrase("Email: " + COMPANY_EMAIL + "\n", bodyFont));
    info.add(new Phrase(COMPANY_PHONE, bodyFont));

    PdfPCell infoCell = new PdfPCell(info);
    infoCell.setBorder(Rectangle.NO_BORDER);
    infoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
    infoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
    header.addCell(infoCell);

    document.add(header);
    document.add(new Paragraph(" "));
  }

  private Image loadLogo() throws Exception {
    ClassPathResource logoResource = new ClassPathResource(LOGO_PATH);
    Image logo = Image.getInstance(logoResource.getURL());
    logo.scaleToFit(120, 60);
    logo.setAlignment(Image.LEFT);
    return logo;
  }

  private void addTitle(Document document, long projectId) throws Exception {
    Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
    Font bodyFont = new Font(Font.HELVETICA, 11);

    Paragraph title = new Paragraph("Presupuesto", titleFont);
    title.setSpacingAfter(6);
    document.add(title);

    Paragraph meta = new Paragraph(
      String.format("Proyecto: %s\nFecha: %s", projectId, LocalDate.now()),
      bodyFont
    );
    meta.setSpacingAfter(12);
    document.add(meta);
  }

  private void addCatalogSection(Document document, List<LgqCatalogLine> lines) throws Exception {
    if (lines == null || lines.isEmpty()) {
      return;
    }
    Font titleFont = new Font(Font.HELVETICA, 12, Font.BOLD);
    document.add(new Paragraph("Catálogo", titleFont));

    PdfPTable table = createLineTable();
    for (LgqCatalogLine line : lines) {
      addLineRow(table, line.itemName(), line.quantity(), line.unitPrice(), line.amount());
    }
    table.setSpacingAfter(12);
    document.add(table);
  }

  private void addLaborSection(Document document, List<LgqLaborLine> lines) throws Exception {
    if (lines == null || lines.isEmpty()) {
      return;
    }
    Font titleFont = new Font(Font.HELVETICA, 12, Font.BOLD);
    document.add(new Paragraph("Mano de obra", titleFont));

    PdfPTable table = createLineTable();
    for (LgqLaborLine line : lines) {
      addLineRow(table, capitalize(line.role()), line.hours(), line.hourlyRate(), line.amount());
    }
    table.setSpacingAfter(12);
    document.add(table);
  }

  private void addTaskSection(Document document, List<LgqTaskLine> lines) throws Exception {
    if (lines == null || lines.isEmpty()) {
      return;
    }
    Font titleFont = new Font(Font.HELVETICA, 12, Font.BOLD);
    document.add(new Paragraph("Partidas", titleFont));

    PdfPTable table = createLineTable();
    for (LgqTaskLine line : lines) {
      String label = line.taskName() + " (" + capitalize(line.role()) + ")";
      addLineRow(table, label, line.hours(), line.hourlyRate(), line.amount());
    }
    table.setSpacingAfter(12);
    document.add(table);
  }

  private void addTotals(Document document, LgqBudgetResponse budget) throws Exception {
    Font labelFont = new Font(Font.HELVETICA, 11, Font.BOLD);
    Font valueFont = new Font(Font.HELVETICA, 11);

    PdfPTable table = new PdfPTable(2);
    table.setWidthPercentage(100);
    table.setWidths(new float[] { 2f, 1f });

    addRow(table, "Subtotal", formatCurrency(budget.subtotal()), labelFont, valueFont);
    addRow(
      table,
      "IVA (" + budget.ivaRate().stripTrailingZeros().toPlainString() + "%)",
      formatCurrency(budget.ivaAmount()),
      labelFont,
      valueFont
    );
    addRow(table, "Total", formatCurrency(budget.total()), labelFont, valueFont);

    table.setSpacingAfter(14);
    document.add(table);
  }

  private PdfPTable createLineTable() throws Exception {
    PdfPTable table = new PdfPTable(4);
    table.setWidthPercentage(100);
    table.setWidths(new float[] { 2.2f, 0.9f, 0.9f, 0.9f });

    Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD);
    addCell(table, "Concepto", headerFont, Element.ALIGN_LEFT);
    addCell(table, "Cantidad", headerFont, Element.ALIGN_RIGHT);
    addCell(table, "Precio", headerFont, Element.ALIGN_RIGHT);
    addCell(table, "Importe", headerFont, Element.ALIGN_RIGHT);
    return table;
  }

  private void addLineRow(PdfPTable table, String label, BigDecimal qty, BigDecimal price, BigDecimal amount) {
    Font textFont = new Font(Font.HELVETICA, 10);
    addCell(table, label, textFont, Element.ALIGN_LEFT);
    addCell(table, formatNumber(qty), textFont, Element.ALIGN_RIGHT);
    addCell(table, formatCurrency(price), textFont, Element.ALIGN_RIGHT);
    addCell(table, formatCurrency(amount), textFont, Element.ALIGN_RIGHT);
  }

  private void addRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
    PdfPCell left = new PdfPCell(new Phrase(label, labelFont));
    left.setBorder(Rectangle.NO_BORDER);
    left.setPadding(6);
    PdfPCell right = new PdfPCell(new Phrase(value, valueFont));
    right.setBorder(Rectangle.NO_BORDER);
    right.setHorizontalAlignment(Element.ALIGN_RIGHT);
    right.setPadding(6);
    table.addCell(left);
    table.addCell(right);
  }

  private void addCell(PdfPTable table, String text, Font font, int alignment) {
    PdfPCell cell = new PdfPCell(new Phrase(text, font));
    cell.setHorizontalAlignment(alignment);
    cell.setBorder(Rectangle.NO_BORDER);
    cell.setPadding(6);
    table.addCell(cell);
  }

  private String formatCurrency(BigDecimal value) {
    if (value == null) {
      return "0,00 €";
    }
    NumberFormat format = NumberFormat.getCurrencyInstance(LOCALE_ES);
    return format.format(value);
  }

  private String formatNumber(BigDecimal value) {
    if (value == null) {
      return "0";
    }
    NumberFormat format = NumberFormat.getNumberInstance(LOCALE_ES);
    format.setMaximumFractionDigits(2);
    return format.format(value);
  }

  private String capitalize(String text) {
    if (text == null || text.isBlank()) {
      return "";
    }
    return text.substring(0, 1).toUpperCase(LOCALE_ES) + text.substring(1);
  }
}
