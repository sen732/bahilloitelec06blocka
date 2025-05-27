const express = require("express");
const router = express.Router();
const multer = require("multer");
const PostModel = require("../models/post");

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type");
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, `${name}-${Date.now()}.${ext}`);
  }
});

const upload = multer({ storage: storage }).single("image");

// === CREATE A POST ===
router.post("/", upload, async (req, res) => {
  try {
    const url = `${req.protocol}://${req.get("host")}`;
    const post = new PostModel({
      title: req.body.title,
      content: req.body.content,
      imagePath: req.file ? `${url}/images/${req.file.filename}` : null
    });

    const result = await post.save();
    res.status(201).json({
      message: "Post added successfully",
      post: { ...result.toObject(), id: result._id }
    });
  } catch (error) {
    res.status(500).json({ message: "Creating post failed!", error: error.message });
  }
});

// === UPDATE A POST ===
router.put("/:id", upload, async (req, res) => {
  try {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = `${req.protocol}://${req.get("host")}`;
      imagePath = `${url}/images/${req.file.filename}`;
    }

    const post = {
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath
    };

    const result = await PostModel.updateOne({ _id: req.params.id }, post);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Post not found!" });
    }

    res.status(200).json({
      message: "Update successful!",
      post: { ...post, id: req.params.id }
    });
  } catch (error) {
    res.status(500).json({ message: "Updating post failed!", error: error.message });
  }
});

// === FETCH POSTS WITH PAGINATION ===
router.get("/", async (req, res) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.currentpage;

  try {
    let postQuery = PostModel.find();
    if (pageSize && currentPage) {
      postQuery = postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }

    const posts = await postQuery;
    const totalPosts = await PostModel.countDocuments();

    res.status(200).json({
      message: "Posts fetched successfully!",
      posts: posts,
      totalPosts: totalPosts
    });
  } catch (error) {
    res.status(500).json({ message: "Fetching posts failed!", error: error.message });
  }
});

// === FETCH SINGLE POST ===
router.get("/:id", async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Fetching post failed!", error: error.message });
  }
});

// === DELETE POST ===
router.delete("/:id", async (req, res) => {
  try {
    const result = await PostModel.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Post not found!" });
    }

    res.status(200).json({ message: "Post deleted!" });
  } catch (error) {
    res.status(500).json({ message: "Deleting post failed!", error: error.message });
  }
});

// === ADD REACTION TO POST ===
router.post('/:id/reactions', async (req, res) => {
  const postId = req.params.id;
  const { emoji } = req.body;

  try {
    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (!post.reactions) post.reactions = {};
    post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;

    await post.save();
    res.status(200).json({ message: 'Reaction added', reactions: post.reactions });
  } catch (error) {
    res.status(500).json({ message: 'Adding reaction failed.', error: error.message });
  }
});

// === ADD COMMENT TO POST ===
router.post('/:id/comments', async (req, res) => {
  const postId = req.params.id;
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ message: 'Invalid comment text.' });
  }

  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { $push: { comments: { text } } },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    res.status(201).json({
      message: 'Comment added successfully!',
      post: updatedPost
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Adding comment failed.', error: error.message });
  }
});

module.exports = router;
