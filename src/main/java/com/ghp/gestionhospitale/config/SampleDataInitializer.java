package com.ghp.gestionhospitale.config;

import com.ghp.gestionhospitale.model.Appointment;
import com.ghp.gestionhospitale.model.AppointmentStatus;
import com.ghp.gestionhospitale.model.Doctor;
import com.ghp.gestionhospitale.model.Patient;
import com.ghp.gestionhospitale.repository.AppointmentRepository;
import com.ghp.gestionhospitale.repository.DoctorRepository;
import com.ghp.gestionhospitale.repository.PatientRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Populates MongoDB with sample doctors, patients and appointments when the database is empty.
 */
@Component
@Order(3)
public class SampleDataInitializer implements CommandLineRunner {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    public SampleDataInitializer(DoctorRepository doctorRepository,
                                 PatientRepository patientRepository,
                                 AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public void run(String... args) {
        if (doctorRepository.count() == 0) {
            initializeDoctors();
        }
        if (patientRepository.count() == 0) {
            initializePatients();
        }
        if (appointmentRepository.count() == 0) {
            initializeAppointments();
        }
    }

    private void initializeDoctors() {
        Doctor cardiology = new Doctor("D2001", "Dr. Amal Rached", "Cardiologie",
                "amal.rached@grh.com", "+212600100101");
        cardiology.setWorkingDays(List.of("Monday", "Tuesday", "Thursday", "Friday"));
        cardiology.setWorkingHours(new Doctor.WorkingHours("08:30", "16:30"));
        cardiology.setBreakTime(new Doctor.BreakTime("12:30", "13:15"));
        cardiology.setAppointmentDuration(30);
        cardiology.setUnavailableDates(List.of(LocalDate.now().plusDays(14).toString()));

        Doctor pediatrics = new Doctor("D2002", "Dr. Youssef Rahali", "Pédiatrie",
                "youssef.rahali@grh.com", "+212600200202");
        pediatrics.setWorkingDays(List.of("Monday", "Wednesday", "Thursday"));
        pediatrics.setWorkingHours(new Doctor.WorkingHours("09:00", "17:00"));
        pediatrics.setBreakTime(new Doctor.BreakTime("13:00", "14:00"));
        pediatrics.setAppointmentDuration(20);
        pediatrics.setUnavailableDates(List.of(LocalDate.now().plusDays(7).toString()));

        Doctor generalist = new Doctor("D2003", "Dr. Salma Kabbaj", "Médecine générale",
                "salma.kabbaj@grh.com", "+212600300303");
        generalist.setWorkingDays(List.of("Tuesday", "Wednesday", "Friday"));
        generalist.setWorkingHours(new Doctor.WorkingHours("10:00", "18:00"));
        generalist.setBreakTime(new Doctor.BreakTime("14:00", "14:45"));
        generalist.setAppointmentDuration(25);
        generalist.setUnavailableDates(List.of(LocalDate.now().plusDays(21).toString()));

        doctorRepository.saveAll(List.of(cardiology, pediatrics, generalist));
        System.out.println("✓ Inserted 3 sample doctors");
    }

    private void initializePatients() {
        Patient nadia = new Patient("P1001", "Nadia Bensaid",
                LocalDate.of(1985, 5, 10), "F", "+212612345678",
                "nadia.bensaid@patients.com", "Casablanca, Maroc");

        Patient karim = new Patient("P1002", "Karim El Idrissi",
                LocalDate.of(1992, 11, 2), "M", "+212633112233",
                "karim.idrissi@patients.com", "Rabat, Maroc");

        Patient imane = new Patient("P1003", "Imane Ouahidi",
                LocalDate.of(1978, 1, 25), "F", "+212644223344",
                "imane.ouahidi@patients.com", "Marrakech, Maroc");

        Patient rachid = new Patient("P1004", "Rachid El Amrani",
                LocalDate.of(1969, 7, 18), "M", "+212655334455",
                "rachid.amrani@patients.com", "Fès, Maroc");

        patientRepository.saveAll(List.of(nadia, karim, imane, rachid));
        System.out.println("✓ Inserted 4 sample patients");
    }

    private void initializeAppointments() {
        if (doctorRepository.count() == 0 || patientRepository.count() == 0) {
            System.out.println("⚠️  Skipping sample appointments: doctors or patients missing");
            return;
        }

        LocalDate today = LocalDate.now();
        List<Appointment> appointments = List.of(
                new Appointment("A3001", "P1001", "D2001",
                        today.plusDays(1), "09:00", AppointmentStatus.PLANIFIE,
                        "Suivi cardiologique"),
                new Appointment("A3002", "P1002", "D2003",
                        today.plusDays(3), "11:30", AppointmentStatus.PLANIFIE,
                        "Contrôle annuel"),
                new Appointment("A3003", "P1003", "D2002",
                        today, "14:00", AppointmentStatus.TERMINE,
                        "Vaccination grippe"),
                new Appointment("A3004", "P1004", "D2001",
                        today.minusDays(2), "10:30", AppointmentStatus.TERMINE,
                        "Suivi post opératoire")
        );

        appointmentRepository.saveAll(appointments);
        System.out.println("✓ Inserted 4 sample appointments");
    }
}
