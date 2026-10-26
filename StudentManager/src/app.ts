import {
  DEPARTMENTS,
  Department,
  PASS_MARK,
  Student,
  StudentInput,
  Year,
  getGrade,
} from "./models/student.js";
import { QueryOptions, SortDir, SortKey, StudentService } from "./services/studentService.js";
import { FieldName, hasErrors, validateStudent } from "./utils/validators.js";

/* ===== Small DOM helpers ===== */
function $<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el as T;
}

function escapeHtml(value: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (c) => map[c]);
}

/* ===== Elements ===== */
const form = $<HTMLFormElement>("student-form");
const formTitle = $<HTMLHeadingElement>("form-title");
const rollNoInput = $<HTMLInputElement>("rollNo");
const nameInput = $<HTMLInputElement>("name");
const emailInput = $<HTMLInputElement>("email");
const phoneInput = $<HTMLInputElement>("phone");
const departmentSelect = $<HTMLSelectElement>("department");
const yearSelect = $<HTMLSelectElement>("year");
const marksInput = $<HTMLInputElement>("marks");
const submitBtn = $<HTMLButtonElement>("submit-btn");
const cancelBtn = $<HTMLButtonElement>("cancel-btn");

const searchInput = $<HTMLInputElement>("search");
const filterDept = $<HTMLSelectElement>("filter-dept");
const sortKeySelect = $<HTMLSelectElement>("sort-key");
const sortDirBtn = $<HTMLButtonElement>("sort-dir");
const exportBtn = $<HTMLButtonElement>("export-btn");
const clearBtn = $<HTMLButtonElement>("clear-btn");

const tbody = $<HTMLTableSectionElement>("student-rows");
const emptyState = $<HTMLDivElement>("empty-state");
const tableWrap = $<HTMLDivElement>("table-wrap");
const resultCount = $<HTMLSpanElement>("result-count");
const toast = $<HTMLDivElement>("toast");

const statTotal = $<HTMLElement>("stat-total");
const statAvg = $<HTMLElement>("stat-avg");
const statPass = $<HTMLElement>("stat-pass");
const statTopper = $<HTMLElement>("stat-topper");

/* ===== State ===== */
const service = new StudentService();
let editingId: string | null = null;
let sortDir: SortDir = "asc";

/* ===== Setup dropdowns ===== */
function populateDepartments(): void {
  const options = DEPARTMENTS.map((d) => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join("");
  departmentSelect.innerHTML = `<option value="">Select department</option>${options}`;
  filterDept.innerHTML = `<option value="ALL">All departments</option>${options}`;
}

/* ===== Toast ===== */
let toastTimer: number | undefined;
function showToast(message: string, type: "success" | "error" = "success"): void {
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.className = "toast";
  }, 2600);
}

/* ===== Form handling ===== */
function readForm(): StudentInput {
  const marksText = marksInput.value.trim();
  return {
    rollNo: rollNoInput.value.trim().toUpperCase(),
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    department: departmentSelect.value as Department,
    year: Number(yearSelect.value) as Year,
    marks: marksText === "" ? NaN : Number(marksText),
  };
}

function showErrors(errors: Partial<Record<FieldName, string>>): void {
  document.querySelectorAll<HTMLElement>("[data-error-for]").forEach((el) => {
    const field = el.dataset.errorFor as FieldName;
    el.textContent = errors[field] ?? "";
  });
}

function resetForm(): void {
  form.reset();
  editingId = null;
  formTitle.textContent = "Add Student";
  submitBtn.textContent = "Add Student";
  cancelBtn.classList.add("hidden");
  showErrors({});
}

function startEdit(student: Student): void {
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

form.addEventListener("submit", (event: SubmitEvent) => {
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
  } else {
    service.add(input);
    showToast("Student added successfully.");
  }
  resetForm();
  render();
});

cancelBtn.addEventListener("click", resetForm);

/* ===== Rendering ===== */
function currentQuery(): QueryOptions {
  return {
    search: searchInput.value,
    department: filterDept.value as Department | "ALL",
    sortKey: sortKeySelect.value as SortKey,
    sortDir,
  };
}

function renderStats(): void {
  const stats = service.getStats();
  statTotal.textContent = String(stats.total);
  statAvg.textContent = stats.total ? stats.averageMarks.toFixed(1) : "–";
  statPass.textContent = stats.total ? `${stats.passPercentage.toFixed(0)}%` : "–";
  statTopper.textContent = stats.topper ? `${stats.topper.name} (${stats.topper.marks})` : "–";
}

function rowHtml(s: Student): string {
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

function render(): void {
  const list = service.query(currentQuery());
  tbody.innerHTML = list.map(rowHtml).join("");
  const isEmpty = list.length === 0;
  emptyState.classList.toggle("hidden", !isEmpty);
  tableWrap.classList.toggle("hidden", isEmpty);
  resultCount.textContent = `${list.length} of ${service.getAll().length} student(s)`;
  renderStats();
}

/* ===== Table actions (event delegation) ===== */
tbody.addEventListener("click", (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const button = target.closest<HTMLButtonElement>("button[data-action]");
  if (!button) return;

  const id = button.dataset.id;
  if (!id) return;
  const student = service.getById(id);
  if (!student) return;

  if (button.dataset.action === "edit") {
    startEdit(student);
  } else if (button.dataset.action === "delete") {
    if (window.confirm(`Delete ${student.name} (${student.rollNo})?`)) {
      service.remove(id);
      if (editingId === id) resetForm();
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
  if (service.getAll().length === 0) return;
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
