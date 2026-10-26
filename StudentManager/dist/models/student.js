// ===== Data model: types and interfaces =====
export const DEPARTMENTS = [
    "CSE",
    "IT",
    "AI&DS",
    "ECE",
    "EEE",
    "MECH",
    "CIVIL",
];
export const PASS_MARK = 40;
export function getGrade(marks) {
    if (marks >= 90)
        return "O";
    if (marks >= 80)
        return "A+";
    if (marks >= 70)
        return "A";
    if (marks >= 60)
        return "B+";
    if (marks >= 50)
        return "B";
    if (marks >= PASS_MARK)
        return "C";
    return "F";
}
//# sourceMappingURL=student.js.map