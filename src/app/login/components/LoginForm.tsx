"use client";

import type { ApiError } from "@/config/api";
import type { ValidationError } from "@/app/login/model/auth.model";
import { adminLogin } from "@/app/login/service/auth.service";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      await adminLogin({ email: email.trim(), password });
      router.replace(redirect);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.errors?.length) {
        const map: Record<string, string> = {};
        apiErr.errors.forEach((item: ValidationError) => {
          map[item.field] = item.message;
        });
        setFieldErrors(map);
      }
      setError(apiErr.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-gray-700">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@yaclam.com"
            className={`w-full rounded-md border py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fieldErrors.email ? "border-red-300" : "border-gray-300"
            }`}
          />
        </div>
        {fieldErrors.email && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-gray-700">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className={`w-full rounded-md border py-2 pl-8 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fieldErrors.password ? "border-red-300" : "border-gray-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Sign in
          </>
        )}
      </button>
    </form>
  );
}
