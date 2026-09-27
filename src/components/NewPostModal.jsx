import { useState, useContext } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { AuthContext } from "./AuthProvider";

export default function NewPostModal({ show, handleClose }) {
  const [postContent, setPostContent] = useState("");
  const [file, setFile] = useState(null);
  const { currentUser, savePost } = useContext(AuthContext);
  const userId = currentUser?.uid;

  const handleSave = () => {
    if (userId) {
      savePost(userId, postContent, file);
      handleClose();
      setPostContent('');
      setFile(null);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  }

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="postContent">
              <Form.Control
                placeholder="What is happening?!"
                as="textarea"
                rows={3}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
              <br />
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            className="rounded-pill"
            onClick={handleSave}
          >
            Tweet
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}