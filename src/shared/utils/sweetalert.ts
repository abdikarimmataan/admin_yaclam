import Swal from "sweetalert2";
import { toast } from "@/shared/utils/toast";

export async function confirmDelete(itemName: string): Promise<boolean> {
  const result = await Swal.fire({
    title: "Delete field?",
    text: `Are you sure you want to delete "${itemName}"? This cannot be undone.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#0f172a",
    cancelButtonColor: "#94a3b8",
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
  });
  return result.isConfirmed;
}

export async function confirmVisibilityChange(
  itemName: string,
  nextVisible: boolean
): Promise<boolean> {
  const result = await Swal.fire({
    title: nextVisible ? "Show field?" : "Hide field?",
    text: nextVisible
      ? `Make "${itemName}" visible on the website?`
      : `Hide "${itemName}" from the website?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#0f172a",
    cancelButtonColor: "#94a3b8",
    confirmButtonText: "Yes, continue",
    cancelButtonText: "Cancel",
  });
  return result.isConfirmed;
}

export async function confirmStatusChange(
  itemName: string,
  nextActive: boolean
): Promise<boolean> {
  const result = await Swal.fire({
    title: nextActive ? "Activate admin?" : "Deactivate admin?",
    text: nextActive
      ? `Activate "${itemName}"?`
      : `Deactivate "${itemName}"? They will not be able to sign in.`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#0f172a",
    cancelButtonColor: "#94a3b8",
    confirmButtonText: "Yes, continue",
    cancelButtonText: "Cancel",
  });
  return result.isConfirmed;
}

export function showError(message: string) {
  toast.error(message);
}

export function showSuccess(message: string) {
  toast.success(message);
}

export async function confirmLessonTypeChange(html: string): Promise<boolean> {
  const result = await Swal.fire({
    title: "Change lesson video type?",
    html,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#0f172a",
    cancelButtonColor: "#94a3b8",
    confirmButtonText: "Yes, change type",
    cancelButtonText: "Cancel",
  });
  return result.isConfirmed;
}

export async function confirmCurriculumSave(html: string): Promise<boolean> {
  const result = await Swal.fire({
    title: "Save curriculum changes?",
    html,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#0f172a",
    cancelButtonColor: "#94a3b8",
    confirmButtonText: "Yes, save curriculum",
    cancelButtonText: "Cancel",
  });
  return result.isConfirmed;
}
