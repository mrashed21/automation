"use client";

import { useGetContentsQuery } from "@/features/content/api/content-api";
import {
  useConnectSocialAccountMutation,
  useDisconnectSocialAccountMutation,
  useGetConnectedAccountsQuery,
} from "@/features/publishing/api/publishing-api";
import type { ContentDto, PublishingPlatform } from "@repo/types";
import Link from "next/link";
import React, { useState } from "react";

export default function PublishingPage() {
  const { data: accounts = [], isLoading: isLoadingAccounts } = useGetConnectedAccountsQuery();
  const { data: contentsData, isLoading: isLoadingContents } = useGetContentsQuery({ limit: 50 });
  const [connectAccount, { isLoading: isConnecting }] = useConnectSocialAccountMutation();
  const [disconnectAccount, { isLoading: isDisconnecting }] = useDisconnectSocialAccountMutation();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [platform, setPlatform] = useState<PublishingPlatform>("youtube");
  const [accountName, setAccountName] = useState("");
  const [authCode, setAuthCode] = useState("");

  const publishedItems: ContentDto[] = (contentsData?.data || []).filter(
    (c: ContentDto) => c.status === "published" || c.status === "scheduled" || c.status === "ready",
  );

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim() || !authCode.trim()) return;

    try {
      await connectAccount({
        platform,
        accountName: accountName.trim(),
        authCode: authCode.trim(),
      }).unwrap();

      setIsConnectModalOpen(false);
      setAccountName("");
      setAuthCode("");
    } catch {
      // Handled by RTK
    }
  };

  const handleDisconnect = async (id: string) => {
    if (confirm("Are you sure you want to disconnect this social channel?")) {
      try {
        await disconnectAccount(id).unwrap();
      } catch {
        // Handled by RTK
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "28px 32px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #ef4444, #f59e0b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            📡
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              Social Publishing Hub
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
              Multi-platform social accounts, scheduled queues, and instant distribution
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsConnectModalOpen(true)}
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
          }}
        >
          <span>+</span> Connect Channel / Account
        </button>
      </div>

      {/* Connected Accounts Section */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 14px", color: "var(--text-primary)" }}>
          Connected Social Channels ({accounts.length})
        </h2>

        {isLoadingAccounts ? (
          <div style={{ height: "90px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", animation: "pulse 1.5s infinite" }} />
        ) : accounts.length === 0 ? (
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.1)",
              borderRadius: "14px",
              padding: "32px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📺</div>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
              No social accounts connected yet. Link your YouTube Channel or Facebook Page to enable automated publishing.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
            {accounts.map((acc) => {
              const isYT = acc.platform === "youtube";
              return (
                <div
                  key={acc.id}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: isYT ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)",
                        color: isYT ? "#f87171" : "#60a5fa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: 700,
                      }}
                    >
                      {isYT ? "▶" : "f"}
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {acc.accountName}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "capitalize" }}>
                        {acc.platform} • Connected
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDisconnect(acc.id)}
                    disabled={isDisconnecting}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#f87171",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "11px",
                      cursor: isDisconnecting ? "not-allowed" : "pointer",
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Publications & Scheduled Queue */}
      <div>
        <h2 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 14px", color: "var(--text-primary)" }}>
          Publishing Queue & Pipeline Distribution ({publishedItems.length})
        </h2>

        {isLoadingContents ? (
          <div style={{ height: "180px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", animation: "pulse 1.5s infinite" }} />
        ) : publishedItems.length === 0 ? (
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.1)",
              borderRadius: "14px",
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🚀</div>
            <h3 style={{ margin: "0 0 4px", fontSize: "15px", color: "var(--text-primary)" }}>
              No Scheduled or Published Content
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
              Produce videos in your Content Library or Autonomous Strategist to distribute across social channels.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {publishedItems.map((item: ContentDto) => (
              <div
                key={item.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    style={{
                      background:
                        item.status === "published"
                          ? "rgba(34,197,94,0.15)"
                          : item.status === "scheduled"
                            ? "rgba(99,102,241,0.15)"
                            : "rgba(245,158,11,0.15)",
                      color:
                        item.status === "published"
                          ? "#22c55e"
                          : item.status === "scheduled"
                            ? "#818cf8"
                            : "#f59e0b",
                      border: `1px solid ${item.status === "published"
                          ? "rgba(34,197,94,0.3)"
                          : item.status === "scheduled"
                            ? "rgba(99,102,241,0.3)"
                            : "rgba(245,158,11,0.3)"
                        }`,
                      borderRadius: "6px",
                      padding: "3px 8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {item.status}
                  </span>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Type: {item.contentType} • Language: {item.language}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/dashboard/content/${item.id}`}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "var(--text-primary)",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Open Publishing Studio →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {isConnectModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsConnectModalOpen(false);
          }}
        >
          <div
            style={{
              background: "var(--sidebar-bg, rgba(13,13,18,0.97))",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "18px",
              padding: "26px",
              width: "100%",
              maxWidth: "460px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Connect Social Platform
              </h2>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConnectSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase" }}>
                  Platform Target
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {(["youtube", "facebook"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      style={{
                        flex: 1,
                        background: platform === p ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${platform === p ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: "8px",
                        padding: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        color: platform === p ? "#818cf8" : "var(--text-muted)",
                        textTransform: "capitalize",
                      }}
                    >
                      {p === "youtube" ? "YouTube Channel" : "Facebook Page"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600, textTransform: "uppercase" }}>
                  Channel / Page Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. AI Trends Daily"
                  required
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "9px 12px",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600, textTransform: "uppercase" }}>
                  OAuth Authorization Code / Key
                </label>
                <input
                  type="password"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="OAuth Auth Code"
                  required
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "9px 12px",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    color: "var(--text-muted)",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConnecting}
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 18px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: isConnecting ? "not-allowed" : "pointer",
                  }}
                >
                  {isConnecting ? "Saving Connection..." : "Save Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
