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
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

    // CORE AVAILABILITY CHECKING METHOD
    public List<String> getAvailableSlots(String doctorId, LocalDate date) {
        Optional<Doctor> doctorOpt = doctorRepository.findByDoctorId(doctorId); // Fixed

        if (doctorOpt.isEmpty()) {
            return new ArrayList<>(); // Doctor not found
        }

        Doctor doctor = doctorOpt.get();

        // 1. Check if date is in unavailable dates
        if (doctor.getUnavailableDates() != null && doctor.getUnavailableDates().contains(date.toString())) {
            return new ArrayList<>(); // Doctor is unavailable on this date
        }

        // 2. Check if date is a working day
        if (doctor.getWorkingDays() == null || doctor.getWorkingDays().isEmpty()) {
            return new ArrayList<>(); // No working days defined
        }
        
        String dayOfWeek = date.getDayOfWeek().toString();
        String formattedDay = dayOfWeek.charAt(0) + dayOfWeek.substring(1).toLowerCase();

        if (!doctor.getWorkingDays().contains(formattedDay)) {
            return new ArrayList<>(); // Doctor doesn't work on this day
        }

        // 3. Get existing appointments for this doctor on this date
        List<Appointment> existingAppointments = appointmentRepository.findByDoctorIdAndDate(doctorId, date);
        List<String> bookedSlots = existingAppointments.stream()
                .map(Appointment::getTime)
                .toList();

        // 4. Generate available time slots
        return generateAvailableTimeSlots(doctor, bookedSlots);
    }


    // TIME SLOT GENERATION LOGIC
    private List<String> generateAvailableTimeSlots(Doctor doctor, List<String> bookedSlots) {
        List<String> availableSlots = new ArrayList<>();

        // Check for null working hours and break time
        if (doctor.getWorkingHours() == null || doctor.getWorkingHours().getStart() == null 
            || doctor.getWorkingHours().getEnd() == null) {
            return new ArrayList<>(); // No working hours defined
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

        // Use default duration of 30 minutes if not set or is 0
        int appointmentDuration = doctor.getAppointmentDuration();
        if (appointmentDuration <= 0) {
            appointmentDuration = 30; // Default 30 minutes
        }

        LocalTime currentSlot = startTime;

        // Generate slots: continue while the slot end time is before or equal to endTime
        while (!currentSlot.isAfter(endTime)) {
            // Check if slot end time exceeds working hours
            LocalTime slotEnd = currentSlot.plusMinutes(appointmentDuration);
            if (slotEnd.isAfter(endTime)) {
                break; // Slot would exceed working hours
            }

            String slotTime = currentSlot.format(timeFormatter);

            // Check if slot is available
            boolean isAvailable = isSlotAvailable(currentSlot, breakStart, breakEnd, bookedSlots, slotTime, appointmentDuration);

            if (isAvailable) {
                availableSlots.add(slotTime);
            }

            currentSlot = currentSlot.plusMinutes(appointmentDuration);
        }

        return availableSlots;
    }

    //  CHECK IF A SPECIFIC SLOT IS AVAILABLE
    private boolean isSlotAvailable(LocalTime slot, LocalTime breakStart, LocalTime breakEnd,
                                    List<String> bookedSlots, String slotTime, int appointmentDuration) {
        LocalTime slotEnd = slot.plusMinutes(appointmentDuration);
        
        // 1. Check if slot overlaps with break time (if break time is defined)
        // Two time ranges overlap if: slotStart < breakEnd AND slotEnd > breakStart
        if (breakStart != null && breakEnd != null) {
            if (slot.isBefore(breakEnd) && slotEnd.isAfter(breakStart)) {
                return false; // Slot overlaps with break time
            }
        }

        // 2. Check if slot is already booked
        if (bookedSlots.contains(slotTime)) {
            return false;
        }

        return true;
    }

    // BOOK APPOINTMENT WITH AVAILABILITY VALIDATION
    public Appointment bookAppointment(Appointment appointment) {
        // Validate time field
        if (appointment.getTime() == null || appointment.getTime().trim().isEmpty()) {
            throw new RuntimeException("Time field cannot be empty");
        }

        // Validate availability before booking
        List<String> availableSlots = getAvailableSlots(
                appointment.getDoctorId(),
                appointment.getDate()
        );

        System.out.println("🕒 Requested time: '" + appointment.getTime() + "'");
        System.out.println("📋 Available slots: " + availableSlots);

        if (!availableSlots.contains(appointment.getTime())) {
            throw new RuntimeException("Time slot '" + appointment.getTime() + "' is not available. Available slots: " + availableSlots);
        }

        // Generate appointment ID
        appointment.setAppointmentId(generateAppointmentId());
        appointment.setStatus(AppointmentStatus.PLANIFIE);

        return appointmentRepository.save(appointment);
    }


    // UPDATE APPOINTMENT WITH VALIDATION
    public Appointment updateAppointment(String id, Appointment appointmentDetails) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);

        if (appointmentOpt.isPresent()) {
            Appointment existingAppointment = appointmentOpt.get();

            // If changing time or date, validate availability
            if (!existingAppointment.getDate().equals(appointmentDetails.getDate()) ||
                    !existingAppointment.getTime().equals(appointmentDetails.getTime())) {

                List<String> availableSlots = getAvailableSlots(
                        appointmentDetails.getDoctorId(),
                        appointmentDetails.getDate()
                );

                if (!availableSlots.contains(appointmentDetails.getTime())) {
                    throw new RuntimeException("New time slot is not available");
                }
            }

            // Update fields
            existingAppointment.setDate(appointmentDetails.getDate());
            existingAppointment.setTime(appointmentDetails.getTime());
            existingAppointment.setRemarks(appointmentDetails.getRemarks());
            existingAppointment.setStatus(appointmentDetails.getStatus());

            return appointmentRepository.save(existingAppointment);
        }

        return null;
    }

    // ADDITIONAL AVAILABILITY METHODS

    // Check if a specific slot is available
    public boolean isSlotAvailable(String doctorId, LocalDate date, String time) {
        List<String> availableSlots = getAvailableSlots(doctorId, date);
        return availableSlots.contains(time);
    }

    // Get doctor's working hours for a specific date
    public String getDoctorWorkingHours(String doctorId, LocalDate date) {
        Optional<Doctor> doctorOpt = doctorRepository.findByDoctorId(doctorId);

        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            return doctor.getWorkingHours().getStart() + " - " + doctor.getWorkingHours().getEnd();
        }

        return "Not available";
    }

    // GENERATE UNIQUE APPOINTMENT ID
    private String generateAppointmentId() {
        long count = appointmentRepository.count();
        return "A" + (3000 + count + 1);
    }

    // BASIC CRUD METHODS (for completeness)
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

    /**
     * Mark past appointments as TERMINE (completed).
     * Updates all appointments with date < today and status = PLANIFIE to TERMINE.
     * 
     * @param today The current date (usually LocalDate.now())
     * @return Number of appointments updated
     */
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

    /**
     * Scheduled task to automatically mark past appointments as completed.
     * Runs daily at 2:00 AM.
     */
    @Scheduled(cron = "0 0 2 * * ?") // Daily at 2:00 AM
    public void scheduledMarkPastAppointmentsAsCompleted() {
        LocalDate today = LocalDate.now();
        int count = markPastAppointmentsAsCompleted(today);
        if (count > 0) {
            System.out.println("✓ Marked " + count + " past appointment(s) as TERMINE");
        }
    }

    public List<Appointment> findByDoctorId(String doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> findByPatientId(String patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> findByDate(LocalDate date) {
        return appointmentRepository.findByDate(date);
    }
}