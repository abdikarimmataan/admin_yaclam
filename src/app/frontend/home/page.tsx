import { HomePageEditor } from "@/app/frontend/components/HomePageEditor";
import { SiteLogoEditor } from "@/app/frontend/components/SiteLogoEditor";

export default function Page() {
  return (
    <div className="space-y-8">
      <SiteLogoEditor />
      <HomePageEditor />
    </div>
  );
}
