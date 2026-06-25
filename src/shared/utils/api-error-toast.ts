import type { ApiError } from "@/config/api";
import type { ValidationErrorItem } from "@/shared/utils/form-validation";
import { toast } from "@/shared/utils/toast";

export function toastApiError(err: ApiError, fallback = "Request failed") {
  if (err.errors?.length) {
    const items: ValidationErrorItem[] = err.errors.map((item, index) => ({
      key: String(item.field || index),
      label: String(item.field || "Field"),
      message: String(item.message || "Invalid value"),
    }));
    toast.validationErrors(items);
    return;
  }

  toast.error(err.message?.trim() || fallback);
}
