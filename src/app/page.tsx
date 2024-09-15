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
          <h1 className="mb-8 text-4xl font-bold text-[#0278d3]">FridaGo</h1>

          {/* Login Card */}
          <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              {session ? "Welcome!" : "Sign in"}
            </h2>

            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-black">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-black/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
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

        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
              Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
            </h1>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
              <Link
                className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
                href="https://create.t3.gg/en/usage/first-steps"
                target="_blank"
              >
                <h3 className="text-2xl font-bold">First Steps →</h3>
                <div className="text-lg">
                  Just the basics - Everything you need to know to set up your
                  database and authentication.
                </div>
              </Link>

              <Link
                className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
                href="https://create.t3.gg/en/introduction"
                target="_blank"
              >
                <h3 className="text-2xl font-bold">Documentation →</h3>
                <div className="text-lg">
                  Learn more about Create T3 App, the libraries it uses, and how
                  to deploy it.
                </div>
              </Link>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-2xl text-white">
                {hello ? hello.greeting : "Loading tRPC query..."}
              </p>

              <div className="flex flex-col items-center justify-center gap-4">
                <p className="text-center text-2xl text-white">
                  {session && <span>Logged in as {session.user?.name}</span>}
                </p>
                <Link
                  href={session ? "/api/auth/signout" : "/api/auth/signin"}
                  className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                >
                  {session ? "Sign out" : "Sign in"}
                </Link>
              </div>

              {session && (
                <Link
                  href="/login"
                  className="mt-4 rounded-full bg-blue-500 px-6 py-3 text-lg font-semibold text-white transition hover:bg-blue-600"
                >
                  Login
                </Link>
              )}
            </div>
            <Link
              href="/navigator"
              className="mt-4 rounded-full bg-blue-500 px-6 py-3 text-lg font-semibold text-white transition hover:bg-blue-600"
            >
              Go to Camera
            </Link>

            {session?.user && <LatestPost />}
          </div>
          {session && (
            <footer>
              <nav className="hidden space-x-6 sm:flex">
                <Link
                  href="/"
                  className="text-white transition-colors duration-300 hover:text-blue-500"
                >
                  Home
                </Link>
                <Link
                  href="/admin"
                  className="text-white transition-colors duration-300 hover:text-blue-500"
                >
                  Admin
                </Link>
                <Link
                  href="/dashboard"
                  className="text-white transition-colors duration-300 hover:text-blue-500"
                >
                  Dashboard
                </Link>
              </nav>
              <div className="relative my-4 flex flex-row sm:hidden">
                <Card className="w-full max-w-md bg-white">
                  <ul className="flex flex-row justify-around py-4">
                    <li>
                      <Link href="/">
                        <HomeIcon className="h-6 w-6 text-black hover:text-blue-400" />
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin">
                        <UserIcon className="h-6 w-6 text-black hover:text-blue-400" />
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard">
                        <ChartBarIcon className="h-6 w-6 text-black hover:text-blue-400" />
                      </Link>
                    </li>
                  </ul>
                </Card>
              </div>
            </footer>
          )}
        </main>
      </div>
    </HydrateClient>
  );
}
