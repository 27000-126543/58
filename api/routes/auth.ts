import { Router } from 'express';
import { db } from '../db/index.js';
import type { User } from '../../shared/types.js';

const authRouter = Router();

authRouter.get('/users', (_req, res) => {
  try {
    res.json({ data: db.users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

authRouter.post('/login', (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: 'userId 是必需的' });
      return;
    }

    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }

    res.json({ data: user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

authRouter.post('/logout', (_req, res) => {
  res.json({ data: { ok: true } });
});

export default authRouter;
