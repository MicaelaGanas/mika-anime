"use client"

import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-[#2bd5d5] mb-4">Privacy Policy</h1>
        <p className="text-gray-400">Last updated: January 22, 2026</p>
      </div>

      <div className="bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 rounded-lg p-6 mb-8">
        <p className="text-gray-300 leading-relaxed">
          <strong className="text-white">TL;DR:</strong> NyaaReads does not collect, store, or share any personal information. All your data stays on your device. We don't use cookies, analytics, or tracking of any kind.
        </p>
      </div>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          1. Information We Collect
        </h2>
        <div className="text-gray-300 leading-relaxed space-y-3">
          <p className="font-semibold text-white">We do not collect any personal information.</p>
          <p>
            NyaaReads is designed with privacy in mind. We do not have user accounts, databases, or any backend infrastructure that collects user data.
          </p>
        </div>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          2. Local Storage
        </h2>
        <div className="text-gray-300 leading-relaxed space-y-3">
          <p>
            The only data stored is kept locally in your browser using Local Storage technology. This includes:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong className="text-white">Bookmarks:</strong> Your saved manga titles</li>
            <li><strong className="text-white">Reading Progress:</strong> Which chapters you've read</li>
            <li><strong className="text-white">Theme Preferences:</strong> Your dark/light mode selection</li>
            <li><strong className="text-white">Search History:</strong> Recent searches (stored locally)</li>
          </ul>
          <p className="mt-3">
            This data never leaves your device and is not accessible to us or anyone else. You can clear this data at any time through your browser settings.
          </p>
        </div>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          3. Third-Party Services
        </h2>
        <div className="text-gray-300 leading-relaxed space-y-3">
          <p>
            MikaReads connects to the following third-party services:
          </p>
          <div className="space-y-4 mt-4">
            <div className="bg-[#040506] border border-gray-800 rounded p-4">
              <h3 className="font-semibold text-white mb-2">MangaDex API</h3>
              <p className="text-sm">
                We fetch manga data and content from MangaDex's public API. When you use our service, requests are made to MangaDex servers. Please review <a href="https://mangadex.org/privacy" target="_blank" rel="noopener noreferrer" className="text-[#2bd5d5] hover:underline">MangaDex's Privacy Policy</a> for information about their data practices.
              </p>
            </div>
            <div className="bg-[#040506] border border-gray-800 rounded p-4">
              <h3 className="font-semibold text-white mb-2">Image Proxy</h3>
              <p className="text-sm">
                Manga cover images and chapter pages are proxied through our server to avoid CORS issues. We do not log, store, or analyze these requests.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          4. Cookies and Tracking
        </h2>
        <div className="text-gray-300 leading-relaxed space-y-3">
          <p className="font-semibold text-white">We do not use cookies or tracking technologies.</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>No analytics tools (no Google Analytics, no third-party trackers)</li>
            <li>No advertising networks</li>
            <li>No social media tracking pixels</li>
            <li>No fingerprinting or cross-site tracking</li>
          </ul>
        </div>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          5. Server Logs
        </h2>
        <p className="text-gray-300 leading-relaxed">
          Our hosting provider may collect standard server logs (IP addresses, request times, URLs accessed) for security and performance monitoring purposes. These logs are temporary and are not used for tracking individual users.
        </p>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          6. Data Sharing
        </h2>
        <div className="text-gray-300 leading-relaxed space-y-3">
          <p className="font-semibold text-white">We do not share any data because we don't collect any.</p>
          <p>
            Since we don't collect personal information, there is nothing to share, sell, or transfer to third parties.
          </p>
        </div>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          7. Children's Privacy
        </h2>
        <p className="text-gray-300 leading-relaxed">
          MikaReads does not knowingly collect information from anyone. However, some manga content may not be appropriate for children. Parental supervision is recommended.
        </p>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          8. Your Rights
        </h2>
        <div className="text-gray-300 leading-relaxed space-y-3">
          <p>Since we don't collect personal data, you have complete control:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong className="text-white">Access:</strong> All your data is in your browser's local storage</li>
            <li><strong className="text-white">Delete:</strong> Clear your browser's local storage to delete all data</li>
            <li><strong className="text-white">Export:</strong> You can manually export your bookmarks from the browser's developer tools</li>
          </ul>
        </div>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          9. Security
        </h2>
        <p className="text-gray-300 leading-relaxed">
          While we implement reasonable security measures for our service, all your personal data (bookmarks, preferences) is stored locally on your device. We recommend using up-to-date browsers and keeping your device secure.
        </p>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          10. Changes to Privacy Policy
        </h2>
        <p className="text-gray-300 leading-relaxed">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.
        </p>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          11. Open Source
        </h2>
        <p className="text-gray-300 leading-relaxed">
          NyaaReads is an open-source project. You can review our code to verify our privacy practices. We believe in transparency and welcome community audits of our privacy claims.
        </p>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          12. Contact
        </h2>
        <p className="text-gray-300 leading-relaxed">
          If you have questions about this Privacy Policy, please contact us through the About page or our GitHub repository.
        </p>
      </section>

      <div className="bg-gradient-to-r from-[#2bd5d5]/10 to-transparent border-l-4 border-[#2bd5d5] rounded-lg p-6 mt-8">
        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#2bd5d5]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Summary
        </h3>
        <p className="text-sm text-gray-300">
          Your privacy is important. NyaaReads is designed to be privacy-first: no tracking, no data collection, no cookies. Everything stays on your device.
        </p>
      </div>
    </div>
  );
}
