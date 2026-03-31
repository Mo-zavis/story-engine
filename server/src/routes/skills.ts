import { Router } from 'express';
import { getAllSkillManifest, loadSkill, getStageSkillMap } from '../services/skillService.js';

const router = Router();

// List all skills with metadata
router.get('/skills', (_req, res) => {
  const skills = getAllSkillManifest();
  const stageMap = getStageSkillMap();
  res.json({ skills, stageMap });
});

// Get full content of a specific skill
router.get('/skills/:id', (req, res) => {
  const content = loadSkill(req.params.id);
  if (!content) return res.status(404).json({ error: 'Skill not found' });
  const skills = getAllSkillManifest();
  const skill = skills.find(s => s.id === req.params.id);
  res.json({ id: req.params.id, content, meta: skill });
});

export default router;
