export const GENDER_OPTIONS = ["Male", "Female"];

export const RELIGION_OPTIONS = [
  "Christianity",
  "Islam",
  "Traditional",
  "Other",
  "Prefer not to say",
];

export const GRADE_OPTIONS = [
  "Creche",
  "Nursery 1",
  "Nursery 2",
  "Reception",
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SSS 1",
  "SSS 2",
  "SSS 3",
];

export const ADMISSION_TYPE_OPTIONS = [
  "New Admission",
  "Transfer",
  "Returning Student",
];

export const RELATIONSHIP_OPTIONS = [
  "Father",
  "Mother",
  "Guardian",
  "Uncle",
  "Aunt",
  "Other",
];

export const NATIONALITY_OPTIONS = [
  "Nigerian",
  "Ghanaian",
  "Kenyan",
  "South African",
  "British",
  "American",
  "Canadian",
  "Other",
];

export const ACADEMIC_SESSION_OPTIONS = [
  "2026 / 2027",
  "2027 / 2028",
];

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Application Received",
  under_review: "Under Review",
  entrance_exam: "Entrance Exam",
  interview: "Interview",
  provisionally_admitted: "Provisionally Admitted",
  admission_offered: "Admission Offered",
  rejected: "Not Successful",
};

export const STATUS_STEPS = [
  { key: "submitted", label: "Application Received" },
  { key: "under_review", label: "Under Review" },
  { key: "entrance_exam", label: "Entrance Exam" },
  { key: "interview", label: "Interview" },
  { key: "admission_offered", label: "Admission Offered" },
] as const;
