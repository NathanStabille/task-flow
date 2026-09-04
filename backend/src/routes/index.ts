import { Router } from 'express';
import { listActivities } from '../controllers/activity-controller.js';
import { requireAuth } from '../middleware/require-auth.js';
import { authRouter } from './auth-routes.js';
import { projectRouter } from './project-routes.js';
import { taskRouter } from './task-routes.js';
import { userRouter } from './user-routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'taskflow-api' });
});
apiRouter.use('/auth', authRouter);
apiRouter.use(requireAuth);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/tasks', taskRouter);
apiRouter.use('/users', userRouter);
apiRouter.get('/activities', listActivities);
