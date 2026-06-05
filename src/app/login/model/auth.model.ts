export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: {
    id: string;
    email: string;
    phone?: string;
    accountType?: string;
    profile?: { full_name?: string };
  };
  accessToken: string;
  refreshToken: string;
};

export type ValidationError = {
  field: string;
  message: string;
};
