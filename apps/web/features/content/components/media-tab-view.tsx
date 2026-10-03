"use client";

import type { ContentDto, MediaAssetDto, MediaType } from "@repo/types";
import React, { useRef, useState } from "react";
import {
  useDeleteMediaAssetMutation,
  useGenerateVoiceNarrationMutation,
  useGetContentMediaQuery,
  useStartContentRenderMutation,
} from "../api/media-api";

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
  const [startRender, { isLoading: isStartingRender }] = useStartContentRenderMutation();

  // Voice narration state
  const [selectedVoiceId, setSelectedVoiceId] = useState(ELEVENLABS_VOICES[0]!.id);
  const [stability, setStability] = useState(0.75);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [customNarration, setCustomNarration] = useState("");

  // Direct upload state
  const [uploadType, setUploadType] = useState<MediaType>("video");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Video render studio state
  const [renderAspectRatio, setRenderAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [renderResolution, setRenderResolution] = useState<"1080p" | "720p">("1080p");
  const [includeSubtitles, setIncludeSubtitles] = useState(true);
  const [subtitleStyle, setSubtitleStyle] = useState<"highlight_pop" | "classic_box" | "subtle_clean">("highlight_pop");
  const [includeMusic, setIncludeMusic] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.15);
  const [renderSuccessMsg, setRenderSuccessMsg] = useState<string | null>(null);

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
      console.error("Voice generation failed:", err);
    }
  };

  const handleStartRender = async () => {
    try {
      setRenderSuccessMsg(null);
      await startRender({
        contentId: content.id,
        data: {
          aspectRatio: renderAspectRatio,
          resolution: renderResolution,
          includeSubtitles,
          subtitleStyle,
          includeMusic,
          musicVolume,
        },
      }).unwrap();

      setRenderSuccessMsg("Video rendering completed! Final video asset is ready.");
    } catch (err: unknown) {
      console.error("Video rendering failed:", err);
    }
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentId", content.id);
      formData.append("type", uploadType);
      formData.append("title", file.name);

      const token = localStorage.getItem("token");
      const workspaceId = localStorage.getItem("currentWorkspaceId");

      const res = await fetch("http://localhost:3010/api/v1/media-assets/upload", {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(workspaceId && { "x-workspace-id": workspaceId }),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload asset");
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
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const voice = mediaPackage?.voice;
  const assets = mediaPackage?.assets || [];
  const renderedVideo = mediaPackage?.renderedVideo;

  return (
    <div className="space-y-8">
      {/* Video Rendering Studio Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-950/30 to-slate-900/50 border border-purple-800/40 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                FFmpeg Render Engine
              </span>
              <span className="text-xs text-slate-400">Phase 07 Video Pipeline</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-2">
              Multi-Scene Video Composition & Rendering
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Assemble scenes, blend voice narration, duck background music, and render high-retention animated subtitles.
            </p>
          </div>

          <button
            onClick={handleStartRender}
            disabled={isStartingRender}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isStartingRender ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Rendering Video...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Render Final Video
              </>
            )}
          </button>
        </div>

        {renderSuccessMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {renderSuccessMsg}
          </div>
        )}

        {/* Video Composition Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {/* Aspect Ratio Picker */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-900/30">
            <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRenderAspectRatio("16:9")}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition text-center ${
                  renderAspectRatio === "16:9"
                    ? "bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                16:9 Long-form
              </button>
              <button
                type="button"
                onClick={() => setRenderAspectRatio("9:16")}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition text-center ${
                  renderAspectRatio === "9:16"
                    ? "bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                9:16 Shorts/Reels
              </button>
            </div>
          </div>

          {/* Subtitle Style Selector */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-900/30">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                Subtitles
              </label>
              <input
                type="checkbox"
                checked={includeSubtitles}
                onChange={(e) => setIncludeSubtitles(e.target.checked)}
                className="rounded accent-purple-500 cursor-pointer"
              />
            </div>
            <select
              value={subtitleStyle}
              disabled={!includeSubtitles}
              onChange={(e) => setSubtitleStyle(e.target.value as "highlight_pop" | "classic_box" | "subtle_clean")}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500 disabled:opacity-40"
            >
              <option value="highlight_pop">Vibrant Pop Highlight</option>
              <option value="classic_box">Classic Boxed</option>
              <option value="subtle_clean">Clean Minimal White</option>
            </select>
          </div>

          {/* Background Music & Ducking */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-900/30">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                Background Music
              </label>
              <input
                type="checkbox"
                checked={includeMusic}
                onChange={(e) => setIncludeMusic(e.target.checked)}
                className="rounded accent-purple-500 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={musicVolume}
                disabled={!includeMusic}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800 rounded cursor-pointer disabled:opacity-40"
              />
              <span className="text-[11px] text-slate-400 font-mono">
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Quality Resolution */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-900/30">
            <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
              Encoding Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRenderResolution("1080p")}
                className={`py-2 px-2 rounded-lg text-xs font-medium border transition text-center ${
                  renderResolution === "1080p"
                    ? "bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                1080p FHD
              </button>
              <button
                type="button"
                onClick={() => setRenderResolution("720p")}
                className={`py-2 px-2 rounded-lg text-xs font-medium border transition text-center ${
                  renderResolution === "720p"
                    ? "bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                720p Fast
              </button>
            </div>
          </div>
        </div>

        {/* Rendered MP4 Video Preview (if available) */}
        {renderedVideo && (
          <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-purple-500/30 flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-80 aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0 relative group">
              <video
                src={renderedVideo.url}
                controls
                className="w-full h-full object-cover"
                poster={mediaPackage?.thumbnails?.[0]?.url}
              />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready to Publish
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {renderedVideo.width}x{renderedVideo.height} • {renderedVideo.durationSeconds}s
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-200">{renderedVideo.title}</h4>
              <p className="text-xs text-slate-400">
                Rendered with H.264 video stream, AAC 192kbps audio, and burned-in subtitle track.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <a
                  href={renderedVideo.url}
                  download={renderedVideo.fileName}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download MP4
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Voice Narration Studio */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                ElevenLabs Neural Voice
              </span>
              <span className="text-xs text-slate-400">Studio Audio Generation</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-2">Voice Narration Studio</h2>
            <p className="text-sm text-slate-400 mt-1">
              Synthesize full voice narration for this content using high-fidelity AI models.
            </p>
          </div>

          <button
            onClick={handleGenerateVoice}
            disabled={isGeneratingVoice}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGeneratingVoice ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Synthesizing Voice...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                {voice ? "Regenerate Voice" : "Generate Voice Narration"}
              </>
            )}
          </button>
        </div>

        {/* Existing Voice Audio Player */}
        {voice && (
          <div className="my-6 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={toggleAudioPlayback}
                className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-600/30 transition"
              >
                {isPlayingAudio ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-100">{voice.voiceName}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active Narration
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {voice.durationSeconds} seconds • {voice.sampleRate} Hz • {voice.audioFormat.toUpperCase()}
                </p>
              </div>

              <audio
                ref={audioRef}
                src={voice.url}
                onEnded={() => setIsPlayingAudio(false)}
                className="hidden"
              />
            </div>

            <a
              href={voice.url}
              download={`${content.title}-narration.mp3`}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 text-xs font-semibold border border-indigo-700/50 transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download MP3
            </a>
          </div>
        )}

        {/* Voice Model & Generation Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
