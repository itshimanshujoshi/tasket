import TechniqueClient from "./TechniqueClient";

export default async function TechniquePage({
  params,
}: {
  params: Promise<{ techniqueName: string }>;
}) {
  const { techniqueName } = await params; // ✅ unwrap params safely
  return <TechniqueClient techniqueName={techniqueName} />;
}
