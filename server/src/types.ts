export interface StoryJSON {
  title: string;
  logline: string;
  genre: string;
  tone: string;
  characters: Character[];
  scenes: Scene[];
  script: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  visualDescription: string;
  role: 'protagonist' | 'antagonist' | 'supporting';
  imageUrl?: string;
}

export interface Scene {
  id: string;
  number: number;
  title: string;
  description: string;
  visualDescription: string;
  dialogue?: string;
  voiceoverText?: string;
  imageUrl?: string;
  videoUrl?: string;
  durationSeconds?: number;
}

export interface ExecuteNodeRequest {
  nodeId: string;
  nodeType: string;
  nodeData: Record<string, unknown>;
  inputData: Record<string, unknown>;
}

export interface ExecuteNodeResponse {
  outputs: Record<string, unknown>;
  dataUpdates: Record<string, unknown>;
}
