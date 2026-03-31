import { useState } from 'react';
import { useTokens } from '../../stores/themeStore';
import { StoryTab } from './tabs/StoryTab';
import { CharactersTab } from './tabs/CharactersTab';
import { StoryboardTab } from './tabs/StoryboardTab';
import { ShotsTab } from './tabs/ShotsTab';
import { ClipsTab } from './tabs/ClipsTab';
import { VoiceoversTab } from './tabs/VoiceoversTab';
import { FinalVideoTab } from './tabs/FinalVideoTab';
import { ResultsTab } from './tabs/ResultsTab';

const TABS = [
  { id: 'story', label: 'Story', num: '1' },
  { id: 'characters', label: 'Characters', num: '2' },
  { id: 'storyboard', label: 'Storyboard', num: '3' },
  { id: 'shots', label: 'Shots', num: '4' },
  { id: 'clips', label: 'Clips', num: '5' },
  { id: 'voiceovers', label: 'Voiceovers', num: '6' },
  { id: 'final', label: 'Final Video', num: '7' },
  { id: 'results', label: 'Results', num: '8' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function PipelineView() {
  const t = useTokens();
  const [activeTab, setActiveTab] = useState<TabId>('story');

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className={`flex items-center gap-0.5 px-4 py-2 border-b ${t.border} ${t.bgSub} overflow-x-auto shrink-0`}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                active
                  ? `${t.accentBg} ${t.accent} ${t.accentBorder} border`
                  : `${t.textSub} ${t.bgHover} border border-transparent`
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                active ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-700/30 text-neutral-500'
              }`}>
                {tab.num}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'story' && <StoryTab />}
        {activeTab === 'characters' && <CharactersTab />}
        {activeTab === 'storyboard' && <StoryboardTab />}
        {activeTab === 'shots' && <ShotsTab />}
        {activeTab === 'clips' && <ClipsTab />}
        {activeTab === 'voiceovers' && <VoiceoversTab />}
        {activeTab === 'final' && <FinalVideoTab />}
        {activeTab === 'results' && <ResultsTab />}
      </div>
    </div>
  );
}
