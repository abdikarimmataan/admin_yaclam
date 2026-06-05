"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AdminErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Admin page error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-base font-semibold text-red-900">Something went wrong</h2>
          <p className="mt-2 text-sm text-red-700">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
