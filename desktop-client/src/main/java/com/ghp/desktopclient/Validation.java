package com.ghp.desktopclient;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.regex.Pattern;

public class Validation {
    private static final Pattern EMAIL = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PHONE = Pattern.compile("^\\+?[0-9\\s-]{7,15}$");
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE; // yyyy-MM-dd

    public static boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }

    public static boolean email(String s) {
        return notBlank(s) && EMAIL.matcher(s.trim()).matches();
    }

    public static boolean phone(String s) {
        return notBlank(s) && PHONE.matcher(s.trim()).matches();
    }

    public static boolean dateIso(String s) {
        if (!notBlank(s)) return false;
        try {
            LocalDate.parse(s.trim(), ISO);
            return true;
        } catch (DateTimeParseException e) {
            return false;
        }
    }

    public static boolean dateNotInFuture(String s) {
        try {
            LocalDate d = LocalDate.parse(s.trim(), ISO);
            return !d.isAfter(LocalDate.now());
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean sexValid(String s) {
        if (!notBlank(s)) return false;
        String v = s.trim().toUpperCase();
        return v.equals("M") || v.equals("F") || v.equals("MALE") || v.equals("FEMALE")
                || v.equals("HOMME") || v.equals("FEMME");
    }
}
