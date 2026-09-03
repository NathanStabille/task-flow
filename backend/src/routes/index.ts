import { Router } from 'express';
import { listActivities } from '../controllers/activity-controller.js';
import { listUsers } from '../controllers/user-controller.js';
import { projectRouter } from './project-routes.js';
import { taskRouter } from './task-routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'taskflow-api' });
});
apiRouter.use('/projects', projectRouter);
apiRouter.use('/tasks', taskRouter);
apiRouter.get('/users', listUsers);
apiRouter.get('/activities', listActivities);

