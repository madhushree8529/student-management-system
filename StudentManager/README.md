# Student Management System (TypeScript)

Modern Web Programming project – a TypeScript based Student Management Application.
Add, edit, delete, search, filter, sort and export students. Data is saved in the browser (`localStorage`).

## Folder structure
```
StudentManager/
├── index.html            – page layout
├── style.css             – styling (responsive)
├── tsconfig.json         – TypeScript compiler settings
├── package.json          – npm scripts (build / watch)
├── src/                  – TypeScript source code
│   ├── app.ts            – UI logic (DOM, events, rendering)
│   ├── models/student.ts – interfaces, types, grade function
│   ├── services/studentService.ts – CRUD, search, sort, stats, CSV (class)
│   └── utils/validators.ts – form validation
└── dist/                 – compiled JavaScript (already included)
```

## How to run (Visual Studio Code)
1. Extract the zip and open the `StudentManager` folder in VS Code (File → Open Folder).
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server**.

> The project uses ES modules, so it must run through a server (Live Server).
> Double-clicking `index.html` will NOT work because browsers block modules on `file://`.

The `dist/` folder already contains the compiled JavaScript, so it runs immediately.

## If you change the TypeScript code
Install Node.js, then in the VS Code terminal (Ctrl + `):
```
npm install
npm run build      # compile once
npm run watch      # auto-compile on save
```

## Visual Studio (full IDE)
Create an *ASP.NET Core Empty* project, copy `index.html`, `style.css` and the `dist` folder into `wwwroot`
(plus `app.UseStaticFiles()` and `app.UseDefaultFiles()` in `Program.cs`), then press Ctrl + F5.
Keep the `src` folder beside it if you want to edit the TypeScript.

## TypeScript concepts used (useful for viva)
- `interface` and `type` aliases – `Student`, `StudentInput`, `Department`, `Year`
- Union and literal types – `"asc" | "desc"`, `1 | 2 | 3 | 4`
- Utility types – `Omit<Student, "id">`, `Partial<Record<...>>`
- Classes with private members – `StudentService`
- Generics – `$<T extends HTMLElement>(id)` helper
- ES modules – `import` / `export` across files
- Strict null checking and type assertions
- `readonly` arrays and optional chaining / nullish coalescing

## Features
- Add / Edit / Delete student with confirmation
- Validation (roll number, name, email, 10-digit phone, marks 0-100, duplicates)
- Search by name / roll no / email, filter by department, sort by name / roll no / marks / year
- Grades (O, A+, A, B+, B, C, F) with pass/fail colours
- Dashboard: total students, average marks, pass %, topper
- Export current list as CSV
- Responsive layout (table becomes cards on mobile)
