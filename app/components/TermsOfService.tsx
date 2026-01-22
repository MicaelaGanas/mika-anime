"use client"

import React from "react";

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-[#2bd5d5] mb-4">Terms of Service</h1>
        <p className="text-gray-400">Last updated: January 22, 2026</p>
      </div>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          1. Acceptance of Terms
        </h2>
        <p className="text-gray-300 leading-relaxed">
          By accessing and using NyaaReads (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
        </p>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          2. Description of Service
        </h2>
        <p className="text-gray-300 leading-relaxed">
          NyaaReads is a manga reading platform that aggregates content from MangaDex and other publicly available sources. We do not host any manga content on our servers. All manga content is provided through the MangaDex API and is subject to their terms and conditions.
        </p>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          3. User Responsibilities
        </h2>
        <div className="text-gray-300 leading-relaxed space-y-3">
          <p>As a user of this Service, you agree to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Use the Service only for lawful purposes</li>
            <li>Respect the intellectual property rights of content creators</li>
            <li>Not attempt to scrape, download, or redistribute content in bulk</li>
            <li>Not use automated systems or software to extract data from the Service</li>
            <li>Not interfere with or disrupt the Service or servers</li>
          </ul>
        </div>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          4. Content and Copyright
        </h2>
        <div className="text-gray-300 leading-relaxed space-y-3">
          <p>
            All manga content available through MikaReads is sourced from MangaDex. We do not claim ownership of any manga content. All rights belong to their respective creators and publishers.
          </p>
          <p>
            If you believe any content infringes your copyright, please contact the content source directly (MangaDex) as we are merely a frontend interface.
          </p>
        </div>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          5. Bookmarks and Local Storage
        </h2>
        <p className="text-gray-300 leading-relaxed">
          Your bookmarks and reading preferences are stored locally in your browser's local storage. We do not sync this data to any server. If you clear your browser data, your bookmarks will be lost.
        </p>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          6. Disclaimer of Warranties
        </h2>
        <div className="text-gray-300 leading-relaxed space-y-3">
          <p>
            The Service is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>The Service will be uninterrupted or error-free</li>
            <li>Content will always be available or accurate</li>
            <li>Any errors or defects will be corrected</li>
            <li>The Service is free from viruses or harmful components</li>
          </ul>
        </div>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          7. Limitation of Liability
        </h2>
        <p className="text-gray-300 leading-relaxed">
          In no event shall NyaaReads, its developers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service.
        </p>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          8. Third-Party Services
        </h2>
        <p className="text-gray-300 leading-relaxed">
          The Service relies on third-party services (primarily MangaDex API). We are not responsible for the availability, content, or policies of these third-party services. Your use of such services is subject to their respective terms and conditions.
        </p>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          9. Changes to Terms
        </h2>
        <p className="text-gray-300 leading-relaxed">
          We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the Service after changes constitutes acceptance of the modified terms.
        </p>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          10. Educational Purpose
        </h2>
        <p className="text-gray-300 leading-relaxed">
          NyaaReads is an educational project created for learning purposes. It is not intended for commercial use. Users are encouraged to support official manga releases and creators.
        </p>
      </section>

      <section className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-[#2bd5d5] rounded-full"></span>
          11. Contact
        </h2>
        <p className="text-gray-300 leading-relaxed">
          For questions about these Terms of Service, please contact us through the About page or visit our GitHub repository.
        </p>
      </section>

      <div className="bg-[#2bd5d5]/10 border border-[#2bd5d5]/30 rounded-lg p-6 mt-8">
        <p className="text-sm text-gray-300 text-center">
          By using NyaaReads, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </p>
      </div>
    </div>
  );
}
