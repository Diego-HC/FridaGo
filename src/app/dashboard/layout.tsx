import "rbrgs/styles/globals.css";

// import { GeistSans } from "geist/font/sans";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <div className="fixed flex h-16 w-screen items-center justify-center bg-slate-400 text-white">
        <h3 className="text-3xl">FridaGo</h3>
      </div>
      <div className="flex h-16 w-screen" />
      <div>{children}</div>
    </div>
  );
}
