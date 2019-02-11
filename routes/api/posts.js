const express = require("express");
const router = express.Router();
const passport = require("passport");

// Load post model
const Post = require("../../models/Post");

// Load input validation
const validatePostInput = require("../../validation/post");

/**
 * @route           GET api/posts/test
 * @description     Tests posts route
 * @access          Public
 */
router.get("/test", (req, res) => res.json({ msg: "posts api works" }));

/**
 * @route           GET api/posts
 * @description     Get post
 * @access          Public
 */
router.get("/", (req, res) => {
    Post.find()
        .sort({ date: -1 })
        .then(posts => {
            if (!posts) {
                return res.status(404).json({ nopostfound: "No posts found" });
            }

            res.json(posts);
        })
        .catch(err =>
            res.status(400).json({ error: "Error while fetch data" })
        );
});

/**
 * @route           GET api/posts/:post_id
 * @description     Get post by post id
 * @access          Public
 */
router.get("/:post_id", (req, res) => {
    Post.findById(req.params.post_id)
        .then(posts => {
            if (!posts) {
                return res
                    .status(404)
                    .json({ nopostfound: "No post found with that id" });
            }

            res.json(posts);
        })
        .catch(err =>
            res.status(400).json({ error: "Error while fetch data" })
        );
});

/**
 * @route           POST api/posts
 * @description     Create post
 * @access          Private
 */
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { errors, isValid } = validatePostInput(req.body);

        // Check validation
        if (!isValid) {
            return res.status(400).json(errors);
        }

        const newPost = new Post({
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
        });

        newPost.save().then(post => res.json(post));
    }
);

/**
 * @route           DELETE api/posts/:post_id
 * @description     Delete post by post id
 * @access          Private
 */
router.delete(
    "/:post_id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Post.findById(req.params.post_id)
            .then(post => {
                if (!post) {
                    return res.status(404).json({
                        postnotfound: "No post found with that id"
                    });
                }

                // Check for post owner
                if (post.user.toString() !== req.user.id) {
                    return res.status(401).json({
                        notauth: "User not authorized to delete this post"
                    });
                }

                // Delete post
                post.remove().then(() => res.json({ success: true }));
            })
            .catch(err =>
                res.status(400).json({ error: "Error while fetch data" })
            );
    }
);

module.exports = router;
