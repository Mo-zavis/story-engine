import { useState, useEffect, useMemo } from 'react';
import { useTokens } from '../../../stores/themeStore';
import { useWorkflowStore } from '../../../stores/workflowStore';
import type { CaptionFont, CaptionPosition, CaptionStyle, CaptionConfig } from '../../../types/nodes';

interface CaptionPreviewProps {
  exportNodeId: string;
  captionText: string;
  captionConfig?: CaptionConfig;
  thumbnailUrl?: string;
}

const FONT_OPTIONS: { value: CaptionFont; label: string; description: string; family: string }[] = [
  { value: 'Inter', label: 'Inter', description: 'Clean sans-serif', family: "'Inter', sans-serif" },
  { value: 'Oswald', label: 'Oswald', description: 'Bold condensed', family: "'Oswald', sans-serif" },
  { value: 'Bebas Neue', label: 'Bebas Neue', description: 'Impact / display', family: "'Bebas Neue', sans-serif" },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', description: 'Technical mono', family: "'JetBrains Mono', monospace" },
  { value: 'custom', label: 'Custom Font', description: 'Upload font URL', family: 'inherit' },
];

const POSITION_OPTIONS: { value: CaptionPosition; label: string; icon: string }[] = [
  { value: 'top', label: 'Top', icon: '\u2191' },
  { value: 'center', label: 'Center', icon: '\u2195' },
  { value: 'bottom', label: 'Bottom', icon: '\u2193' },
];

const STYLE_OPTIONS: { value: CaptionStyle; label: string; description: string }[] = [
  { value: 'word_reveal', label: 'Word-by-Word Reveal', description: 'Words appear one at a time with highlight' },
  { value: 'block_subtitle', label: 'Block Subtitle', description: 'Classic subtitle bar at chosen position' },
  { value: 'kinetic_text', label: 'Kinetic Text', description: 'Animated text with scale and motion' },
];

const DEFAULT_CONFIG: CaptionConfig = {
  font: 'Inter',
  position: 'bottom',
  style: 'word_reveal',
  fontSize: 24,
  color: '#ffffff',
  bgColor: '#000000',
  bgOpacity: 0.6,
};

