package com.lgq.budget.service;

import com.lgq.budget.dto.BudgetResponse;
import com.lgq.budget.dto.CategoryTotal;
import com.lgq.budget.repository.BudgetRepository;
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
public class BudgetPdfService {
  private static final Locale LOCALE_ES = new Locale("es", "ES");
  private static final String LOGO_PATH = "assets/lgq-logo.png";
  private static final String COMPANY_NAME = "LGQ Interiorismo";
  private static final String COMPANY_ADDRESS = "Av. President Francesc Macià 7";
  private static final String COMPANY_CITY = "43005 Tarragona";
  private static final String COMPANY_EMAIL = "info@lgqinteriorismo.com";
  private static final String COMPANY_PHONE = "+34 877 22 11 60";

  private final BudgetService budgetService;
  private final BudgetRepository budgetRepository;

  public BudgetPdfService(BudgetService budgetService, BudgetRepository budgetRepository) {
    this.budgetService = budgetService;
    this.budgetRepository = budgetRepository;
  }

  public byte[] generateBudgetPdf(long projectId, long userId) {
    BudgetResponse budget = budgetService.calculateBudget(projectId, userId);
    String projectName = budgetRepository.findProjectName(projectId);
    return renderPdf(budget, projectName);
  }

  private byte[] renderPdf(BudgetResponse budget, String projectName) {
    Document document = new Document(PageSize.A4, 36, 36, 40, 36);
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    try {
      PdfWriter.getInstance(document, output);
      document.open();

      addHeader(document);
      addTitle(document, projectName, budget.projectId());
      addTotals(document, budget);
      addCategoryBreakdown(document, budget.categories());

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

  private void addTitle(Document document, String projectName, long projectId) throws Exception {
    Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
    Font bodyFont = new Font(Font.HELVETICA, 11);

    Paragraph title = new Paragraph("Presupuesto", titleFont);
    title.setSpacingAfter(6);
    document.add(title);

    if (projectName == null || projectName.isBlank()) {
      projectName = "Proyecto " + projectId;
    }
    Paragraph meta = new Paragraph(
      String.format("Proyecto: %s\nFecha: %s", projectName, LocalDate.now()),
      bodyFont
    );
    meta.setSpacingAfter(12);
    document.add(meta);
  }

  private void addTotals(Document document, BudgetResponse budget) throws Exception {
    Font labelFont = new Font(Font.HELVETICA, 11, Font.BOLD);
    Font valueFont = new Font(Font.HELVETICA, 11);

    PdfPTable table = new PdfPTable(2);
    table.setWidthPercentage(100);
    table.setWidths(new float[] { 2f, 1f });

    addRow(table, "Materiales", formatCurrency(budget.materials()), labelFont, valueFont);
    addRow(table, "Equipamiento", formatCurrency(budget.equipment()), labelFont, valueFont);
    addRow(table, "Mano de obra", formatCurrency(budget.labor()), labelFont, valueFont);
    addRow(table, "Extras", formatCurrency(budget.extras()), labelFont, valueFont);
    addRow(table, "Base", formatCurrency(budget.base()), labelFont, valueFont);
    addRow(
      table,
      "Margen",
      formatPercentage(budget.marginPercentage()),
      labelFont,
      valueFont
    );
    addRow(
      table,
      "Contingencia",
      formatPercentage(budget.contingencyPercentage()),
      labelFont,
      valueFont
    );
    addRow(table, "Total estimado", formatCurrency(budget.total()), labelFont, valueFont);

    table.setSpacingAfter(14);
    document.add(table);
  }

  private void addCategoryBreakdown(Document document, List<CategoryTotal> categories) throws Exception {
    if (categories == null || categories.isEmpty()) {
      return;
    }

    Font titleFont = new Font(Font.HELVETICA, 12, Font.BOLD);
    document.add(new Paragraph("Desglose por capítulo", titleFont));

    PdfPTable table = new PdfPTable(2);
    table.setWidthPercentage(100);
    table.setWidths(new float[] { 2f, 1f });
    table.setSpacingBefore(8);

    Font labelFont = new Font(Font.HELVETICA, 10);
    Font valueFont = new Font(Font.HELVETICA, 10);

    for (CategoryTotal category : categories) {
      if (category == null) {
        continue;
      }
      addRow(table, category.category(), formatCurrency(category.total()), labelFont, valueFont);
    }

    document.add(table);
  }

  private void addRow(
    PdfPTable table,
    String label,
    String value,
    Font labelFont,
    Font valueFont
  ) {
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

  private String formatCurrency(BigDecimal value) {
    NumberFormat format = NumberFormat.getCurrencyInstance(LOCALE_ES);
    return format.format(value == null ? BigDecimal.ZERO : value);
  }

  private String formatPercentage(BigDecimal value) {
    if (value == null) {
      value = BigDecimal.ZERO;
    }
    return value.stripTrailingZeros().toPlainString() + "%";
  }
}
