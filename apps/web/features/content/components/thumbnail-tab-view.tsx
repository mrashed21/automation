"use client";

import React, { useState } from "react";
import {
  useGetContentMediaQuery,
  useGenerateThumbnailVariantsMutation,
  useSelectPrimaryThumbnailMutation,
} from "../api/media-api";
import type { ContentDto, ThumbnailAssetDto } from "@repo/types";


interface ThumbnailTabViewProps {
  content: ContentDto;
}

const THUMBNAIL_STYLES = [
  { id: "youtube_high_ctr", name: "YouTube High-CTR (Vibrant & High Contrast)" },
  { id: "modern_vibrant", name: "Modern Vibrant (SaaS / Tech Polish)" },
  { id: "dramatic_cinematic", name: "Dramatic Cinematic (Dark & Atmospheric)" },
  { id: "minimal_sleek", name: "Minimal Sleek (Clean Typography)" },
];

export function ThumbnailTabView({ content }: ThumbnailTabViewProps) {
  const { data: mediaPackage, isLoading } = useGetContentMediaQuery(content.id);
  const [generateThumbnails, { isLoading: isGenerating }] = useGenerateThumbnailVariantsMutation();
  const [selectPrimary, { isLoading: isSelecting }] = useSelectPrimaryThumbnailMutation();

  const [style, setStyle] = useState("youtube_high_ctr");
  const [headlineText, setHeadlineText] = useState(content.title.slice(0, 36).toUpperCase());
  const [customPrompt, setCustomPrompt] = useState("");
  const [variantCount, setVariantCount] = useState(3);

  const handleGenerate = async () => {
    try {
      await generateThumbnails({
        contentId: content.id,
        data: {
          style: style as "youtube_high_ctr" | "modern_vibrant" | "dramatic_cinematic" | "minimal_sleek",
          headlineText: headlineText.trim() ? headlineText.trim() : undefined,
          customPrompt: customPrompt.trim() ? customPrompt.trim() : undefined,
          variantCount,
        },
      }).unwrap();
    } catch (err: unknown) {
      console.error("Failed to generate thumbnail variants:", err);
    }
  };

  const handleSelectPrimary = async (thumbId: string) => {
    try {
      await selectPrimary({
        contentId: content.id,
        thumbId,
      }).unwrap();
    } catch (err: unknown) {
      console.error("Failed to set primary thumbnail:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mr-3" />
        Loading thumbnail studio...
      </div>
    );
  }

  const thumbnails = mediaPackage?.thumbnails || [];
  const selectedThumbId = mediaPackage?.selectedThumbnailId;

  return (
    <div className="space-y-8">
      {/* Studio Generator Control Panel */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-purple-950/30 border border-slate-800/80 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold uppercase tracking-wider">
                Visual Studio
              </span>
              <h3 className="text-lg font-bold text-slate-100">AI Thumbnail Variant Generator</h3>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Synthesize 3-4 high-CTR thumbnail variants optimized for YouTube and Facebook click-through rates.
            </p>
          </div>

          <button
            id="generate-thumbnails-btn"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Generating Variants...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {thumbnails.length > 0 ? "Regenerate Variants" : "Generate Thumbnail Variants"}
              </>
            )}
          </button>
        </div>

        {/* Generator Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Visual Preset & Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-purple-500"
            >
              {THUMBNAIL_STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Headline Overlay (3-5 Words Max)
            </label>
            <input
              type="text"
              value={headlineText}
              onChange={(e) => setHeadlineText(e.target.value)}
              placeholder="e.g. HOW IT WORKS"
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-purple-500 placeholder:text-slate-600 uppercase font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Variant Count
            </label>
            <select
              value={variantCount}
              onChange={(e) => setVariantCount(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-purple-500"
            >
              <option value={3}>3 Variants (A, B, C)</option>
              <option value={4}>4 Variants (A, B, C, D)</option>
            </select>
          </div>
        </div>

        {/* Custom Visual Prompt Override */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Custom Visual Direction (Optional)
          </label>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. Glowing neon circuitry, vibrant magenta accent lights, high contrast portrait..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Thumbnail Variants Display (A/B Testing Pool) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-bold text-slate-100">A/B Testing Variants</h4>
            <p className="text-xs text-slate-400">
              Select the best performing thumbnail variant for publication.
            </p>
          </div>
          {thumbnails.length > 0 && (
            <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              {thumbnails.length} Variants Available
            </span>
          )}
        </div>

        {thumbnails.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-semibold text-slate-300">No thumbnail variants generated yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Click &quot;Generate Thumbnail Variants&quot; above to produce AI visuals with headline typography.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {thumbnails.map((thumb: ThumbnailAssetDto) => {

              const isSelected = thumb.status === "selected" || thumb.id === selectedThumbId;
              return (
                <div
                  key={thumb.id}
                  className={`relative rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? "border-purple-500 bg-slate-900/90 shadow-xl shadow-purple-500/10 ring-2 ring-purple-500/50"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  {/* Thumbnail Image Preview (16:9 Aspect Ratio) */}
                  <div className="relative w-full aspect-video bg-slate-900 overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb.url}
                      alt={`Thumbnail Variant ${thumb.variant}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Variant Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-lg">
                      Variant {thumb.variant}
                    </div>

                    {/* CTR Score Badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-xs font-semibold text-emerald-400 shadow-lg flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 9.586 14.586 6H12z" clipRule="evenodd" />
                      </svg>
                      {thumb.ctrScoreEstimate}% Est. CTR
                    </div>

                    {isSelected && (
                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Primary Selected
                      </div>
                    )}
                  </div>

                  {/* Card Details & Actions */}
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Style: {thumb.style.replace(/_/g, " ").toUpperCase()}</span>
                      <span>1280 × 720 (16:9)</span>
                    </div>

                    <p className="text-xs text-slate-300 font-semibold line-clamp-1">
                      Overlay: &ldquo;{thumb.headlineText}&rdquo;
                    </p>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => handleSelectPrimary(thumb.id)}
                        disabled={isSelected || isSelecting}
                        className={`w-full py-2 rounded-xl text-xs font-semibold transition ${
                          isSelected
                            ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 cursor-default"
                            : "bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-200"
                        }`}
                      >
                        {isSelected ? "Active Publication Thumbnail" : "Set as Primary"}
                      </button>

                      <a
                        href={thumb.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition shrink-0"
                        title="View Full Resolution"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
