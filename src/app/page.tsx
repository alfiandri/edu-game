"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const FEATURES = [
  {
    emoji: "🎮",
    title: "Fun Game-Based Learning",
    description:
      "Math and coding come alive through interactive games designed for ages 3-12.",
  },
  {
    emoji: "🧠",
    title: "Adaptive Difficulty",
    description:
      "Our smart system adjusts to your child's level in real-time — never too easy, never too hard.",
  },
  {
    emoji: "🏆",
    title: "Gamification & Rewards",
    description:
      "XP, badges, streaks, leaderboards, and a virtual shop keep kids motivated and coming back.",
  },
  {
    emoji: "📊",
    title: "Parent Dashboard",
    description:
      "Track progress, view insights on strengths and areas for growth, and set learning goals.",
  },
  {
    emoji: "🗺️",
    title: "Adventure Map",
    description:
      "Explore a story-based learning path with game nodes, boss battles, and rewards.",
  },
  {
    emoji: "🤖",
    title: "Interactive Tutor",
    description:
      "Encouraging hints, explanations, and celebrations guide your child through every challenge.",
  },
];

const AGE_TIERS = [
  { range: "3-5", label: "Preschool", emoji: "🧒", color: "from-pink-400 to-rose-500" },
  { range: "6-8", label: "Early Elementary", emoji: "👧", color: "from-blue-400 to-indigo-500" },
  { range: "9-12", label: "Upper Elementary", emoji: "🧑", color: "from-green-400 to-emerald-500" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl animate-bounce" style={{ animationDelay: "0s" }}>🌟</div>
          <div className="absolute top-32 right-20 text-6xl animate-bounce" style={{ animationDelay: "0.5s" }}>🚀</div>
          <div className="absolute bottom-20 left-1/4 text-7xl animate-bounce" style={{ animationDelay: "1s" }}>🎯</div>
          <div className="absolute bottom-10 right-1/3 text-5xl animate-bounce" style={{ animationDelay: "1.5s" }}>💡</div>
        </div>

        <nav className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎓</span>
            <span className="text-2xl font-bold">EduGame</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="px-5 py-2 rounded-xl font-bold text-white/90 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2.5 rounded-xl font-bold bg-white text-purple-700 hover:bg-purple-50 transition-colors shadow-lg"
            >
              Sign Up Free
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
          >
            Make Learning an
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Adventure! 🚀
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto mb-10"
          >
            An educational game platform where children ages 3-12 learn Math and
            Coding through play, with adaptive difficulty and real-time insights
            for parents.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/auth/register"
              className="px-10 py-4 rounded-2xl font-bold text-lg bg-gradient-to-b from-yellow-400 to-orange-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Start Learning Free 🎮
            </Link>
            <Link
              href="#features"
              className="px-10 py-4 rounded-2xl font-bold text-lg bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 transition-all"
            >
              See How It Works
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Age Groups */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Designed for Every Age
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {AGE_TIERS.map((tier, i) => (
            <motion.div
              key={tier.range}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`p-8 rounded-3xl bg-gradient-to-br ${tier.color} text-white text-center shadow-xl`}
            >
              <span className="text-5xl block mb-3">{tier.emoji}</span>
              <h3 className="text-2xl font-bold mb-1">Ages {tier.range}</h3>
              <p className="text-white/80 font-medium">{tier.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Why Kids Love EduGame
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Everything your child needs to learn, grow, and have fun — all in
            one place.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-md hover:shadow-xl transition-shadow"
              >
                <span className="text-4xl block mb-4">{feature.emoji}</span>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Start With Two Exciting Subjects
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 shadow-lg"
          >
            <span className="text-6xl block mb-4">🧮</span>
            <h3 className="text-2xl font-bold text-blue-800 mb-2">
              Mathematics
            </h3>
            <p className="text-blue-700">
              From counting to algebra — interactive exercises that adapt to your
              child&apos;s level. Visual aids, puzzles, and instant feedback make
              math fun!
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 shadow-lg"
          >
            <span className="text-6xl block mb-4">💻</span>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Coding & Logic
            </h3>
            <p className="text-green-700">
              Pattern recognition, sequencing, and block-based programming
              build computational thinking from an early age.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Make Learning Fun? 🎉
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of families who are transforming education into an
            adventure.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-12 py-5 rounded-2xl font-bold text-xl bg-gradient-to-b from-yellow-400 to-orange-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            Get Started — It&apos;s Free! 🚀
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-lg font-bold text-white">EduGame</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} EduGame. Making learning an adventure.
          </p>
        </div>
      </footer>
    </div>
  );
}
