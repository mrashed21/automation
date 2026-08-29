"use client";

import React, { useState } from "react";
import {
  useGetConnectedAccountsQuery,
  useConnectSocialAccountMutation,
  useDisconnectSocialAccountMutation,
  useGetContentPublicationsQuery,
  usePublishNowMutation,
  useSchedulePublicationMutation,
} from "../api/publishing-api";
import type {
  ContentDto,
  PublishingPlatform,
  PublicationPrivacy,
} from "@repo/types";

interface PublishingTabViewProps {
  content: ContentDto;
}

export function PublishingTabView({ content }: PublishingTabViewProps) {
  const { data: accounts = [], isLoading: isLoadingAccounts } = useGetConnectedAccountsQuery();
  const { data: publications = [], isLoading: isLoadingPubs } = useGetContentPublicationsQuery(content.id);

  const [connectAccount, { isLoading: isConnecting }] = useConnectSocialAccountMutation();
  const [disconnectAccount] = useDisconnectSocialAccountMutation();
  const [publishNow, { isLoading: isPublishing }] = usePublishNowMutation();
  const [schedulePublication, { isLoading: isScheduling }] = useSchedulePublicationMutation();

  // Publishing form state
  const [selectedPlatform, setSelectedPlatform] = useState<PublishingPlatform>("youtube");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [title, setTitle] = useState(content.title || "");
  const [description, setDescription] = useState(
    content.description ||
      `Watch this episode on ${content.title}!\n\n#AI #Technology #Automation #Future`,
  );
  const [tagsInput, setTagsInput] = useState("ai, automation, innovation, tech");
  const [privacyStatus, setPrivacyStatus] = useState<PublicationPrivacy>("public");
  const [category, setCategory] = useState("28"); // Science & Technology
  const [scheduledAt, setScheduledAt] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick connect mock state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState<PublishingPlatform>("youtube");
  const [accountNameInput, setAccountNameInput] = useState("");

  const filteredAccounts = accounts.filter((acc) => acc.platform === selectedPlatform);
  const effectiveAccountId = selectedAccountId || (filteredAccounts[0]?.id ?? "");

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNameInput.trim()) return;

    try {
      setErrorMsg(null);
      await connectAccount({
        platform: connectPlatform,
        authCode: `auth_code_${Date.now()}`,
        accountName: accountNameInput.trim(),
      }).unwrap();

      setShowConnectModal(false);
      setAccountNameInput("");
      setSuccessMsg(`Successfully linked ${connectPlatform} account!`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to connect account");
    }
  };

  const handlePublishNow = async () => {
    if (!effectiveAccountId) {
      setErrorMsg("Please connect and select a social media account first.");
      return;
    }

    try {
      setErrorMsg(null);
      setSuccessMsg(null);

      const tags = tagsInput
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);

      await publishNow({
        contentId: content.id,
        data: {
          platform: selectedPlatform,
          socialAccountId: effectiveAccountId,
          title: title.trim(),
          description: description.trim(),
          tags,
          privacyStatus,
          category,
          publishNow: true,
        },
      }).unwrap();

      setSuccessMsg("Video published successfully! Live post link is available below.");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Publishing failed");
    }
  };

  const handleSchedule = async () => {
    if (!effectiveAccountId) {
      setErrorMsg("Please connect and select a social media account first.");
      return;
    }
    if (!scheduledAt) {
      setErrorMsg("Please select a valid scheduled date & time.");
      return;
    }

    try {
      setErrorMsg(null);
      setSuccessMsg(null);

      const tags = tagsInput
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);


      await schedulePublication({
        contentId: content.id,
        data: {
          platform: selectedPlatform,
          socialAccountId: effectiveAccountId,
          title: title.trim(),
          description: description.trim(),
          tags,
          privacyStatus,
          category,
          scheduledAt: new Date(scheduledAt).toISOString(),
          publishNow: false,
        },
      }).unwrap();

      setSuccessMsg(`Publication scheduled for ${new Date(scheduledAt).toLocaleString()}!`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Scheduling failed");
    }
  };

  if (isLoadingAccounts || isLoadingPubs) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Connected Accounts Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Phase 08 Publishing Engine
              </span>
              <span className="text-xs text-slate-400">Social Accounts Integration</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-2">Connected Channels & Pages</h2>
            <p className="text-sm text-slate-400 mt-1">
              Connect your YouTube channels and Facebook pages for one-click automated publishing.
            </p>
          </div>

          <button
            onClick={() => setShowConnectModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Connect Social Account
          </button>
        </div>

        {/* Connected Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* YouTube Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 font-bold">
                YT
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">YouTube Channel</h4>
                <p className="text-xs text-slate-400">
                  {accounts.find((a) => a.platform === "youtube")?.accountName || "Not Connected"}
                </p>
              </div>
            </div>

            {accounts.some((a) => a.platform === "youtube") ? (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Connected
                </span>
                <button
                  onClick={() => {
                    const acc = accounts.find((a) => a.platform === "youtube");
                    if (acc) void disconnectAccount(acc.id);
                  }}
                  className="text-xs text-slate-500 hover:text-rose-400 transition"
                  title="Disconnect account"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setConnectPlatform("youtube");
                  setAccountNameInput("Tech Automation Channel");
                  setShowConnectModal(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-semibold border border-red-500/30 transition"
              >
                Connect YouTube
              </button>
            )}
          </div>

          {/* Facebook Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold">
                FB
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Facebook Page / Reels</h4>
                <p className="text-xs text-slate-400">
                  {accounts.find((a) => a.platform === "facebook")?.accountName || "Not Connected"}
                </p>
              </div>
            </div>

            {accounts.some((a) => a.platform === "facebook") ? (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Connected
                </span>
                <button
                  onClick={() => {
                    const acc = accounts.find((a) => a.platform === "facebook");
                    if (acc) void disconnectAccount(acc.id);
                  }}
                  className="text-xs text-slate-500 hover:text-rose-400 transition"
                  title="Disconnect account"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button

                onClick={() => {
                  setConnectPlatform("facebook");
                  setAccountNameInput("Tech Insights Page");
                  setShowConnectModal(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold border border-blue-500/30 transition"
              >
                Connect Facebook
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Connect Account Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Connect Social Account</h3>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Platform
                </label>
                <select
                  value={connectPlatform}
                  onChange={(e) => setConnectPlatform(e.target.value as PublishingPlatform)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-rose-500"
                >
                  <option value="youtube">YouTube Channel (Data API v3)</option>
                  <option value="facebook">Facebook Page / Reels (Graph API)</option>
                  <option value="instagram">Instagram Professional (Graph API)</option>
                  <option value="tiktok">TikTok for Creators</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Channel / Page Name
                </label>
                <input
                  type="text"
                  required
                  value={accountNameInput}
                  onChange={(e) => setAccountNameInput(e.target.value)}
                  placeholder="e.g. AI Operations Official"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                In sandbox mode, clicking Authorize will generate an OAuth token for immediate local testing.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
                >
                  {isConnecting ? "Authorizing..." : "Authorize & Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publishing Studio Form */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Publish Video to Social Channels</h2>
            <p className="text-sm text-slate-400 mt-1">
              Configure SEO metadata, tags, and audience visibility before publishing or scheduling.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSchedule}
              disabled={isScheduling || isPublishing}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {isScheduling ? "Scheduling..." : "Schedule for Later"}
            </button>

            <button
              onClick={handlePublishNow}
              disabled={isPublishing || isScheduling}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isPublishing ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Publish Now
                </>
              )}
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errorMsg}
          </div>
        )}

        {/* Publishing Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Column 1: Platform & Account Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Target Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform("youtube")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-2 ${
                    selectedPlatform === "youtube"
                      ? "bg-red-600/20 border-red-500 text-red-300 shadow-sm"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  YouTube
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlatform("facebook")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-2 ${
                    selectedPlatform === "facebook"
                      ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Facebook
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Publishing Account
              </label>
              {filteredAccounts.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500">
                  No {selectedPlatform} account connected. Connect one above.
                </div>
              ) : (
                <select
                  value={effectiveAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-rose-500"
                >
                  {filteredAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} ({acc.platform})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Audience Visibility
              </label>
              <select
                value={privacyStatus}
                onChange={(e) => setPrivacyStatus(e.target.value as PublicationPrivacy)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-rose-500"
              >
                <option value="public">Public (Everyone can see)</option>
                <option value="unlisted">Unlisted (Anyone with link)</option>
                <option value="private">Private (Only you)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Content Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-rose-500"
              >
                <option value="28">Science & Technology</option>
                <option value="27">Education</option>
                <option value="22">People & Blogs</option>
                <option value="24">Entertainment</option>
                <option value="25">News & Politics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Schedule Date & Time
              </label>

              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Column 2 & 3: Metadata Customizer */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Optimized Video Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-medium focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Description & Hashtags
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-rose-500 resize-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Tags & Keywords (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Publications History & Active Links */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
        <h3 className="text-base font-bold text-slate-100 mb-4">Publication History & External Links</h3>

        {publications.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
            <svg className="w-10 h-10 text-slate-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <p className="text-sm text-slate-400 font-medium">No publications created yet.</p>
            <p className="text-xs text-slate-500 mt-1">Publish to YouTube or Facebook using the controls above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {publications.map((pub) => (
              <div
                key={pub.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        pub.platform === "youtube"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {pub.platform}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        pub.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : pub.status === "scheduled"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      {pub.status}
                    </span>

                    <span className="text-xs text-slate-500">
                      {pub.accountName}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-200">{pub.title}</h4>
                </div>

                <div className="flex items-center gap-3">
                  {pub.externalUrl && (
                    <a
                      href={pub.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition flex items-center gap-1.5"
                    >
                      View Live Post
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}

                  <span className="text-[11px] text-slate-500">
                    {pub.publishedAt
                      ? new Date(pub.publishedAt).toLocaleDateString()
                      : pub.scheduledAt
                      ? `Scheduled: ${new Date(pub.scheduledAt).toLocaleDateString()}`
                      : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
