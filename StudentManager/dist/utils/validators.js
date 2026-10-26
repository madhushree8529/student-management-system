import { DEPARTMENTS } from "../models/student.js";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian 10-digit mobile number
const NAME_REGEX = /^[A-Za-z][A-Za-z .'-]{2,49}$/;
const ROLL_REGEX = /^[A-Za-z0-9]{5,15}$/;
/**
 * Validates a student form. `existing` is the current list of students and
 * `editingId` is the id being edited (so it is not flagged as its own duplicate).
 */
export function validateStudent(input, existing, editingId) {
    const errors = {};
    const others = existing.filter((s) => s.id !== editingId);
    if (!ROLL_REGEX.test(input.rollNo)) {
        errors.rollNo = "Roll number must be 5-15 letters/digits.";
    }
    else if (others.some((s) => s.rollNo.toLowerCase() === input.rollNo.toLowerCase())) {
        errors.rollNo = "This roll number already exists.";
    }
    if (!NAME_REGEX.test(input.name)) {
        errors.name = "Enter a valid name (3-50 letters).";
    }
    if (!EMAIL_REGEX.test(input.email)) {
        errors.email = "Enter a valid email address.";
    }
    else if (others.some((s) => s.email.toLowerCase() === input.email.toLowerCase())) {
        errors.email = "This email is already registered.";
    }
    if (!PHONE_REGEX.test(input.phone)) {
        errors.phone = "Enter a 10-digit mobile number starting with 6-9.";
    }
    if (!DEPARTMENTS.includes(input.department)) {
        errors.department = "Select a department.";
    }
    if (![1, 2, 3, 4].includes(input.year)) {
        errors.year = "Select a year.";
    }
    if (!Number.isFinite(input.marks) || input.marks < 0 || input.marks > 100) {
        errors.marks = "Marks must be a number between 0 and 100.";
    }
    return errors;
}
export function hasErrors(errors) {
    return Object.keys(errors).length > 0;
}
//# sourceMappingURL=validators.js.map