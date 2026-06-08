"use client";

import { useEffect, useState } from "react";
import {
  Award,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  Heart,
  Languages,
  Loader2,
  Lock,
  Play,
  ShoppingCart,
  Star,
  Users,
  X,
} from "lucide-react";
import type { CourseModule, CourseRecord } from "@/app/courses/model/course.model";
import {
  getCourseFieldName,
  getCourseLabel,
  resolveUploadUrl,
} from "@/app/courses/model/course.model";
import { LucideIconByName } from "@/shared/components/LucideIconByName";
import { resolveAssetUrl } from "@/shared/utils/asset-url";

const TABS = ["Overview", "Curriculum", "Details", "Instructor", "Reviews"] as const;
type Tab = (typeof TABS)[number];

const SAMPLE_REVIEWS = [
  {
    name: "Maxamed A.",
    rating: 5,
    date: "2 weeks ago",
    text: "Casharradu aad bay u faahfaahsan yihiin. Si fudud baan u fahmay — waan ku talin lahaa qof kasta.",
    initials: "MA",
  },
  {
    name: "Khadija H.",
    rating: 5,
    date: "1 month ago",
    text: "The projects are practical and the Somali explanations made hard concepts click. Worth every cent.",
    initials: "KH",
  },
  {
    name: "Cabdi N.",
    rating: 4,
    date: "1 month ago",
    text: "Great course overall. Would love even more advanced exercises at the end, but the foundation is excellent.",
    initials: "CN",
  },
];

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getFieldIcon(record: CourseRecord): string {
  const field = record.fieldId;
  if (field && typeof field === "object" && field.icon) {
    return String(field.icon);
  }
  return "BookOpen";
}

function getInstructorName(record: CourseRecord): string {
  return String(record.instructor?.name ?? record.instructorName ?? "Instructor");
}

function countLessons(modules: CourseModule[]): number {
  return modules.reduce((total, module) => total + (module.lessons?.length ?? 0), 0);
}

function PreviewStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#B8860B]">
      <Star size={14} fill="#B8860B" stroke="#B8860B" /> {rating.toFixed(1)}
    </span>
  );
}

