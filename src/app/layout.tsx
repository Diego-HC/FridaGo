import "rbrgs/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "rbrgs/trpc/react";
import { SessionProvider } from "next-auth/react";
import SessionWrapper from "./SessionWrapper";

export const metadata: Metadata = {
  title: "FridaGo",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  // manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <SessionWrapper>{children}</SessionWrapper>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
