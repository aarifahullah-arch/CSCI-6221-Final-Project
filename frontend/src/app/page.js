"use client";

import WebsiteHome from "./components/WebsiteHome";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <WebsiteHome
      onNavigateToUpload={() => router.push("/upload")}
      onNavigateToRankings={() => router.push("/rankings")}
    />
  );
}