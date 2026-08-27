import { TokenTracker } from "@/components/patient/token-tracker";

export default async function TokenTrackingPage({ params }: PageProps<"/q/[slug]/token/[tokenId]">) {
  const { slug, tokenId } = await params;
  return (
    <div className="min-h-screen bg-surface-muted px-4 py-12">
      <TokenTracker slug={slug} tokenId={tokenId} />
    </div>
  );
}
