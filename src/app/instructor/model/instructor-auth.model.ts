import type { InstructorRecord } from "@/app/instructors/model/instructor.model";

export type InstructorLoginPayload = {
  email: string;
  password: string;
};

export type InstructorLoginResponse = {
  instructor: InstructorRecord;
  accessToken: string;
  refreshToken: string;
};
