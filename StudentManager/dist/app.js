import { DEPARTMENTS, PASS_MARK, getGrade, } from "./models/student.js";
import { StudentService } from "./services/studentService.js";
import { hasErrors, validateStudent } from "./utils/validators.js";
/* ===== Small DOM helpers ===== */
function $(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Element #${id} not found`);
    return el;
}
function escapeHtml(value) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    };
    return value.replace(/[&<>"']/g, (c) => map[c]);
}
/* ===== Elements ===== */
const form = $("student-form");
const formTitle = $("form-title");
const rollNoInput = $("rollNo");
const nameInput = $("name");
const emailInput = $("email");
const phoneInput = $("phone");
const departmentSelect = $("department");
const yearSelect = $("year");
const marksInput = $("marks");
const submitBtn = $("submit-btn");
const cancelBtn = $("cancel-btn");
const searchInput = $("search");
const filterDept = $("filter-dept");
const sortKeySelect = $("sort-key");
const sortDirBtn = $("sort-dir");
const exportBtn = $("export-btn");
const clearBtn = $("clear-btn");
const tbody = $("student-rows");
const emptyState = $("empty-state");
const tableWrap = $("table-wrap");
const resultCount = $("result-count");
const toast = $("toast");
const statTotal = $("stat-total");
const statAvg = $("stat-avg");
const statPass = $("stat-pass");
const statTopper = $("stat-topper");
/* ===== State ===== */
const service = new StudentService();
let editingId = null;
let sortDir = "asc";
/* ===== Setup dropdowns ===== */
function populateDepartments() {
    const options = DEPARTMENTS.map((d) => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join("");
    departmentSelect.innerHTML = `<option value="">Select department</option>${options}`;
    filterDept.innerHTML = `<option value="ALL">All departments</option>${options}`;
}
/* ===== Toast ===== */
let toastTimer;
function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
        toast.className = "toast";
    }, 2600);
}
/* ===== Form handling ===== */
function readForm() {
    const marksText = marksInput.value.trim();
    return {
        rollNo: rollNoInput.value.trim().toUpperCase(),
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        department: departmentSelect.value,
        year: Number(yearSelect.value),
        marks: marksText === "" ? NaN : Number(marksText),
    };
}
function showErrors(errors) {
    document.querySelectorAll("[data-error-for]").forEach((el) => {
        const field = el.dataset.errorFor;
        el.textContent = errors[field] ?? "";
    });
}
function resetForm() {
    form.reset();
    editingId = null;
    formTitle.textContent = "Add Student";
    submitBtn.textContent = "Add Student";
    cancelBtn.classList.add("hidden");
    showErrors({});
}
function startEdit(student) {
    editingId = student.id;
    rollNoInput.value = student.rollNo;
    nameInput.value = student.name;
    emailInput.value = student.email;
    phoneInput.value = student.phone;
    departmentSelect.value = student.department;
    yearSelect.value = String(student.year);
    marksInput.value = String(student.marks);
    formTitle.textContent = "Edit Student";
    submitBtn.textContent = "Update Student";
    cancelBtn.classList.remove("hidden");
    showErrors({});
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    nameInput.focus();
}
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = readForm();
    const errors = validateStudent(input, service.getAll(), editingId);
    showErrors(errors);
    if (hasErrors(errors)) {
        showToast("Please fix the highlighted fields.", "error");
        return;
    }
    if (editingId) {
        service.update(editingId, input);
        showToast("Student updated successfully.");
    }
    else {
        service.add(input);
        showToast("Student added successfully.");
    }
    resetForm();
    render();
});
cancelBtn.addEventListener("click", resetForm);
/* ===== Rendering ===== */
function currentQuery() {
    return {
        search: searchInput.value,
        department: filterDept.value,
        sortKey: sortKeySelect.value,
        sortDir,
    };
}
function renderStats() {
    const stats = service.getStats();
    statTotal.textContent = String(stats.total);
    statAvg.textContent = stats.total ? stats.averageMarks.toFixed(1) : "–";
    statPass.textContent = stats.total ? `${stats.passPercentage.toFixed(0)}%` : "–";
    statTopper.textContent = stats.topper ? `${stats.topper.name} (${stats.topper.marks})` : "–";
}
function rowHtml(s) {
    const grade = getGrade(s.marks);
    const passClass = s.marks >= PASS_MARK ? "pass" : "fail";
    return `
    <tr>
      <td data-label="Roll No">${escapeHtml(s.rollNo)}</td>
      <td data-label="Name"><strong>${escapeHtml(s.name)}</strong><br><small>${escapeHtml(s.email)}</small></td>
      <td data-label="Phone">${escapeHtml(s.phone)}</td>
      <td data-label="Dept">${escapeHtml(s.department)}</td>
      <td data-label="Year">${s.year}</td>
      <td data-label="Marks">${s.marks}</td>
      <td data-label="Grade"><span class="grade ${passClass}">${grade}</span></td>
      <td data-label="Actions" class="actions">
        <button class="btn-icon edit" type="button" data-action="edit" data-id="${s.id}">Edit</button>
        <button class="btn-icon delete" type="button" data-action="delete" data-id="${s.id}">Delete</button>
      </td>
    </tr>`;
}
function render() {
    const list = service.query(currentQuery());
    tbody.innerHTML = list.map(rowHtml).join("");
    const isEmpty = list.length === 0;
    emptyState.classList.toggle("hidden", !isEmpty);
    tableWrap.classList.toggle("hidden", isEmpty);
    resultCount.textContent = `${list.length} of ${service.getAll().length} student(s)`;
    renderStats();
}
/* ===== Table actions (event delegation) ===== */
tbody.addEventListener("click", (event) => {
    const target = event.target;
    const button = target.closest("button[data-action]");
    if (!button)
        return;
    const id = button.dataset.id;
    if (!id)
        return;
    const student = service.getById(id);
    if (!student)
        return;
    if (button.dataset.action === "edit") {
        startEdit(student);
    }
    else if (button.dataset.action === "delete") {
        if (window.confirm(`Delete ${student.name} (${student.rollNo})?`)) {
            service.remove(id);
            if (editingId === id)
                resetForm();
            showToast("Student deleted.");
            render();
        }
    }
});
/* ===== Toolbar ===== */
searchInput.addEventListener("input", render);
filterDept.addEventListener("change", render);
sortKeySelect.addEventListener("change", render);
sortDirBtn.addEventListener("click", () => {
    sortDir = sortDir === "asc" ? "desc" : "asc";
    sortDirBtn.textContent = sortDir === "asc" ? "↑ Asc" : "↓ Desc";
    render();
});
exportBtn.addEventListener("click", () => {
    const list = service.query(currentQuery());
    if (list.length === 0) {
        showToast("Nothing to export.", "error");
        return;
    }
    const blob = new Blob([service.toCsv(list)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "students.csv";
    link.click();
    URL.revokeObjectURL(url);
    showToast("CSV downloaded.");
});
clearBtn.addEventListener("click", () => {
    if (service.getAll().length === 0)
        return;
    if (window.confirm("Delete ALL students? This cannot be undone.")) {
        service.clearAll();
        resetForm();
        render();
        showToast("All students removed.");
    }
});
/* ===== Init ===== */
populateDepartments();
render();
//# sourceMappingURL=app.js.map