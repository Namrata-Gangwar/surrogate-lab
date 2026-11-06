import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Surrogate Lab — Engineering, accelerated",
  description: "Explore bracket designs with an interactive stress field and browser-based surrogate workflow.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
