import { AppNav } from "@/components/app-nav";
import { PreviewNotice } from "@/components/preview-notice";
import { SubmitForm } from "./submit-form";

export default function SihuSubmitPage() {
  return (
    <>
      <AppNav />
      <main className="flex-1 bg-sand-50">
        <div className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-lake-600">
            SIHU News Hub
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">
            Submit a field report
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-700">
            Post your photo or video publicly first, then fill in this form.
            No file uploads required.
          </p>
          <PreviewNotice>
            Preview mode: reports submitted here are saved in this browser
            only. They are not yet stored in the shared database, so other
            people and other devices will not see them.
          </PreviewNotice>

          <div className="mt-10">
            <SubmitForm />
          </div>
        </div>
      </main>
    </>
  );
}
