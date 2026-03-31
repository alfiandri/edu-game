"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function Home() {
  const { t } = useTranslation();

  const FEATURES = [
    { emoji: "🎮", title: t.landing.featureFunTitle, description: t.landing.featureFunDesc },
    { emoji: "🧠", title: t.landing.featureAdaptiveTitle, description: t.landing.featureAdaptiveDesc },
    { emoji: "🏆", title: t.landing.featureGamificationTitle, description: t.landing.featureGamificationDesc },
    { emoji: "📊", title: t.landing.featureDashboardTitle, description: t.landing.featureDashboardDesc },
    { emoji: "🗺️", title: t.landing.featureMapTitle, description: t.landing.featureMapDesc },
    { emoji: "🤖", title: t.landing.featureTutorTitle, description: t.landing.featureTutorDesc },
  ];

  const AGE_TIERS = [
    { range: "3-5", label: t.landing.preschool, emoji: "🧒", color: "from-pink-400 to-rose-500" },
    { range: "6-8", label: t.landing.earlyElementary, emoji: "👧", color: "from-blue-400 to-indigo-500" },
    { range: "9-12", label: t.landing.upperElementary, emoji: "🧑", color: "from-green-400 to-emerald-500" },
  ];

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
            <span className="text-2xl font-bold">{t.common.eduGame}</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher className="border-white/30 hover:bg-white/10 [&_span]:text-white" />
            <Link
              href="/auth/login"
              className="px-5 py-2 rounded-xl font-bold text-white/90 hover:text-white transition-colors"
            >
              {t.common.logIn}
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2.5 rounded-xl font-bold bg-white text-purple-700 hover:bg-purple-50 transition-colors shadow-lg"
            >
              {t.common.signUp}
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
            {t.landing.heroTitle1}
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              {t.landing.heroTitle2}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto mb-10"
          >
            {t.landing.heroDescription}
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
              {t.landing.startLearning}
            </Link>
            <Link
              href="#features"
              className="px-10 py-4 rounded-2xl font-bold text-lg bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 transition-all"
            >
              {t.landing.seeHowItWorks}
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Age Groups */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
          {t.landing.designedForEveryAge}
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
              <h3 className="text-2xl font-bold mb-1">{t.common.ages} {tier.range}</h3>
              <p className="text-white/80 font-medium">{tier.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            {t.landing.whyKidsLove}
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            {t.landing.whyKidsLoveDescription}
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
          {t.landing.twoSubjects}
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 shadow-lg"
          >
            <span className="text-6xl block mb-4">🧮</span>
            <h3 className="text-2xl font-bold text-blue-800 mb-2">
              {t.landing.mathematics}
            </h3>
            <p className="text-blue-700">
              {t.landing.mathDescription}
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 shadow-lg"
          >
            <span className="text-6xl block mb-4">💻</span>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              {t.landing.codingLogic}
            </h3>
            <p className="text-green-700">
              {t.landing.codingDescription}
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">
            {t.landing.readyTitle}
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            {t.landing.readyDescription}
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-12 py-5 rounded-2xl font-bold text-xl bg-gradient-to-b from-yellow-400 to-orange-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            {t.landing.getStarted}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-lg font-bold text-white">{t.common.eduGame}</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} {t.common.eduGame}. {t.landing.footerTagline}
          </p>
        </div>
      </footer>
    </div>
  );
}
