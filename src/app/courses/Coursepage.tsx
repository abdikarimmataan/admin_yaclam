"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import "sweetalert2/dist/sweetalert2.min.css";
import type { ApiError } from "@/config/api";
import { CourseCurriculumEditor } from "@/app/courses/components/CourseCurriculumEditor";
import { CourseFormEditor } from "@/app/courses/components/CourseFormEditor";
import { CourseTable } from "@/app/courses/components/CourseTable";
import type { CourseRecord } from "@/app/courses/model/course.model";
import {
  getCourseFieldName,
  getCourseLabel,
} from "@/app/courses/model/course.model";
import { courseApi } from "@/app/courses/service/course.service";
import { fieldApi } from "@/app/fields/service/field.service";
import type { FieldRecord } from "@/app/fields/model/field.model";
import { getFieldLabel } from "@/app/fields/model/field.model";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { FieldOption } from "@/app/courses/components/CourseMediaPanel";
import { confirmVisibilityChange, showError } from "@/shared/utils/sweetalert";

function getFieldRecordId(field: FieldRecord): string {
  const raw = field as FieldRecord & { _id?: string };
  return String(field.id ?? raw._id ?? "").trim();
}

type ViewMode = "list" | "form" | "curriculum";

export function Coursepage() {
  const [view, setView] = useState<ViewMode>("list");
  const [items, setItems] = useState<CourseRecord[]>([]);
  const [fields, setFields] = useState<FieldRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [listError, setListError] = useState("");
  const [recordId, setRecordId] = useState<string | null>(null);
  const [curriculumCourseId, setCurriculumCourseId] = useState<string | null>(null);
  const [curriculumCourseTitle, setCurriculumCourseTitle] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const fieldOptions: FieldOption[] = useMemo(
    () =>
      fields
        .map((f) => ({
          id: getFieldRecordId(f),
          text: getFieldLabel(f),
        }))
        .filter((f) => f.id),
    [fields]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const [coursesRes, fieldsRes] = await Promise.all([
        courseApi.getAll({ page: 1, pageSize: 500 }),
        fieldApi.getAll({ page: 1, pageSize: 500 }),
      ]);
      setItems((coursesRes.data ?? []) as CourseRecord[]);
      setFields((fieldsRes.data ?? []) as FieldRecord[]);
    } catch (err) {
      setListError((err as ApiError).message || "Failed to load courses");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter((item) => {
      const title = getCourseLabel(item).toLowerCase();
      const fieldName = getCourseFieldName(item).toLowerCase();
      return title.includes(q) || fieldName.includes(q);
    });
  }, [items, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const openCreate = () => {
    if (fields.length === 0) {
      setListError("Create at least one field before adding courses.");
      return;
    }
    setRecordId(null);
    setView("form");
  };

  const openEdit = (item: CourseRecord) => {
    if (!item.id) return;
    setRecordId(String(item.id));
    setView("form");
  };

  const openCurriculum = (item: CourseRecord) => {
    if (!item.id) return;
    setCurriculumCourseId(String(item.id));
    setCurriculumCourseTitle(getCourseLabel(item));
    setView("curriculum");
  };

  const backToList = () => {
    setView("list");
    setRecordId(null);
    setCurriculumCourseId(null);
    setCurriculumCourseTitle("");
  };

  const handleSaved = async () => {
    await fetchData();
  };

  const handleToggleVisible = async (item: CourseRecord) => {
    if (!item.id) return;
    const nextVisible = item.isVisible === false;
    const name = getCourseLabel(item);
    const confirmed = await confirmVisibilityChange(name, nextVisible);
    if (!confirmed) return;

    setBusyId(String(item.id));
    try {
      await courseApi.updateVisible(String(item.id), nextVisible);
      await fetchData();
    } catch (err) {
      await showError((err as ApiError).message || "Status update failed");
    } finally {
      setBusyId(null);
    }
  };

  if (view === "form") {
    return (
      <CourseFormEditor
        recordId={recordId}
        fieldOptions={fieldOptions}
        onBack={backToList}
        onSaved={handleSaved}
        onDeleted={handleSaved}
      />
    );
  }

  if (view === "curriculum" && curriculumCourseId) {
    return (
      <CourseCurriculumEditor
        courseId={curriculumCourseId}
        courseTitle={curriculumCourseTitle}
        onBack={backToList}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Course List</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage courses. Each course must belong to a field.
        </p>
      </div>

      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          disabled={fields.length === 0}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Create
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {listError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {listError}
        </div>
      )}

      <CourseTable
        loading={loading}
        paginated={paginated}
        startIdx={startIdx}
        search={search}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        filteredCount={filtered.length}
        busyId={busyId}
        canPrev={canPrev}
        canNext={canNext}
        onSearchChange={setSearch}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onEdit={openEdit}
        onCurriculum={openCurriculum}
        onToggleVisible={handleToggleVisible}
      />
    </div>
  );
}
