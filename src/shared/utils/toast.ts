import { toast as sonnerToast } from "sonner";
import type { ValidationErrorItem } from "@/shared/utils/form-validation";

export type ToastType = "success" | "error" | "info" | "warning";

export const toast = {
  success(message: string) {
    sonnerToast.success(message);
  },
  error(message: string) {
    sonnerToast.error(message);
  },
  validationErrors(items: ValidationErrorItem[]) {
    if (!items.length) return;

    if (items.length === 1) {
      sonnerToast.error(`${items[0].label}: ${items[0].message}`, {
        duration: 6000,
      });
      return;
    }

    sonnerToast.error(`Please fix ${items.length} validation errors`, {
      description: items
        .map((item, index) => `${index + 1}. ${item.label}: ${item.message}`)
        .join("\n"),
      duration: Math.min(15000, 5000 + items.length * 1500),
    });
  },
  info(message: string) {
    sonnerToast.info(message);
  },
  warning(message: string) {
    sonnerToast.warning(message);
  },
  message(message: string, type: ToastType = "info") {
    sonnerToast[type](message);
  },
};
