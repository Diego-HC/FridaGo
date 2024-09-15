import { Card } from "@tremor/react";
import { HomeIcon, UserIcon, ChartBarIcon } from "@heroicons/react/outline";
import Link from "next/link";

import { LatestPost } from "rbrgs/app/_components/post";
import { getServerAuthSession } from "rbrgs/server/auth";
import { api, HydrateClient } from "rbrgs/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await getServerAuthSession();

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <div>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
          {/* Branding */}
          <h1 className="mb-4 text-5xl font-bold text-[#0278d3]">FridaGo</h1>

          <p className="font-mono text-slate-700 mb-12">
            Revolutionizing your shopping experience.
          </p>
          {/* Login Card */}
          <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-5 text-2xl font-semibold text-gray-800">
              {session ? "Welcome!" : "Sign in"}
            </h2>

            <p className="text-gray-500 text-sm pb-4">
              With FridaGo, store administrators can obtain metrics from their inventory and video footage.
              Customers will be able to navigate the store with ease and find the products they need.
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-md text-black">
                {session && <span className="mb-3">Logged in as {session.user?.name}</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-[#0894ff] text-white px-10 py-3 no-underline transition hover:bg-[#39a9ff]"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div>

          {/* Footer Navbar */}
          {session && (
            <nav className="shadow-t-lg fixed bottom-0 w-full bg-white">
              <ul className="flex justify-around py-4">
                <li>
                  <Link
                    href="/"
                    className="flex flex-col items-center text-black hover:text-blue-500"
                  >
                    <HomeIcon className="h-6 w-6" />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin"
                    className="flex flex-col items-center text-black hover:text-blue-500"
                  >
                    <UserIcon className="h-6 w-6" />
                    <span>Admin</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="flex flex-col items-center text-black hover:text-blue-500"
                  >
                    <ChartBarIcon className="h-6 w-6" />
                    <span>Dashboard</span>
                  </Link>
                </li>
              </ul>
            </nav>
          )}
        </div>

      </div>
    </HydrateClient>
  );
}
