"use client";

import React, { useState, useRef } from "react";
import {
  useGetContentMediaQuery,
  useGenerateVoiceNarrationMutation,
  useDeleteMediaAssetMutation,
} from "../api/media-api";
import type { ContentDto, MediaType, MediaAssetDto } from "@repo/types";


interface MediaTabViewProps {
  content: ContentDto;
}

const ELEVENLABS_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (Calm & Professional)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (Confident & Energetic)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella (Warm & Engaging)" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni (Storyteller & Deep)" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh (Dynamic & Youthful)" },
];

export function MediaTabView({ content }: MediaTabViewProps) {
  const { data: mediaPackage, isLoading } = useGetContentMediaQuery(content.id);
  const [generateVoice, { isLoading: isGeneratingVoice }] = useGenerateVoiceNarrationMutation();
  const [deleteAsset] = useDeleteMediaAssetMutation();

  const [selectedVoiceId, setSelectedVoiceId] = useState(ELEVENLABS_VOICES[0]!.id);
  const [stability, setStability] = useState(0.75);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [customNarration, setCustomNarration] = useState("");
  const [uploadType, setUploadType] = useState<MediaType>("video");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleGenerateVoice = async () => {
    try {
      const voiceObj = ELEVENLABS_VOICES.find((v) => v.id === selectedVoiceId) || ELEVENLABS_VOICES[0]!;
      await generateVoice({
        contentId: content.id,
        data: {
          voiceId: voiceObj.id,
          voiceName: voiceObj.name,
          provider: "elevenlabs",
          customScriptText: customNarration.trim() ? customNarration.trim() : undefined,
          stability,
          similarityBoost,
        },
      }).unwrap();
    } catch (err: unknown) {
      console.error("Failed to generate voice narration:", err);
    }
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("contentId", content.id);
    formData.append("type", uploadType);
    formData.append("title", file.name);

    try {
      const token = localStorage.getItem("access_token");
      const activeWorkspace = localStorage.getItem("active_workspace_id");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010"}/api/v1/media-assets/upload`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(activeWorkspace ? { "x-workspace-id": activeWorkspace } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      window.location.reload();
    } catch (err: unknown) {
      setUploadError((err as Error).message || "File upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mr-3" />
        Loading media assets and voice pipelines...
      </div>
    );
  }

  const voice = mediaPackage?.voice;
  const assets = mediaPackage?.assets || [];

  return (
    <div className="space-y-8">
      {/* Top Banner: Voice Narration Engine */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-indigo-950/40 border border-slate-800/80 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider">
                Audio Pipeline
              </span>
              <h3 className="text-lg font-bold text-slate-100">AI Voice Narration Engine</h3>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Generate ultra-realistic voice narration using ElevenLabs neural voice models.
            </p>
          </div>

          <button
            id="generate-voice-btn"
            onClick={handleGenerateVoice}
            disabled={isGeneratingVoice}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isGeneratingVoice ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Generating Narration...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                {voice ? "Regenerate Voice" : "Generate Voice Narration"}
              </>
            )}
          </button>
        </div>

        {/* Existing Voice Audio Player Card */}
        {voice && (
          <div className="my-6 p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={toggleAudioPlayback}
                className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
              >
                {isPlayingAudio ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <div>
                <div className="text-sm font-semibold text-slate-200">{voice.voiceName}</div>
                <div className="text-xs text-slate-400">
                  {voice.provider.toUpperCase()} • {voice.durationSeconds}s duration • {voice.sampleRate} Hz • {voice.audioFormat.toUpperCase()}
                </div>
              </div>
            </div>

            {voice.url && (
              <audio
                ref={audioRef}
                src={voice.url}
                onEnded={() => setIsPlayingAudio(false)}
                className="hidden"
              />
            )}

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Ready for Mix
              </span>
              {voice.url && (
                <a
                  href={voice.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Download Audio
                </a>
              )}
            </div>
          </div>
        )}

        {/* Voice Parameters Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Voice Model
            </label>
            <select
              value={selectedVoiceId}
              onChange={(e) => setSelectedVoiceId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            >
              {ELEVENLABS_VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">
              <span>Stability</span>
              <span>{Math.round(stability * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={stability}
              onChange={(e) => setStability(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">
              <span>Similarity Boost</span>
              <span>{Math.round(similarityBoost * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={similarityBoost}
              onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Custom Script Override (Optional) */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Custom Script Text (Optional - defaults to approved script narration)
          </label>
          <textarea
            rows={2}
            value={customNarration}
            onChange={(e) => setCustomNarration(e.target.value)}
            placeholder="Leave blank to automatically synthesize script sections..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 resize-none"
          />
        </div>
      </div>

      {/* Asset Sourcing & Direct Upload Section */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-100">Media Assets Pool & Direct Upload</h3>
            <p className="text-sm text-slate-400">
              Attach B-roll video clips, images, audio backing tracks, or subtitle files.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as MediaType)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="video">Video Clip / B-Roll</option>
              <option value="image">Image / Graphic</option>
              <option value="audio">Audio / Music</option>
              <option value="subtitle">Subtitle Track (SRT/VTT)</option>
            </select>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold transition flex items-center gap-2 border border-slate-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {isUploading ? "Uploading..." : "Upload File"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleDirectUpload}
              className="hidden"
            />
          </div>
        </div>

        {uploadError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {uploadError}
          </div>
        )}

        {/* Media Asset Cards Grid */}
        {assets.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
            <svg className="w-10 h-10 text-slate-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-slate-400 font-medium">No media assets attached yet.</p>
            <p className="text-xs text-slate-500 mt-1">Upload B-roll footage or generate voice narration above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset: MediaAssetDto) => (

              <div
                key={asset.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        asset.type === "video"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : asset.type === "audio"
                          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          : asset.type === "thumbnail" || asset.type === "image"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      {asset.type}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {(asset.sizeBytes / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-200 line-clamp-1 mb-1">
                    {asset.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{asset.fileName}</p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    Preview
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  <button
                    onClick={() => deleteAsset(asset.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
