import { useContext, useState } from "react";
import { Button, Col, Image, Form, Row, Modal } from "react-bootstrap";
import { useDispatch } from 'react-redux';
import {
  likePost,
  removeLikeFromPost,
  addCommentThunk,
} from '../features/posts/postsSlice';
import { AuthContext } from "./AuthProvider";
import UpdatePostModal from "./UpdatePostModal";

export default function ProfilePostCard({ post }) {
  const { content, id: postId, postLikes = [], comments = [], imageUrl } = post;
  const [likes, setLikes] = useState(postLikes || []);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const dispatch = useDispatch();

  const { currentUser, deletePost } = useContext(AuthContext);

  const userId = currentUser?.uid;

  const isLiked = likes.includes(userId);

  const pic = "https://pbs.twimg.com/profile_images/1587405892437221376/h167Jlb2_400x400.jpg";

  const handleShowUpdateModal = () => setShowUpdateModal(true);
  const handleCloseUpdateModal = () => setShowUpdateModal(false);


  const handleLike = () => {
    if (!userId) return;
    if (isLiked) {
      setLikes(likes.filter((id) => id !== userId));
      dispatch(removeLikeFromPost({ userId, postId }));
    } else {
      setLikes([...likes, userId]);
      dispatch(likePost({ userId, postId }));
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
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

  const handleConfirmDelete = () => {
    if (!userId) return;
    deletePost(userId, postId);
    setShowDeleteModal(false);
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
        {imageUrl && <Image src={imageUrl} style={{ width: 150 }} />}
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
          <Button variant="light" onClick={handleShowUpdateModal}>
            <i className="bi bi-pencil-square"></i>
          </Button>
          <Button variant="light" onClick={() => setShowDeleteModal(true)}>
            <i className="bi bi-trash"></i>
          </Button>
        </div>

        <UpdatePostModal
          show={showUpdateModal}
          handleClose={handleCloseUpdateModal}
          postId={postId}
          originalPostContent={content}
        />

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

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Tweet</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this tweet?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Render comments */}
        <div className="mt-3">
          {comments?.map((c) => (
            <p key={c.id}>
              <strong>{c.authorId}:</strong> {c.content}
            </p>
          ))}
        </div>
      </Col>
    </Row>
  );
}