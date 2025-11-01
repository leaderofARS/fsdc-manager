"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => subscription?.subscription.unsubscribe();
  }, [supabase]);

  return (
    <main className="flex flex-col min-h-screen bg-white text-gray-800 dark:bg-[#0d0d0d] dark:text-gray-100 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-24 px-6 text-center overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-500 text-white dark:from-indigo-900 dark:via-blue-950 dark:to-purple-900">
        <div className="max-w-3xl mx-auto z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
            Build • Collaborate • Deliver
          </h1>

          {user ? (
            <p className="text-xl md:text-2xl mb-8 text-gray-100 dark:text-gray-200">
              Welcome back,{" "}
              <span className="font-semibold">
                {user.user_metadata?.full_name || user.email?.split("@")[0]}
              </span>
              👋 — ready to keep building?
            </p>
          ) : (
            <p className="text-xl md:text-2xl mb-8 text-gray-100 dark:text-gray-200">
              Welcome to <span className="font-semibold">FSDC</span> — your all-in-one
              place for managing club projects, members, and events.
            </p>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {user ? (
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 dark:bg-gray-100 dark:text-indigo-700 font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <Link
                  href="/create-account"
                  className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 dark:bg-gray-100 dark:text-indigo-700 font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/login"
                  className="border border-white/80 dark:border-gray-300 text-white dark:text-gray-200 font-semibold px-8 py-3 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800 transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="absolute inset-0 opacity-10 bg-[url('/bg-grid.svg')] bg-center bg-cover"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-transparent transition-colors">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            What You Can Do
          </h2>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-2">
            {[
              {
                title: "Project Dashboard",
                desc: "Visualize all your club’s projects clearly and stay organized.",
                icon: "🗂️",
              },
              {
                title: "Team & Roles",
                desc: "Assign tasks, manage members, and collaborate efficiently.",
                icon: "👥",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="rounded-2xl p-8 text-center border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-indigo-500 dark:hover:border-indigo-600 transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2">
          <Image
            src="https://wplxxeanbifsazydyljw.supabase.co/storage/v1/object/public/avatars/bg-grid.jpg"
            draggable="false"
            alt="Team collaboration"
            width={500}
            height={400}
            className="rounded-xl shadow-lg object-cover w-full h-auto"
          />
        </div>
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl font-bold mb-4">About Us</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-400">
            We’re a community of developers and innovators building tools that make
            club project management simpler, transparent, and fun.
          </p>
          <p className="text-gray-700 dark:text-gray-400">
            Whether you’re organizing an event or leading a new project — 
            Full Stack Development Club helps you manage everything in one place.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm bg-gray-100 dark:bg-gray-950 text-gray-600 dark:text-gray-400 transition-colors">
        <p>© {new Date().getFullYear()} Full-Stack Development Club. All rights reserved.</p>
        <p className="mt-2">Built with ❤️ by Full-Stack Development Club</p>
      </footer>
    </main>
  );
}
