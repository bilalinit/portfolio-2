import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Cursor from "@/components/Cursor";
import AllWork from "@/components/AllWork";
import { allWork, workCategories } from "@/data/projects";

/* /work/category/[slug] — the work drop-down's category links land here
   (Website [7], Mobile App [4], …). Same grid as /work, pre-filtered,
   with a clear-filter chip back to the full grid. */

interface CategoryProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return workCategories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({
  params,
}: CategoryProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = workCategories.find((c) => c.slug === slug);
  if (!cat) return {};
  return {
    title: `${cat.label} work — MIZU`,
    description: `${cat.count} ${cat.label.toLowerCase()} projects by MIZU — move fast, build to last.`,
  };
}

export default async function CategoryPage({ params }: CategoryProps) {
  const { slug } = await params;
  const cat = workCategories.find((c) => c.slug === slug);
  if (!cat) notFound();

  const items = allWork.filter((work) => work.category === cat.label);

  return (
    <>
      <Cursor />
      <AllWork items={items} activeCategory={cat.label} />
    </>
  );
}
