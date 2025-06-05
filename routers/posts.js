

import express from 'express';
import { allPosts,createPost,addCommentToPost,getSinglePostWithComments } from '../controllers/postsController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

//Get all Posts with comments  
router.get('/', allPosts);
//Get Posts with comments for one user or one post
 router.get('/:id',getSinglePostWithComments)

//create  a Post 
router.post('/',authenticateUser,createPost)

//Adding Comments to the Post
router.post('/:id/comments',authenticateUser, addCommentToPost);

export default router