export function CaptionPreview({ exportNodeId, captionText, captionConfig, thumbnailUrl }: CaptionPreviewProps) {
  const t = useTokens();
  const { updateNodeData } = useWorkflowStore();
  const config = useMemo(() => ({ ...DEFAULT_CONFIG, ...captionConfig }), [captionConfig]);

  const [localFont, setLocalFont] = useState<CaptionFont>(config.font);
  const [localPosition, setLocalPosition] = useState<CaptionPosition>(config.position);
  const [localStyle, setLocalStyle] = useState<CaptionStyle>(config.style);
  const [localCustomFontUrl, setLocalCustomFontUrl] = useState(config.customFontUrl || '');
  const [animTick, setAnimTick] = useState(0);

  // Sync local state when config changes from outside
  useEffect(() => {
    setLocalFont(config.font);
    setLocalPosition(config.position);
    setLocalStyle(config.style);
    setLocalCustomFontUrl(config.customFontUrl || '');
  }, [config.font, config.position, config.style, config.customFontUrl]);

  // Word reveal animation ticker
  useEffect(() => {
    if (localStyle !== 'word_reveal') return;
    const interval = setInterval(() => setAnimTick(prev => prev + 1), 600);
    return () => clearInterval(interval);
  }, [localStyle]);

  // Persist config to node data
  const persistConfig = (updates: Partial<CaptionConfig>) => {
    const merged: CaptionConfig = {
      ...config,
      font: localFont,
      position: localPosition,
      style: localStyle,
      customFontUrl: localCustomFontUrl || undefined,
      ...updates,
    };
    updateNodeData(exportNodeId, { captionConfig: merged });
  };

  const handleFontChange = (font: CaptionFont) => {
    setLocalFont(font);
    persistConfig({ font });
  };

  const handlePositionChange = (position: CaptionPosition) => {
    setLocalPosition(position);
    persistConfig({ position });
  };

  const handleStyleChange = (style: CaptionStyle) => {
    setLocalStyle(style);
    persistConfig({ style });
  };

  const handleCustomFontUrl = (url: string) => {
    setLocalCustomFontUrl(url);
    persistConfig({ customFontUrl: url || undefined });
  };

  // Load custom font dynamically
  useEffect(() => {
    if (localFont !== 'custom' || !localCustomFontUrl) return;
    const fontName = 'CustomCaptionFont';
    const fontFace = new FontFace(fontName, `url(${localCustomFontUrl})`);
    fontFace.load().then(loaded => {
      document.fonts.add(loaded);
    }).catch(() => { /* ignore load errors */ });
  }, [localFont, localCustomFontUrl]);

  const displayText = captionText || 'Your caption text will appear here as a preview of the final video overlay.';
  const words = displayText.split(/\s+/);
  const currentFontOption = FONT_OPTIONS.find(f => f.value === localFont);
  const fontFamily = localFont === 'custom' && localCustomFontUrl
    ? "'CustomCaptionFont', sans-serif"
    : currentFontOption?.family || "'Inter', sans-serif";

  // Position styles for the caption inside the frame
  const positionStyle: React.CSSProperties = {
    position: 'absolute',
    left: '12px',
    right: '12px',
    ...(localPosition === 'top' && { top: '40px' }),
    ...(localPosition === 'center' && { top: '50%', transform: 'translateY(-50%)' }),
    ...(localPosition === 'bottom' && { bottom: '40px' }),
  };

  const renderCaptionContent = () => {
    const baseTextStyle: React.CSSProperties = {
      fontFamily,
      fontSize: localFont === 'Bebas Neue' ? '28px' : '20px',
      lineHeight: 1.4,
      color: '#ffffff',
      textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.6)',
    };

    switch (localStyle) {
      case 'word_reveal': {
        const visibleCount = (animTick % (words.length + 3)) + 1;
        const highlightIdx = Math.min(visibleCount - 1, words.length - 1);
        return (
          <div style={{ textAlign: 'center' }}>
            {words.map((word, i) => (
              <span
                key={i}
                style={{
                  ...baseTextStyle,
                  display: 'inline-block',
                  marginRight: '6px',
                  marginBottom: '4px',
                  opacity: i < visibleCount ? 1 : 0.15,
                  transition: 'opacity 0.2s, background 0.2s, transform 0.15s',
                  background: i === highlightIdx ? 'rgba(251,191,36,0.35)' : 'transparent',
                  borderRadius: '4px',
                  padding: '1px 4px',
                  transform: i === highlightIdx ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                {word}
              </span>
            ))}
          </div>
        );
      }

      case 'block_subtitle':
        return (
          <div
            style={{
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              borderRadius: '8px',
              padding: '10px 16px',
              textAlign: 'center',
            }}
          >
            <span style={baseTextStyle}>{displayText}</span>
          </div>
        );

      case 'kinetic_text': {
        const phase = animTick % 4;
        return (
          <div style={{ textAlign: 'center', perspective: '600px' }}>
            {words.map((word, i) => {
              const offset = (i + phase) % 4;
              const scale = offset === 0 ? 1.25 : offset === 1 ? 1.1 : offset === 2 ? 0.95 : 1.0;
              const rotate = offset === 0 ? -1 : offset === 1 ? 1.5 : offset === 2 ? -0.5 : 0;
              return (
                <span
                  key={i}
                  style={{
                    ...baseTextStyle,
                    display: 'inline-block',
                    marginRight: '6px',
                    marginBottom: '4px',
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)',
                    fontWeight: offset === 0 ? 700 : 400,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        );
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <p className={`text-[10px] font-semibold ${t.textMuted} uppercase tracking-wider`}>Caption Preview</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* 9:16 Preview Frame */}
        <div className="shrink-0">
          <div
            className="relative overflow-hidden rounded-2xl border-2 border-neutral-700/60"
            style={{
              width: '220px',
              height: '391px', // 9:16 ratio
              background: thumbnailUrl
                ? `url(${thumbnailUrl}) center/cover`
                : 'linear-gradient(160deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #1a1a2e 100%)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Phone notch */}
            <div style={{
              position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)',
              width: '60px', height: '6px', borderRadius: '3px',
              background: 'rgba(255,255,255,0.1)',
            }} />

            {/* Scanlines overlay for realism */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
              pointerEvents: 'none',
            }} />

            {/* Gradient overlay to make caption readable */}
            {localPosition === 'bottom' && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                pointerEvents: 'none',
              }} />
            )}
            {localPosition === 'top' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                background: 'linear-gradient(rgba(0,0,0,0.7), transparent)',
                pointerEvents: 'none',
              }} />
            )}

            {/* Caption */}
            <div style={positionStyle}>
              {renderCaptionContent()}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Font Selection */}
          <div>
            <p className={`text-[10px] font-medium ${t.textMuted} uppercase tracking-wider mb-2`}>Font</p>
            <div className="grid grid-cols-2 gap-1.5">
              {FONT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleFontChange(opt.value)}
                  className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                    localFont === opt.value
                      ? `${t.accentBg} ${t.accentBorder} ${t.accent}`
                      : `${t.bg} ${t.borderSub} ${t.textSub} ${t.bgHover}`
                  }`}
                >
                  <span
                    className="block font-medium truncate"
                    style={{ fontFamily: opt.value === 'custom' ? 'inherit' : opt.family }}
                  >
                    {opt.label}
                  </span>
                  <span className={`text-[10px] ${t.textMuted}`}>{opt.description}</span>
                </button>
              ))}
            </div>
            {localFont === 'custom' && (
              <input
                type="text"
                placeholder="Font file URL (.woff2, .ttf, .otf)"
                value={localCustomFontUrl}
                onChange={e => handleCustomFontUrl(e.target.value)}
                className={`w-full mt-2 ${t.bg} border ${t.border} rounded-lg px-3 py-1.5 text-xs ${t.text} placeholder:${t.textMuted}`}
              />
            )}
          </div>

          {/* Position */}
          <div>
            <p className={`text-[10px] font-medium ${t.textMuted} uppercase tracking-wider mb-2`}>Position</p>
            <div className="flex gap-1.5">
              {POSITION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handlePositionChange(opt.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                    localPosition === opt.value
                      ? `${t.accentBg} ${t.accentBorder} ${t.accent}`
                      : `${t.bg} ${t.borderSub} ${t.textSub} ${t.bgHover}`
                  }`}
                >
                  <span className="text-sm">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <p className={`text-[10px] font-medium ${t.textMuted} uppercase tracking-wider mb-2`}>Caption Style</p>
            <div className="space-y-1.5">
              {STYLE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleStyleChange(opt.value)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-all ${
                    localStyle === opt.value
                      ? `${t.accentBg} ${t.accentBorder} ${t.accent}`
                      : `${t.bg} ${t.borderSub} ${t.textSub} ${t.bgHover}`
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className={`block text-[10px] ${t.textMuted} mt-0.5`}>{opt.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
