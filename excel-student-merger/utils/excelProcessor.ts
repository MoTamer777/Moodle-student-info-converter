import * as XLSX from 'xlsx';
import { File1Row, File2Row, OutputRow, ProcessConfig } from '../types';

// Helper to normalize keys (trim spaces)
const normalizeKeys = (row: any): any => {
  const newRow: any = {};
  Object.keys(row).forEach((key) => {
    newRow[key.trim()] = row[key];
  });
  return newRow;
};

// Helper to split full name into first and last
const splitName = (fullName: any): { first: string; rest: string } => {
  if (!fullName) return { first: "", rest: "" };
  const str = String(fullName).trim();
  const parts = str.split(/\s+/);
  const first = parts.length > 0 ? parts[0] : "";
  const rest = parts.length > 1 ? parts.slice(1).join(" ") : "";
  return { first, rest };
};

// Helper to read file as binary
const readFile = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) resolve(e.target.result as ArrayBuffer);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
};

// Core processing logic
export const processFiles = async (
  file1: File,
  file2: File,
  config: ProcessConfig
): Promise<void> => {
  // --- Process File 1 ---
  const data1Buffer = await readFile(file1);
  const wb1 = XLSX.read(data1Buffer, { type: 'array' });
  const sheet1Name = wb1.SheetNames[0];
  const sheet1 = wb1.Sheets[sheet1Name];
  
  // Convert to JSON and normalize keys
  let rawData1 = XLSX.utils.sheet_to_json(sheet1) as File1Row[];
  rawData1 = rawData1.map(normalizeKeys);

  // Validate File 1 Columns
  const required1 = ["الكود", "Username"];
  if (rawData1.length > 0) {
    const keys1 = Object.keys(rawData1[0]);
    for (const req of required1) {
      if (!keys1.includes(req)) {
        throw new Error(`Missing column in File 1: ${req}`);
      }
    }
  }

  // --- Process File 2 ---
  const data2Buffer = await readFile(file2);
  const wb2 = XLSX.read(data2Buffer, { type: 'array' });
  const sheet2Name = wb2.SheetNames[0];
  const sheet2 = wb2.Sheets[sheet2Name];

  // Logic to find header row in File 2
  // We convert to array of arrays to scan for headers
  const aoa2 = XLSX.utils.sheet_to_json(sheet2, { header: 1 }) as any[][];
  const required2 = ["كود الطالب", "الاسم", "كود المقرر"];
  
  let headerIndex = -1;
  const maxScanRows = 50;

  for (let i = 0; i < Math.min(aoa2.length, maxScanRows); i++) {
    const rowValues = aoa2[i].map(v => String(v).trim());
    const hasAll = required2.every(req => rowValues.includes(req));
    if (hasAll) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error("Could not find header row in File 2 (required: كود الطالب, الاسم, كود المقرر)");
  }

  // Re-parse File 2 starting from found header
  // Note: 'range' option in sheet_to_json controls start row
  let rawData2 = XLSX.utils.sheet_to_json(sheet2, { range: headerIndex }) as File2Row[];
  rawData2 = rawData2.map(normalizeKeys);

  // --- Merge Logic ---

  // Get common IDs
  const ids1 = new Set(rawData1.map(r => String(r['الكود'] ?? '').trim()).filter(Boolean));
  const ids2 = new Set(rawData2.map(r => String(r['كود الطالب'] ?? '').trim()).filter(Boolean));

  // Intersection
  const commonIds = new Set([...ids1].filter(x => ids2.has(x)));

  // Filter Data
  const df1 = rawData1.filter(r => commonIds.has(String(r['الكود']).trim()));
  const df2 = rawData2.filter(r => commonIds.has(String(r['كود الطالب']).trim()));

  // Map: StudentID -> List of Courses
  const coursesGrouped: Record<string, string[]> = {};
  // Map: StudentID -> Full Name
  const nameMap: Record<string, string> = {};

  df2.forEach(row => {
    const id = String(row['كود الطالب']).trim();
    const course = row['كود المقرر'];
    const name = row['الاسم'];

    if (!coursesGrouped[id]) {
      coursesGrouped[id] = [];
    }
    if (course) {
      coursesGrouped[id].push(String(course));
    }
    
    if (name && !nameMap[id]) {
      nameMap[id] = String(name);
    }
  });

  const outputRows: OutputRow[] = [];
  let maxCourses = 0;

  df1.forEach(row => {
    const studentId = String(row['الكود']).trim();
    const email = String(row['Username'] ?? '');
    
    const fullName = nameMap[studentId] || "";
    const { first, rest } = splitName(fullName);
    
    const courses = coursesGrouped[studentId] || [];
    maxCourses = Math.max(maxCourses, courses.length);

    const outRow: OutputRow = {
      username: studentId,
      firstname: first,
      lastname: rest,
      email: email,
      password: config.defaultPassword
    };

    courses.forEach((course, idx) => {
      const i = idx + 1;
      outRow[`course${i}`] = course;
      outRow[`role${i}`] = config.defaultRole;
    });

    outputRows.push(outRow);
  });

  // Ensure all rows have all course columns (padding)
  const finalRows = outputRows.map(row => {
    for (let i = 1; i <= maxCourses; i++) {
      if (!row[`course${i}`]) row[`course${i}`] = "";
      if (!row[`role${i}`]) row[`role${i}`] = "";
    }
    return row;
  });

  // Determine final column order
  const columns = ["username", "firstname", "lastname", "email", "password"];
  for (let i = 1; i <= maxCourses; i++) {
    columns.push(`course${i}`, `role${i}`);
  }

  // Create Worksheet
  const worksheet = XLSX.utils.json_to_sheet(finalRows, { header: columns });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Merged Data");

  // Trigger Download
  let fileName = config.outputFileName.trim();
  if (!fileName.toLowerCase().endsWith(".xlsx")) {
    fileName += ".xlsx";
  }
  XLSX.writeFile(workbook, fileName);
};