function PreviewTabs({
  record,
  modules,
}: {
  record: CourseRecord;
  modules: CourseModule[];
}) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [openModule, setOpenModule] = useState(0);

  const instructorName = getInstructorName(record);
  const instructorInitials = initialsFromName(instructorName);
  const instructorBio =
    String(record.instructor?.bio ?? "").trim() ||
    "Practitioner-instructor with years of real-world experience, teaching the exact skills employers test for — explained in Somali with English technical terms.";
  const rating = Number(record.rating ?? 0);
  const reviewCount = Number(record.reviewCount ?? 0);
  const lessonCount =
    Number(record.details?.lessonCount ?? record.lessonCount ?? countLessons(modules)) || 0;
  const hours = Number(record.details?.durationHours ?? record.durationHours ?? 0) || 0;
  const level = String(record.details?.skillLevel ?? record.level ?? "Beginner");
  const language = String(record.details?.language ?? record.language ?? "Somali");
  const certificate = record.details?.certificate ?? record.certificate ?? false;
  const access = String(record.details?.access ?? record.access ?? "1 Year");
  const outcomes = record.overview?.outcomes ?? [];
  const overviewHeadline =
    String(record.overview?.headline ?? "").trim() || "Build smarter, not harder";
  const overviewDescription =
    String(record.overview?.description ?? record.description ?? "").trim() ||
    "No description provided.";
  const color = String(record.color ?? "#1F3A93");

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-1 mb-7 flex gap-1 overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white p-1">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn(
              "relative whitespace-nowrap rounded-lg px-4 py-2.5 text-[14.5px] font-semibold transition",
              tab === item ? "bg-[#0D1B4B] text-white" : "text-[#374151] hover:text-[#0D1B4B]"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div>
          <h2 className="mb-4 text-[24px] font-semibold text-[#0D1B4B]">{overviewHeadline}</h2>
          <p className="mb-4 text-[16px] leading-[1.8] text-[#374151]">{overviewDescription}</p>
          {outcomes.length > 0 ? (
            <>
              <h3 className="mb-3 mt-7 text-[19px] font-bold text-[#0D1B4B]">
                What you&apos;ll master
              </h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-2.5 text-[15px] text-[#374151]">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#1F3A93]" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      )}

      {tab === "Curriculum" && (
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
          {modules.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[#6B7280]">
              No curriculum modules yet.
            </div>
          ) : (
            modules.map((module, index) => {
              const lessons = module.lessons ?? [];
              return (
                <div
                  key={`${module.title}-${index}`}
                  className="border-b border-[#F1F5F9] last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => setOpenModule(openModule === index ? -1 : index)}
                    className="flex w-full items-center justify-between bg-[#F8FAFC] px-5 py-4 text-left font-semibold text-[#0D1B4B]"
                  >
                    <span>
                      {module.title || `Module ${index + 1}`} · {lessons.length} lessons
                    </span>
                    <ChevronDown
                      size={18}
                      className={cn("transition-transform", openModule === index && "rotate-180")}
                    />
                  </button>
                  {openModule === index ? (
                    <div className="px-5 pb-3.5 pt-1.5">
                      {lessons.length === 0 ? (
                        <p className="py-2 text-sm text-[#6B7280]">No lessons in this module.</p>
                      ) : (
                        lessons.map((lesson, lessonIndex) => (
                          <div
                            key={String(lesson.id ?? `${index}-${lessonIndex}`)}
                            className="flex items-center justify-between gap-3 py-2.5 text-[14px] text-[#374151]"
                          >
                            <span className="flex items-center gap-2.5">
                              {lesson.free ? (
                                <Play size={15} className="text-[#1F3A93]" />
                              ) : (
                                <Lock size={14} className="text-[#6B7280]" />
                              )}
                              {lesson.title || "Untitled lesson"}
                            </span>
                            <span className="shrink-0 text-[13px] text-[#6B7280]">
                              {lesson.duration || "—"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "Details" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Skill level", level],
            ["Language", language],
            ["Lessons", `${lessonCount}`],
            ["Duration", hours ? `${hours} hours` : "—"],
            ["Certificate", certificate ? "Yes" : "No"],
            ["Access", access],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3.5 text-[14.5px]"
            >
              <span className="text-[#6B7280]">{label}</span>
              <b className="text-[#0D1B4B]">{value}</b>
            </div>
          ))}
        </div>
      )}

      {tab === "Instructor" && (
        <div className="flex items-start gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-6">
          {record.instructor?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveAssetUrl(record.instructor.avatar)}
              alt={instructorName}
              className="h-[72px] w-[72px] shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full text-2xl font-extrabold text-white"
              style={{ background: `linear-gradient(135deg, ${color}, #0D1B4B)` }}
            >
              {instructorInitials}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-[#0D1B4B]">{instructorName}</h3>
            {record.instructor?.role ? (
              <p className="mt-0.5 text-sm font-medium text-[#1F3A93]">
                {record.instructor.role}
              </p>
            ) : null}
            <p className="mt-2 text-[14.5px] text-[#6B7280]">{instructorBio}</p>
          </div>
        </div>
      )}

      {tab === "Reviews" && (
        <div>
          <div className="mb-6 flex items-center gap-5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-6">
            <div className="text-center">
              <div className="text-5xl font-semibold text-[#0D1B4B]">{rating.toFixed(1)}</div>
              <div className="mt-1 flex justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    fill={star <= Math.round(rating) ? "#C9A84C" : "none"}
                    stroke="#C9A84C"
                  />
                ))}
              </div>
              <div className="mt-1 text-[13px] text-[#6B7280]">{reviewCount} reviews</div>
            </div>
            <p className="text-[14.5px] text-[#374151]">
              Rated by {reviewCount.toLocaleString()} learners. Sample reviews shown for preview.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {SAMPLE_REVIEWS.map((review) => (
              <div
                key={review.name}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-5"
              >
                <div className="mb-2 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#0D1B4B] font-bold text-[#C9A84C]">
                    {review.initials}
                  </div>
                  <div>
                    <div className="font-bold text-[#0D1B4B]">{review.name}</div>
                    <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                      <span className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={11}
                            fill={star <= review.rating ? "#C9A84C" : "none"}
                            stroke="#C9A84C"
                          />
                        ))}
                      </span>
                      {review.date}
                    </div>
                  </div>
                </div>
                <p className="text-[14.5px] text-[#374151]">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type CoursePreviewModalProps = {
  open: boolean;
  loading: boolean;
  record: CourseRecord | null;
  onClose: () => void;
};

export function CoursePreviewModal({
  open,
  loading,
  record,
  onClose,
}: CoursePreviewModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const title = record ? getCourseLabel(record) : "Course preview";
  const fieldName = record ? getCourseFieldName(record) : "";
  const color = String(record?.color ?? "#1F3A93");
  const instructorName = record ? getInstructorName(record) : "";
  const instructorInitials = initialsFromName(instructorName || "IN");
  const rating = Number(record?.rating ?? 0);
  const reviewCount = Number(record?.reviewCount ?? 0);
  const students = Number(record?.studentCount ?? 0);
  const hours = Number(record?.details?.durationHours ?? record?.durationHours ?? 0) || 0;
  const level = String(record?.details?.skillLevel ?? record?.level ?? "Beginner");
  const language = String(record?.details?.language ?? record?.language ?? "Somali");
  const certificate = record?.details?.certificate ?? record?.certificate ?? false;
  const access = String(record?.details?.access ?? record?.access ?? "1 Year");
  const isFree = record?.isFree === true;
  const price = Number(record?.price ?? 0);
  const originalPrice = Number(record?.originalPrice ?? 0);
  const description = String(record?.description ?? record?.shortDescription ?? "");
  const modules = record?.curriculum ?? [];
  const thumbnailUrl = record?.thumbnail ? resolveUploadUrl(record.thumbnail) : "";
  const fieldIcon = record ? getFieldIcon(record) : "BookOpen";

  const facts: Array<[typeof Users, string, string]> = [
    [Users, "Students", students.toLocaleString()],
    [Languages, "Language", language],
    [Clock, "Duration", hours ? `${hours} hours` : "—"],
    [BarChart3, "Level", level],
    [CalendarClock, "Expiry Period", access],
    [Award, "Certificate", certificate ? "Yes" : "No"],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:p-6"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="my-4 w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-[#F8FAFC] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#1F3A93]">
              Frontend preview
            </p>
            <h2 className="text-lg font-bold text-[#0D1B4B]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-[#F1F5F9] hover:text-[#0D1B4B]"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(95vh-72px)] overflow-y-auto px-5 py-6 sm:px-8">
          {loading || !record ? (
            <div className="flex min-h-[320px] items-center justify-center gap-2 text-sm text-[#6B7280]">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading course preview…
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-1.5 text-[13px] text-[#6B7280]">
                <span>Courses</span>
                <ChevronRight size={13} />
                <span className="text-[#0D1B4B]">{title}</span>
              </div>

              <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
                <div>
                  <h1 className="text-[clamp(28px,4vw,44px)] font-bold leading-tight text-[#0D1B4B]">
                    {title}
                  </h1>
                  <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[#374151]">
                    {description || "No description provided."}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
                    <div className="flex items-center gap-2.5">
                      {record.instructor?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveAssetUrl(record.instructor.avatar)}
                          alt={instructorName}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-white"
                          style={{
                            background: `linear-gradient(135deg, ${color}, #0D1B4B)`,
                          }}
                        >
                          {instructorInitials}
                        </div>
                      )}
                      <span className="font-semibold text-[#0D1B4B]">{instructorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PreviewStars rating={rating} />
                      <span className="text-[13px] text-[#6B7280]">({reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-2 text-[14px] text-[#374151]">
                      <Languages size={16} className="text-[#6B7280]" /> {language}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-y border-[#E5E7EB] py-4 text-[14px] text-[#374151]">
                    <span className="flex items-center gap-2">
                      <GraduationCap size={16} className="text-[#1F3A93]" /> Course Certificate
                    </span>
                    <span className="flex items-center gap-2">
                      <Users size={16} className="text-[#1F3A93]" />{" "}
                      {students.toLocaleString()} Enrolled Students
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock size={16} className="text-[#1F3A93]" />{" "}
                      {hours ? `${hours} hours` : "—"}
                    </span>
                  </div>

                  <div className="mt-8">
                    <PreviewTabs record={record} modules={modules} />
                  </div>
                </div>

                <aside>
                  <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_16px_40px_-12px_rgba(13,27,75,0.16)]">
                    <div
                      className="relative grid aspect-video place-items-center overflow-hidden text-white"
                      style={{
                        background: thumbnailUrl
                          ? undefined
                          : `linear-gradient(135deg, ${color}, #0D1B4B)`,
                      }}
                    >
                      {thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumbnailUrl}
                          alt={title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="relative flex flex-col items-center gap-3">
                          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm">
                            <LucideIconByName name={fieldIcon} className="h-[30px] w-[30px]" />
                          </div>
                          <span className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide">
                            {level}
                          </span>
                        </div>
                      )}
                      {record.badge ? (
                        <span className="absolute left-3 top-3 rounded-md bg-[#C9A84C] px-2.5 py-1 text-[11.5px] font-extrabold uppercase tracking-wide text-[#0D1B4B]">
                          {record.badge}
                        </span>
                      ) : null}
                    </div>

                    <div className="p-6">
                      {fieldName ? (
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                          {fieldName}
                        </p>
                      ) : null}

                      <div className="mb-5 flex items-end gap-2">
                        <span
                          className={`text-[34px] font-bold ${
                            isFree ? "text-[#10B981]" : "text-[#0D1B4B]"
                          }`}
                        >
                          {isFree ? "Free" : `$${price}`}
                        </span>
                        {!isFree && originalPrice > 0 ? (
                          <span className="mb-1.5 text-lg text-[#6B7280] line-through">
                            ${originalPrice}
                          </span>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        disabled
                        className="mb-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#0D1B4B] opacity-80"
                      >
                        <Heart size={16} /> Add to Wishlist
                      </button>
                      <button
                        type="button"
                        disabled
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-4 py-3 text-sm font-bold text-[#0D1B4B] opacity-90"
                      >
                        {isFree ? (
                          <>
                            Start Learning <Play size={16} />
                          </>
                        ) : (
                          <>
                            Buy Now <ShoppingCart size={16} />
                          </>
                        )}
                      </button>

                      <div className="mt-6 flex flex-col">
                        {facts.map(([Icon, label, value]) => (
                          <div
                            key={label}
                            className="flex items-center justify-between border-t border-[#F1F5F9] py-3 text-[14px]"
                          >
                            <span className="flex items-center gap-2.5 text-[#6B7280]">
                              <Icon size={17} className="text-[#6B7280]" /> {label}
                            </span>
                            <b className="text-[#0D1B4B]">{value}</b>
                          </div>
                        ))}
                      </div>

                      {!isFree ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {["WaafiPay", "EVC Plus", "Zaad", "PayPal", "Visa"].map((payment) => (
                            <span
                              key={payment}
                              className="rounded-md bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-bold text-[#374151]"
                            >
                              {payment}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
