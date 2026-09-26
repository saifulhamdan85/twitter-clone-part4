import { useContext, useState } from "react";
import { Button, Col, Image, Form, Row } from "react-bootstrap";
import { useDispatch } from 'react-redux';
import {
  likePost,
  removeLikeFromPost,
  addCommentThunk,
} from '../features/posts/postsSlice';
import { AuthContext } from "./AuthProvider";

export default function ProfilePostCard({ post }) {
  const { content, id: postId, comments = [] } = post;
  const [likes, setLikes] = useState(post.likes || []);
  const [commentText, setCommentText] = useState('');
  const dispatch = useDispatch();
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser?.uid;

  const isLiked = likes.includes(userId);

  const pic = "https://pbs.twimg.com/profile_images/1587405892437221376/h167Jlb2_400x400.jpg";

  const handleLike = () => (isLiked ? removeFromLikes() : addToLikes());

  const addToLikes = () => {
    setLikes([...likes, userId]);
    dispatch(likePost({ userId, postId }));
  };

  const removeFromLikes = () => {
    setLikes(likes.filter((id) => id !== userId));
    dispatch(removeLikeFromPost({ userId, postId }));
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      return;
    }
    dispatch(
      addCommentThunk({
        userId,
        postId,
        authorId: userId,
        content: commentText,
      })
    );
    setCommentText("");
  };

  return (
    <Row
      className="p-3"
      style={{
        borderTop: "1px solid #D3D3D3",
        borderBottom: "1px solid #D3D3D3"
      }}
    >
      <Col sm={1}>
        <Image src={pic} fluid roundedCircle />
      </Col>

      <Col>
        <strong>Haris</strong>
        <span> @haris.samingan · Apr 16</span>
        <p>{content}</p>
        <div className="d-flex justify-content-between">
          <Button variant="light">
            <i className="bi bi-chat"></i>
          </Button>
          <Button variant="light">
            <i className="bi bi-repeat"></i>
          </Button>
          <Button variant="light" onClick={handleLike}>
            {isLiked ? (
              <i className="bi bi-heart-fill text-danger"></i>
            ) : (
              <i className="bi bi-heart"></i>
            )}
            {likes.length}
          </Button>
          <Button variant="light">
            <i className="bi bi-graph-up"></i>
          </Button>
          <Button variant="light">
            <i className="bi bi-upload"></i>
          </Button>
        </div>

        {/* Comment form */}
        <Form onSubmit={handleAddComment} className="mt-2">
          <Form.Control
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Button type="submit" variant="primary" size="sm" className="mt-1">
            Comment
          </Button>
        </Form>

        {/* Render comments */}
        <div className="mt-3">
          {comments.map((c) => (
            <p key={c.id}>
              <strong>{c.authorId}:</strong> {c.content}
            </p>
          ))}
        </div>
      </Col>
    </Row>
  );
}