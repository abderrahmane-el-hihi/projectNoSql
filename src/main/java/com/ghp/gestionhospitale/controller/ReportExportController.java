package com.ghp.gestionhospitale.controller;

import com.ghp.gestionhospitale.dto.AppointmentReport;
import com.ghp.gestionhospitale.services.ReportService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports/export")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://web-frontend"})
public class ReportExportController {

    private final ReportService reportService;

    public ReportExportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam("doctorFrom") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate doctorFrom,
            @RequestParam("doctorTo") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate doctorTo,
            @RequestParam("specialtyFrom") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate specialtyFrom,
            @RequestParam("specialtyTo") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate specialtyTo,
            @RequestParam("frequentFrom") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate frequentFrom,
            @RequestParam("frequentMin") int frequentMin) throws IOException {

        ReportData reportData = loadReportData(date, doctorFrom, doctorTo, specialtyFrom, specialtyTo, frequentFrom, frequentMin);
        byte[] bytes = buildPdf(reportData);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=rapport.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(bytes);
    }

    @GetMapping("/docx")
    public ResponseEntity<byte[]> exportDocx(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam("doctorFrom") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate doctorFrom,
            @RequestParam("doctorTo") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate doctorTo,
            @RequestParam("specialtyFrom") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate specialtyFrom,
            @RequestParam("specialtyTo") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate specialtyTo,
            @RequestParam("frequentFrom") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate frequentFrom,
            @RequestParam("frequentMin") int frequentMin) throws IOException {

        ReportData reportData = loadReportData(date, doctorFrom, doctorTo, specialtyFrom, specialtyTo, frequentFrom, frequentMin);
        byte[] bytes = buildDocx(reportData);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=rapport.docx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(bytes);
    }

    private ReportData loadReportData(LocalDate date,
                                      LocalDate doctorFrom,
                                      LocalDate doctorTo,
                                      LocalDate specialtyFrom,
                                      LocalDate specialtyTo,
                                      LocalDate frequentFrom,
                                      int frequentMin) {
        ReportData data = new ReportData();
        data.date = date;
        data.appointmentsByDate = reportService.getAppointmentsByDate(date);
        data.appointmentsPerDoctor = reportService.getAppointmentsPerDoctor(doctorFrom, doctorTo);
        data.appointmentsPerSpecialty = reportService.getAppointmentsPerSpecialty(specialtyFrom, specialtyTo);
        data.frequentPatients = reportService.getFrequentPatients(frequentFrom, frequentMin);
        data.doctorFrom = doctorFrom;
        data.doctorTo = doctorTo;
        data.specialtyFrom = specialtyFrom;
        data.specialtyTo = specialtyTo;
        data.frequentFrom = frequentFrom;
        data.frequentMin = frequentMin;
        return data;
    }

    private byte[] buildPdf(ReportData data) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PdfWriter writer = new PdfWriter(document);
            writer.writeTitle("Rapport d'activité");
            writer.writeLine("Date de génération : " + DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").format(java.time.LocalDateTime.now()));
            writer.blank();

            writer.writeSection("Rendez-vous du " + formatDate(data.date));
            if (data.appointmentsByDate.isEmpty()) {
                writer.writeLine("Aucun rendez-vous.");
            } else {
                for (AppointmentReport report : data.appointmentsByDate) {
                    writer.writeLine(String.format("- %s avec %s à %s (%s)",
                            report.getDoctorName(),
                            report.getPatientName(),
                            report.getTime(),
                            report.getStatus()));
                }
            }

            writer.blank();
            writer.writeSection(String.format("Rendez-vous par médecin (%s -> %s)",
                    formatDate(data.doctorFrom), formatDate(data.doctorTo)));
            if (data.appointmentsPerDoctor.isEmpty()) {
                writer.writeLine("Aucune donnée.");
            } else {
                for (Map<String, Object> row : data.appointmentsPerDoctor) {
                    writer.writeLine(String.format("- %s : %s rendez-vous",
                            row.getOrDefault("doctorName", "N/A"),
                            row.getOrDefault("count", 0)));
                }
            }

            writer.blank();
            writer.writeSection(String.format("Rendez-vous par spécialité (%s -> %s)",
                    formatDate(data.specialtyFrom), formatDate(data.specialtyTo)));
            if (data.appointmentsPerSpecialty.isEmpty()) {
                writer.writeLine("Aucune donnée.");
            } else {
                for (Map<String, Object> row : data.appointmentsPerSpecialty) {
                    writer.writeLine(String.format("- %s : %s rendez-vous",
                            row.getOrDefault("specialty", "N/A"),
                            row.getOrDefault("count", 0)));
                }
            }

            writer.blank();
            writer.writeSection(String.format("Patients fréquents (depuis %s, min %d rendez-vous)",
                    formatDate(data.frequentFrom), data.frequentMin));
            if (data.frequentPatients.isEmpty()) {
                writer.writeLine("Aucun patient fréquent.");
            } else {
                for (Map<String, Object> row : data.frequentPatients) {
                    writer.writeLine(String.format("- %s : %s rendez-vous",
                            row.getOrDefault("patientName", "N/A"),
                            row.getOrDefault("count", 0)));
                }
            }

            return writer.toByteArray();
        }
    }

    private byte[] buildDocx(ReportData data) throws IOException {
        try (XWPFDocument document = new XWPFDocument()) {
            addTitle(document, "Rapport d'activité");
            addParagraph(document, "Date de génération : " + DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").format(java.time.LocalDateTime.now()), false);
            document.createParagraph();

            addParagraph(document, "Rendez-vous du " + formatDate(data.date), true);
            if (data.appointmentsByDate.isEmpty()) {
                addParagraph(document, "Aucun rendez-vous.", false);
            } else {
                data.appointmentsByDate.forEach(report ->
                        addParagraph(document,
                                String.format("- %s avec %s à %s (%s)",
                                        report.getDoctorName(),
                                        report.getPatientName(),
                                        report.getTime(),
                                        report.getStatus()),
                                false));
            }

            document.createParagraph();
            addParagraph(document, String.format("Rendez-vous par médecin (%s -> %s)",
                    formatDate(data.doctorFrom), formatDate(data.doctorTo)), true);
            if (data.appointmentsPerDoctor.isEmpty()) {
                addParagraph(document, "Aucune donnée.", false);
            } else {
                data.appointmentsPerDoctor.forEach(row ->
                        addParagraph(document,
                                String.format("- %s : %s rendez-vous",
                                        row.getOrDefault("doctorName", "N/A"),
                                        row.getOrDefault("count", 0)),
                                false));
            }

            document.createParagraph();
            addParagraph(document, String.format("Rendez-vous par spécialité (%s -> %s)",
                    formatDate(data.specialtyFrom), formatDate(data.specialtyTo)), true);
            if (data.appointmentsPerSpecialty.isEmpty()) {
                addParagraph(document, "Aucune donnée.", false);
            } else {
                data.appointmentsPerSpecialty.forEach(row ->
                        addParagraph(document,
                                String.format("- %s : %s rendez-vous",
                                        row.getOrDefault("specialty", "N/A"),
                                        row.getOrDefault("count", 0)),
                                false));
            }

            document.createParagraph();
            addParagraph(document, String.format("Patients fréquents (depuis %s, min %d rendez-vous)",
                    formatDate(data.frequentFrom), data.frequentMin), true);
            if (data.frequentPatients.isEmpty()) {
                addParagraph(document, "Aucun patient fréquent.", false);
            } else {
                data.frequentPatients.forEach(row ->
                        addParagraph(document,
                                String.format("- %s : %s rendez-vous",
                                        row.getOrDefault("patientName", "N/A"),
                                        row.getOrDefault("count", 0)),
                                false));
            }

            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                document.write(out);
                return out.toByteArray();
            }
        }
    }

    private void addTitle(XWPFDocument document, String text) {
        XWPFParagraph paragraph = document.createParagraph();
        paragraph.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun run = paragraph.createRun();
        run.setText(text);
        run.setBold(true);
        run.setFontSize(18);
    }

    private void addParagraph(XWPFDocument document, String text, boolean bold) {
        XWPFParagraph paragraph = document.createParagraph();
        XWPFRun run = paragraph.createRun();
        run.setText(text);
        run.setBold(bold);
        run.setFontSize(bold ? 14 : 12);
    }

    private String formatDate(LocalDate date) {
        return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    private static class ReportData {
        LocalDate date;
        LocalDate doctorFrom;
        LocalDate doctorTo;
        LocalDate specialtyFrom;
        LocalDate specialtyTo;
        LocalDate frequentFrom;
        int frequentMin;
        List<AppointmentReport> appointmentsByDate;
        List<Map<String, Object>> appointmentsPerDoctor;
        List<Map<String, Object>> appointmentsPerSpecialty;
        List<Map<String, Object>> frequentPatients;
    }

    private static class PdfWriter {
        private final PDDocument document;
        private PDPageContentStream stream;
        private float y;

        PdfWriter(PDDocument document) throws IOException {
            this.document = document;
            addPage();
        }

        void writeTitle(String text) throws IOException {
            writeLine(text, true, 18);
        }

        void writeSection(String text) throws IOException {
            writeLine(text, true, 14);
        }

        void writeLine(String text) throws IOException {
            writeLine(text, false, 12);
        }

        void blank() throws IOException {
            ensureSpace();
            stream.newLine();
            stream.newLine();
            y -= 24;
        }

        private void writeLine(String text, boolean bold, int fontSize) throws IOException {
            ensureSpace();
            stream.setFont(new PDType1Font(bold ? Standard14Fonts.FontName.HELVETICA_BOLD : Standard14Fonts.FontName.HELVETICA), fontSize);
            stream.showText(text);
            stream.newLine();
            y -= fontSize + 4;
        }

        private void ensureSpace() throws IOException {
            if (y < 80) {
                stream.endText();
                stream.close();
                addPage();
            }
        }

        private void addPage() throws IOException {
            PDPage page = new PDPage();
            document.addPage(page);
            stream = new PDPageContentStream(document, page);
            stream.beginText();
            stream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
            stream.setLeading(16);
            stream.newLineAtOffset(50, 750);
            y = 750;
        }

        byte[] toByteArray() throws IOException {
            stream.endText();
            stream.close();
            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                document.save(out);
                return out.toByteArray();
            }
        }
    }
}
