import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import type { InstructorRecord } from "@/app/instructors/model/instructor.model";
import {
  INSTRUCTOR_CREATE_KEYS,
  INSTRUCTOR_FORM_FIELDS,
  INSTRUCTOR_UPDATE_KEYS,
  resolveInstructorRoleId,
} from "@/app/instructors/model/instructor.model";

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[!-~]{6,}$/;

export function validateInstructorForm(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};
  const keys = editing ? INSTRUCTOR_UPDATE_KEYS : INSTRUCTOR_CREATE_KEYS;

  keys.forEach((key) => {
    const field = INSTRUCTOR_FORM_FIELDS.find((f) => f.key === key);
    if (!field) return;

    const raw = form[key];
    const value = String(raw ?? "").trim();

    if (field.required && !value) {
      errors[key] = `${field.label} is required`;
      return;
    }

    if (key === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[key] = "Enter a valid email address";
    }

    if (key === "password" && value && !PASSWORD_PATTERN.test(value)) {
      errors[key] =
        "Password must be 6+ chars with upper, lower, number, and special character";
    }
  });

  if (!editing && !String(form.password ?? "").trim()) {
    errors.password = "Password is required";
  }

  return errors;
}

export function buildInstructorPayload(
  form: Record<string, unknown>,
  editing: boolean
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: String(form.name ?? "").trim(),
    email: String(form.email ?? "").trim(),
    phone: String(form.phone ?? ""),
    photo: String(form.photo ?? ""),
    bio: String(form.bio ?? ""),
    status: editing
      ? String(form.status ?? "active") === "inactive"
        ? "inactive"
        : "active"
      : "active",
  };

  const roleId = resolveInstructorRoleId(form.instructorRoleId);
  payload.instructorRoleId = roleId || null;

  const password = String(form.password ?? "").trim();
  if (password) payload.password = password;
  else if (!editing) payload.password = "";

  return payload;
}

export function getModalFields(editing: boolean): FormField[] {
  return INSTRUCTOR_FORM_FIELDS.filter((field) => {
    if (field.key === "password" && editing) return false;
    if (field.key === "status" && !editing) return false;
    if (field.key === "photo") return false;
    return true;
  });
}

export function instructorRecordToForm(record: InstructorRecord | null): Record<string, unknown> {
  if (!record) {
    return {
      name: "",
      email: "",
      password: "",
      phone: "",
      photo: "",
      bio: "",
      instructorRoleId: "",
      status: "active",
    };
  }

  return {
    name: record.name ?? "",
    email: record.email ?? "",
    password: "",
    phone: record.phone ?? "",
    photo: record.photo ?? "",
    bio: record.bio ?? "",
    instructorRoleId: resolveInstructorRoleId(record.instructorRoleId),
    status: record.status === "inactive" ? "inactive" : "active",
  };
}
