export interface ProcessConfig {
  defaultPassword: string;
  defaultRole: string;
  outputFileName: string;
}

export interface File1Row {
  'الكود'?: string | number;
  'Username'?: string;
  [key: string]: any;
}

export interface File2Row {
  'كود الطالب'?: string | number;
  'الاسم'?: string;
  'كود المقرر'?: string | number;
  [key: string]: any;
}

export interface OutputRow {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  [key: string]: any; // For dynamic course/role columns
}
