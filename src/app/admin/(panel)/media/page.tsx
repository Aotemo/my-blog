import type { Metadata } from "next";
import { MediaLibrary } from "@/components/admin/media-library";
import { getMediaLibrary, type MediaFilter } from "@/lib/media";

export const metadata: Metadata = {
  title: "媒体库",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ filter?: string }> };

export default async function AdminMediaPage({ searchParams }: Props) {
  const { filter } = await searchParams;
  const activeFilter: MediaFilter =
    filter === "used" || filter === "unused" ? filter : "all";
  const library = await getMediaLibrary(activeFilter);

  return (
    <MediaLibrary
      key={activeFilter}
      files={library.files}
      summary={library.summary}
      filter={activeFilter}
    />
  );
}
