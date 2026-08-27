import { PatientSelfService } from "@/components/patient/self-service";

export default async function PatientSelfServicePage({ params }: PageProps<"/q/[slug]">) {
  const { slug } = await params;
  return (
    <div className="min-h-screen bg-surface-muted px-4 py-12">
      <PatientSelfService slug={slug} />
    </div>
  );
}
