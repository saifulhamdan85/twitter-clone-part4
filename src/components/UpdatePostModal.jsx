import { useState, useContext } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { AuthContext } from "./AuthProvider";

export default function UpdatePostModal({
    show,
    handleClose,
    postId,
    originalPostContent,
}) {
    const [newPostContent, setNewPostContent] = useState(originalPostContent);
    const [newFile, setNewFile] = useState(null);

    const { currentUser, updatePost } = useContext(AuthContext);
    const userId = currentUser?.uid;

    const handleUpdate = async () => {
        if (!userId) return;
        await updatePost(userId, postId, newPostContent, newFile);
        handleClose();
        setNewPostContent(originalPostContent);
        setNewFile(null);
    };

    const handleNewFileChange = (e) => {
        setNewFile(e.target.files[0]);
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="postContent">
                            <Form.Control
                                defaultValue={originalPostContent}
                                as="textarea"
                                rows={3}
                                onChange={(e) => setNewPostContent(e.target.value)}
                            />
                            <br />
                            <Form.Control type="file" onChange={handleNewFileChange} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        className="rounded-pill"
                        onClick={handleUpdate}
                    >
                        Update
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}