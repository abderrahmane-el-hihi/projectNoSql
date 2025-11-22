package com.ghp.gestionhospitale.services;

import com.ghp.gestionhospitale.model.Appointment;
import com.ghp.gestionhospitale.model.AppointmentStatus;
import com.ghp.gestionhospitale.model.Doctor;
import com.ghp.gestionhospitale.model.Patient;
import com.ghp.gestionhospitale.repository.PatientRepository;
import com.ghp.gestionhospitale.repository.AppointmentRepository;
import com.ghp.gestionhospitale.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private NotificationService notificationService;

    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

    public List<String> getAvailableSlots(String doctorId, LocalDate date) {
        Optional<Doctor> doctorOpt = findDoctorByAnyId(doctorId);

        if (doctorOpt.isEmpty()) {
            return new ArrayList<>();
        }

        Doctor doctor = doctorOpt.get();
        String normalizedDoctorId = resolveDoctorKey(doctor);

        if (doctor.getUnavailableDates() != null && doctor.getUnavailableDates().contains(date.toString())) {
            return new ArrayList<>();
        }

        if (doctor.getWorkingDays() == null || doctor.getWorkingDays().isEmpty()) {
            return new ArrayList<>();
        }
        
        String dayOfWeek = date.getDayOfWeek().toString();
        String formattedDay = dayOfWeek.charAt(0) + dayOfWeek.substring(1).toLowerCase();

        if (!doctor.getWorkingDays().contains(formattedDay)) {
            return new ArrayList<>();
        }

        List<Appointment> existingAppointments = appointmentRepository.findByDoctorIdAndDate(normalizedDoctorId, date);
        List<String> bookedSlots = existingAppointments.stream()
                .map(Appointment::getTime)
                .toList();

        return generateAvailableTimeSlots(doctor, bookedSlots);
    }


    private List<String> generateAvailableTimeSlots(Doctor doctor, List<String> bookedSlots) {
        List<String> availableSlots = new ArrayList<>();

        if (doctor.getWorkingHours() == null || doctor.getWorkingHours().getStart() == null 
            || doctor.getWorkingHours().getEnd() == null) {
            return new ArrayList<>();
        }

        LocalTime startTime = LocalTime.parse(doctor.getWorkingHours().getStart());
        LocalTime endTime = LocalTime.parse(doctor.getWorkingHours().getEnd());
        
        LocalTime breakStart = null;
        LocalTime breakEnd = null;
        if (doctor.getBreakTime() != null && doctor.getBreakTime().getStart() != null 
            && doctor.getBreakTime().getEnd() != null) {
            breakStart = LocalTime.parse(doctor.getBreakTime().getStart());
            breakEnd = LocalTime.parse(doctor.getBreakTime().getEnd());
        }

        int appointmentDuration = doctor.getAppointmentDuration();
        if (appointmentDuration <= 0) {
            appointmentDuration = 30;
        }

        LocalTime currentSlot = startTime;

        while (!currentSlot.isAfter(endTime)) {
            LocalTime slotEnd = currentSlot.plusMinutes(appointmentDuration);
            if (slotEnd.isAfter(endTime)) {
                break;
            }

            String slotTime = currentSlot.format(timeFormatter);

            boolean isAvailable = isSlotAvailable(currentSlot, breakStart, breakEnd, bookedSlots, slotTime, appointmentDuration);

            if (isAvailable) {
                availableSlots.add(slotTime);
            }

            currentSlot = currentSlot.plusMinutes(appointmentDuration);
        }

        return availableSlots;
    }

    private boolean isSlotAvailable(LocalTime slot, LocalTime breakStart, LocalTime breakEnd,
                                    List<String> bookedSlots, String slotTime, int appointmentDuration) {
        LocalTime slotEnd = slot.plusMinutes(appointmentDuration);
        
        if (breakStart != null && breakEnd != null) {
            if (slot.isBefore(breakEnd) && slotEnd.isAfter(breakStart)) {
                return false;
            }
        }

        if (bookedSlots.contains(slotTime)) {
            return false;
        }

        return true;
    }

    public Appointment bookAppointment(Appointment appointment) {
        if (appointment.getTime() == null || appointment.getTime().trim().isEmpty()) {
            throw new RuntimeException("Time field cannot be empty");
        }

        Doctor doctor = findDoctorByAnyId(appointment.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found with identifier: " + appointment.getDoctorId()));
        Patient patient = findPatientByAnyId(appointment.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with identifier: " + appointment.getPatientId()));

        String normalizedDoctorId = resolveDoctorKey(doctor);
        String normalizedPatientId = resolvePatientKey(patient);
        appointment.setDoctorId(normalizedDoctorId);
        appointment.setPatientId(normalizedPatientId);

        List<String> availableSlots = getAvailableSlots(
                normalizedDoctorId,
                appointment.getDate()
        );

        System.out.println("🕒 Requested time: '" + appointment.getTime() + "'");
        System.out.println("📋 Available slots: " + availableSlots);

        if (!availableSlots.contains(appointment.getTime())) {
            throw new RuntimeException("Time slot '" + appointment.getTime() + "' is not available. Available slots: " + availableSlots);
        }

        appointment.setAppointmentId(generateAppointmentId());
        appointment.setStatus(AppointmentStatus.PLANIFIE);

        Appointment saved = appointmentRepository.save(appointment);

        notificationService.notifyDoctorNewAppointment(doctor, patient, saved);
        notificationService.notifyPatientNewAppointment(patient, doctor, saved);

        return saved;
    }


    public Appointment updateAppointment(String id, Appointment appointmentDetails) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);

        if (appointmentOpt.isPresent()) {
            Appointment existingAppointment = appointmentOpt.get();

            if (!existingAppointment.getDate().equals(appointmentDetails.getDate()) ||
                    !existingAppointment.getTime().equals(appointmentDetails.getTime())) {

                List<String> availableSlots = getAvailableSlots(
                        existingAppointment.getDoctorId(),
                        appointmentDetails.getDate()
                );

                if (!availableSlots.contains(appointmentDetails.getTime())) {
                    throw new RuntimeException("New time slot is not available");
                }
            }

            existingAppointment.setDate(appointmentDetails.getDate());
            existingAppointment.setTime(appointmentDetails.getTime());
            existingAppointment.setRemarks(appointmentDetails.getRemarks());
            existingAppointment.setStatus(appointmentDetails.getStatus());

            return appointmentRepository.save(existingAppointment);
        }

        return null;
    }

    public boolean isSlotAvailable(String doctorId, LocalDate date, String time) {
        List<String> availableSlots = getAvailableSlots(doctorId, date);
        return availableSlots.contains(time);
    }

    public String getDoctorWorkingHours(String doctorId, LocalDate date) {
        Optional<Doctor> doctorOpt = findDoctorByAnyId(doctorId);

        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            return doctor.getWorkingHours().getStart() + " - " + doctor.getWorkingHours().getEnd();
        }

        return "Not available";
    }

    private String generateAppointmentId() {
        long count = appointmentRepository.count();
        return "A" + (3000 + count + 1);
    }

    public List<Appointment> findAll() {
        return appointmentRepository.findAll();
    }

    public Appointment findById(String id) {
        return appointmentRepository.findById(id).orElse(null);
    }

    public boolean cancelAppointment(String id) {
        Optional<Appointment> appointment = appointmentRepository.findById(id);
        if (appointment.isPresent()) {
            appointment.get().setStatus(AppointmentStatus.ANNULE);
            appointmentRepository.save(appointment.get());
            return true;
        }
        return false;
    }

    public int markPastAppointmentsAsCompleted(LocalDate today) {
        List<Appointment> pastAppointments = appointmentRepository.findAll().stream()
                .filter(apt -> apt.getDate().isBefore(today))
                .filter(apt -> AppointmentStatus.PLANIFIE.equals(apt.getStatus()))
                .toList();

        for (Appointment apt : pastAppointments) {
            apt.setStatus(AppointmentStatus.TERMINE);
            appointmentRepository.save(apt);
        }

        return pastAppointments.size();
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void scheduledMarkPastAppointmentsAsCompleted() {
        LocalDate today = LocalDate.now();
        int count = markPastAppointmentsAsCompleted(today);
        if (count > 0) {
            System.out.println("✓ Marked " + count + " past appointment(s) as TERMINE");
        }
    }

    public List<Appointment> findByDoctorId(String doctorId) {
        String normalizedDoctorId = findDoctorByAnyId(doctorId)
                .map(this::resolveDoctorKey)
                .orElse(doctorId);
        return appointmentRepository.findByDoctorId(normalizedDoctorId);
    }

    public List<Appointment> findByPatientId(String patientId) {
        String normalizedPatientId = findPatientByAnyId(patientId)
                .map(this::resolvePatientKey)
                .orElse(patientId);
        return appointmentRepository.findByPatientId(normalizedPatientId);
    }

    public List<Appointment> findPatientHistory(String patientId) {
        String normalizedPatientId = findPatientByAnyId(patientId)
                .map(this::resolvePatientKey)
                .orElse(patientId);
        return appointmentRepository.findByPatientId(normalizedPatientId).stream()
                .sorted(Comparator.comparing(Appointment::getDate)
                        .thenComparing(Appointment::getTime)
                        .reversed())
                .toList();
    }

    public Map<String, Object> getDoctorDashboard(String doctorId) {
        Doctor doctor = findDoctorByAnyId(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with identifier: " + doctorId));
        String normalizedDoctorId = resolveDoctorKey(doctor);

        List<Appointment> all = appointmentRepository.findByDoctorId(normalizedDoctorId);
        LocalDate today = LocalDate.now();

        List<Appointment> todays = all.stream()
                .filter(a -> today.equals(a.getDate()))
                .sorted(Comparator.comparing(Appointment::getTime))
                .toList();

        long upcoming = all.stream()
                .filter(a -> !a.getDate().isBefore(today))
                .filter(a -> AppointmentStatus.PLANIFIE.equals(a.getStatus()))
                .count();

        long completed = all.stream()
                .filter(a -> AppointmentStatus.TERMINE.equals(a.getStatus()))
                .count();

        long cancelled = all.stream()
                .filter(a -> AppointmentStatus.ANNULE.equals(a.getStatus()))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("todayCount", todays.size());
        stats.put("upcoming", upcoming);
        stats.put("completed", completed);
        stats.put("cancelled", cancelled);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("doctorId", normalizedDoctorId);
        dashboard.put("todayAppointments", todays);
        dashboard.put("stats", stats);

        return dashboard;
    }

    public List<Appointment> findByDate(LocalDate date) {
        return appointmentRepository.findByDate(date);
    }

    private Optional<Doctor> findDoctorByAnyId(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }
        Optional<Doctor> doctorOpt = doctorRepository.findByDoctorId(identifier);
        if (doctorOpt.isPresent()) {
            return doctorOpt;
        }
        return doctorRepository.findById(identifier);
    }

    private Optional<Patient> findPatientByAnyId(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }
        Optional<Patient> patientOpt = patientRepository.findByPatientId(identifier);
        if (patientOpt.isPresent()) {
            return patientOpt;
        }
        patientOpt = patientRepository.findByIdentifier(identifier);
        if (patientOpt.isPresent()) {
            return patientOpt;
        }
        return patientRepository.findById(identifier);
    }

    private String resolveDoctorKey(Doctor doctor) {
        return doctor.getDoctorId() != null ? doctor.getDoctorId() : doctor.getId();
    }

    private String resolvePatientKey(Patient patient) {
        return patient.getPatientId() != null ? patient.getPatientId() : patient.getId();
    }
}
