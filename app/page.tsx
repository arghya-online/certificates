"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Download, Loader2, Search } from "lucide-react";
import { participants } from "../data/participants";

export default function Home() {
  const [search, setSearch] = useState("");
  const [loadingName, setLoadingName] = useState<string | null>(null);

  const filteredParticipants = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return participants;
    }

    return participants.filter((name) => name.toLowerCase().includes(query));
  }, [search]);

  async function downloadCertificate(name: string) {
    try {
      setLoadingName(name);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);

        throw new Error(error?.error || "Unable to generate certificate");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${name}-certificate.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);

      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoadingName(null);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f3eee5] text-[#14202a]">
      <section className="event-intro mx-auto max-w-7xl px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14">
        <p className="section-kicker">
          IEI IEM Students&apos; Chapter presents
        </p>
        <h1>IoT Based Application Workshop</h1>
        <div className="event-details">
          <span>Official participation certificates</span>
          <span>Department of Mechanical Engineering</span>
          <span>Institute of Engineering and Management, Kolkata</span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24">
        <div className="directory-heading">
          <div>
            <p className="section-kicker">The roll of honour</p>
            <h2>Find your certificate</h2>
          </div>
          <p className="section-note">
            Search the verified participant register
            <br className="hidden sm:block" /> and download your signed digital
            copy.
          </p>
        </div>

        <div className="directory-shell">
          <div className="directory-tools">
            <div className="relative w-full sm:max-w-md">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type a participant name"
                className="directory-search"
              />
            </div>
            <span className="directory-count">
              {filteredParticipants.length}{" "}
              {filteredParticipants.length === 1 ? "record" : "records"}
            </span>
            {search && (
              <button onClick={() => setSearch("")} className="clear-search">
                Clear
              </button>
            )}
          </div>

          <div className="participant-list">
            {filteredParticipants.length > 0 ? (
              filteredParticipants.map((name, index) => (
                <div key={name} className="participant-row">
                  <div className="participant-id">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <p>{name}</p>
                  <button
                    onClick={() => downloadCertificate(name)}
                    disabled={loadingName !== null}
                    className="download-button"
                  >
                    {loadingName === name ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Download size={17} />
                    )}
                    <span>
                      {loadingName === name ? "Preparing" : "Get certificate"}
                    </span>
                    <ArrowUpRight size={15} className="button-arrow" />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Search size={22} />
                <h3>No participant found</h3>
                <p>Try checking the spelling of the name.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <span>IEI IEM Students&apos; Chapter</span>
        <span>Department of Mechanical Engineering · Kolkata</span>
        <span>© 2025</span>
      </footer>
    </main>
  );
}
