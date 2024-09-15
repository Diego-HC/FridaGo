import "rbrgs/styles/globals.css";

// import { GeistSans } from "geist/font/sans";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <div className="flex pt-12 pl-12 pb-6 w-screen items-center bg-slate-50 text-white">
        <h1 className="text-5xl font-bold text-[#0278d3]">FridaGo</h1>
        {/* <h3 className="text-3xl">FridaGo</h3> */}
      </div>
      {/* <div className="flex h-16 w-screen" /> */}
      <div className="bg-slate-50">{children}</div>
    </div>
  );
}
