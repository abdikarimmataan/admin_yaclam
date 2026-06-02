import type { ApiUser } from "./user";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
};

export type ValidationError = {
  field: string;
  message: string;
};
