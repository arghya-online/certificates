"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  CheckCircle2,
  Download,
  FileBadge,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { participants } from "../data/participants";

export default function Home() {
  const [search, setSearch] = useState("");
  const [loadingName, setLoadingName] = useState<string | null>(null);
  const [completedName, setCompletedName] = useState<string | null>(null);

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
      setCompletedName(name);
    } catch (error) {
      console.error(error);

      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoadingName(null);
    }
  }

  return (
    <main className="saas-app">
      <header className="saas-nav">
        <div className="saas-brand">
          <div className="saas-logo">
            <FileBadge size={18} />
          </div>
          <div>
            <strong>Certify</strong>
            <span>IEI IEM STUDENTS&apos; CHAPTER PORTAL</span>
          </div>
        </div>
        <Image
          src="/image.png"
          alt="The Institution of Engineers (India)"
          width={886}
          height={155}
          priority
          className="saas-masthead"
        />
      </header>

      <div className="saas-layout">
        <aside className="saas-sidebar">
          <p className="sidebar-label">Workspace</p>
          <div className="sidebar-link active">
            <FileBadge size={16} /> Certificates{" "}
            <span>{participants.length}</span>
          </div>
          <p className="sidebar-label sidebar-label-lower">Event</p>
          <div className="event-sidebar">
            <strong>IoT Based Application Workshop</strong>
            <span>IEI IEM Students&apos; Chapter</span>
          </div>
        </aside>

        <div className="saas-content">
          <section className="saas-heading">
            <div>
              <p className="saas-eyebrow">Certificate workspace</p>
              <h1>Find your certificate</h1>
              <p>
                Search your name and download your official participation
                certificate.
              </p>
            </div>
            <div className="event-chip">
              <span>Event</span>
              <strong>IoT Based Application Workshop</strong>
            </div>
          </section>

          <section className="saas-stats">
            <div>
              <span>Organized by</span>
              <strong>IEI IEM STUDENTS CHAPTER</strong>
              <small className="font-bold">
                Department of Mechanical Engineering
              </small>
            </div>
          </section>

          <section className="certificate-card">
            <div className="card-toolbar">
              <div>
                <h2>Participant certificates</h2>
                <p>Institute of Engineering and Management, Kolkata</p>
              </div>
              <span className="record-pill">
                {filteredParticipants.length}{" "}
                {filteredParticipants.length === 1 ? "record" : "records"}
              </span>
            </div>
            <div className="directory-tools">
              <div className="relative w-full sm:max-w-md">
                <Search size={17} className="search-icon" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search participant name..."
                  className="directory-search"
                />
              </div>
              {search && (
                <button onClick={() => setSearch("")} className="clear-search">
                  Clear search
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
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Download size={16} />
                      )}
                      <span>
                        {loadingName === name ? "Preparing" : "Download"}
                      </span>
                      <ArrowUpRight size={14} className="button-arrow" />
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
          </section>

          <footer className="saas-footer">
            <span>IEI IEM Students&apos; Chapter</span>
            <span>
              Department of Mechanical Engineering · Institute of Engineering
              and Management, Kolkata
            </span>
          </footer>
        </div>
      </div>

      {completedName && (
        <div
          className="success-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <div className="success-modal">
            <button
              className="modal-close"
              onClick={() => setCompletedName(null)}
              aria-label="Close congratulations message"
            >
              <X size={18} />
            </button>
            <div className="success-symbol">
              <CheckCircle2 size={28} />
            </div>
            <p className="success-kicker">Certificate downloaded</p>
            <h2 id="success-title">
              Congratulations, {completedName.split(" ")[0]}!
            </h2>
            <p>
              Your official participation certificate for the IoT Based
              Application Workshop is ready in your downloads.
            </p>
            <button
              className="modal-action"
              onClick={() => setCompletedName(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
