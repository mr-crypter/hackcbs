import { Router } from 'express';
import { checkJwt } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createPostSchema,
  listPostsSchema,
  searchPostsSchema,
} from '../middleware/validation';
import {
  createPost,
  listPosts,
  getPost,
  deletePost,
  searchPosts,
} from '../controllers/posts';

const router = Router();

// Public/protected routes
router.get('/', validate(listPostsSchema), listPosts);
router.get('/:id', getPost);

// Protected routes
router.post('/', checkJwt, validate(createPostSchema), createPost);
router.post('/search', validate(searchPostsSchema), searchPosts);

// Moderator routes
router.delete('/:id', checkJwt, deletePost);

export default router;

