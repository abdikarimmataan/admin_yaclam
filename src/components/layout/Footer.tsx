export function Footer() {
  return (
    <footer className="flex h-auto min-h-11 shrink-0 flex-col items-center justify-between gap-1.5 border-t border-gray-200 bg-white px-4 py-2.5 sm:h-11 sm:flex-row sm:px-5">
      <p className="text-sm text-gray-500">
        © {new Date().getFullYear()}{" "}
        <span className="font-medium text-gray-700">Yaclam</span>. All rights reserved.
      </p>
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <a href="#" className="transition-colors hover:text-gray-700">
          Privacy Policy
        </a>
        <a href="#" className="transition-colors hover:text-gray-700">
          Terms
        </a>
      </div>
    </footer>
  );
}
