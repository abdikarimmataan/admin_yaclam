import { HomePageEditor } from "@/app/frontend/components/HomePageEditor";
import { SiteBrandingEditor } from "@/app/frontend/components/SiteBrandingEditor";

export default function Page() {
  return (
    <div className="space-y-8">
      <SiteBrandingEditor />
      <HomePageEditor />
    </div>
  );
}
