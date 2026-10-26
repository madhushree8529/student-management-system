import { PASS_MARK, getGrade, } from "../models/student.js";
const STORAGE_KEY = "student_management_v1";
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
const SAMPLE_DATA = [
    {
        rollNo: "711524BCS082",
        name: "Loshitha K",
        email: "loshitha@example.com",
        phone: "9876543210",
        department: "CSE",
        year: 2,
        marks: 91,
    },
    {
        rollNo: "711524BCS010",
        name: "Arun Kumar",
        email: "arun@example.com",
        phone: "9123456780",
        department: "CSE",
        year: 2,
        marks: 76,
    },
    {
        rollNo: "711523BEC045",
        name: "Priya Dharshini",
        email: "priya@example.com",
        phone: "9988776655",
        department: "ECE",
        year: 3,
        marks: 58,
    },
];
export class StudentService {
    constructor() {
        this.students = [];
        this.load();
        if (this.students.length === 0 && localStorage.getItem(STORAGE_KEY) === null) {
            SAMPLE_DATA.forEach((s) => this.students.push({ id: generateId(), ...s }));
            this.save();
        }
    }
    // ----- persistence -----
    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            this.students = raw ? JSON.parse(raw) : [];
        }
        catch {
            this.students = [];
        }
    }
    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.students));
    }
    // ----- CRUD -----
    getAll() {
        return this.students;
    }
    getById(id) {
        return this.students.find((s) => s.id === id);
    }
    add(input) {
        const student = { id: generateId(), ...input };
        this.students.push(student);
        this.save();
        return student;
    }
    update(id, input) {
        const index = this.students.findIndex((s) => s.id === id);
        if (index === -1) {
            throw new Error("Student not found");
        }
        const updated = { id, ...input };
        this.students[index] = updated;
        this.save();
        return updated;
    }
    remove(id) {
        const before = this.students.length;
        this.students = this.students.filter((s) => s.id !== id);
        const removed = this.students.length < before;
        if (removed)
            this.save();
        return removed;
    }
    clearAll() {
        this.students = [];
        this.save();
    }
    // ----- search / filter / sort -----
    query(options) {
        const text = options.search.trim().toLowerCase();
        const filtered = this.students.filter((s) => {
            const matchesDept = options.department === "ALL" || s.department === options.department;
            const matchesText = text === "" ||
                s.name.toLowerCase().includes(text) ||
                s.rollNo.toLowerCase().includes(text) ||
                s.email.toLowerCase().includes(text);
            return matchesDept && matchesText;
        });
        const direction = options.sortDir === "asc" ? 1 : -1;
        return filtered.sort((a, b) => {
            const x = a[options.sortKey];
            const y = b[options.sortKey];
            if (typeof x === "number" && typeof y === "number") {
                return (x - y) * direction;
            }
            return String(x).localeCompare(String(y)) * direction;
        });
    }
    // ----- statistics -----
    getStats(list = this.students) {
        if (list.length === 0) {
            return { total: 0, averageMarks: 0, passPercentage: 0, topper: null };
        }
        const sum = list.reduce((acc, s) => acc + s.marks, 0);
        const passed = list.filter((s) => s.marks >= PASS_MARK).length;
        const topper = list.reduce((best, s) => (s.marks > best.marks ? s : best), list[0]);
        return {
            total: list.length,
            averageMarks: sum / list.length,
            passPercentage: (passed / list.length) * 100,
            topper,
        };
    }
    // ----- export -----
    toCsv(list = this.students) {
        const header = ["Roll No", "Name", "Email", "Phone", "Department", "Year", "Marks", "Grade"];
        const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
        const rows = list.map((s) => [s.rollNo, s.name, s.email, s.phone, s.department, s.year, s.marks, getGrade(s.marks)]
            .map(escape)
            .join(","));
        return [header.map(escape).join(","), ...rows].join("\n");
    }
}
//# sourceMappingURL=studentService.js.map