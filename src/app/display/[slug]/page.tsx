import { DisplayBoard } from "@/components/patient/display-board";

export default async function DisplayBoardPage({ params }: PageProps<"/display/[slug]">) {
  const { slug } = await params;
  return <DisplayBoard slug={slug} />;
}
