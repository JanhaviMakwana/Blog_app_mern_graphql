import React from 'react';
import Modal from '../../Modal/Modal';
import Backdrop from '../../Backdrop/Backdrop';
import { withState } from '../../../blog-content';
import { generateBase64FromImage } from '../../../utils/image';
import './FeedEdit.css';

const POST_FORM = {
    title: '',
    content: '',
    image: ''
}

class FeedEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            postForm: POST_FORM,
            imagePreview: null
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const selectedPost = this.props.selectedPost;
        if (this.props.editing && prevProps.editing !== this.props.editing &&
            prevProps.selectedPost !== this.props.selectedPost) {
            const postForm = {
                title: selectedPost.title,
                image: selectedPost.imageUrl,
                content: selectedPost.content
            }
            this.setState({ postForm: postForm });
        }
    }

    postInputChangeHandler = (event) => {
        const postForm = { ...this.state.postForm }
        if (event.target.name === 'image') {
            generateBase64FromImage(event.target.files[0])
                .then(b64 => this.setState({ imagePreview: b64 }))
                .catch(err => this.setState({ imagePreview: null }))
            postForm[event.target.name] = event.target.files[0];
        } else {
            postForm[event.target.name] = event.target.value;
        }

        this.setState({ postForm: postForm })
    }

    cancelPostChangeHandler = () => {
        this.setState({
            postForm: POST_FORM
        });
        this.props.onCancelEdit();

    }

    acceptPostChangeHandler = () => {
        const post = {
            title: this.state.postForm.title,
            image: this.state.postForm.image,
            content: this.state.postForm.content
        };
        this.props.onFinishEdit(post);
        this.setState({ postForm: POST_FORM, imagePreview: null });
    }

    render() {
        const { postForm } = this.state;
        return this.props.editing && (
            <React.Fragment>
                <Backdrop onClick={this.cancelPostChangeHandler} />
                <Modal
                    title="New Post"
                    onCancelModal={this.cancelPostChangeHandler}
                    onAcceptModal={this.acceptPostChangeHandler}
                >
                    <div className="feed_form">
                        <form>
                            <div className="input">
                                <label>Title</label>
                                <input
                                    name="title"
                                    value={postForm.title}
                                    type="text"
                                    onChange={this.postInputChangeHandler}
                                />
                            </div>
                            <div className="input">
                                <label>Image</label>
                                <input
                                    name="image"
                                    type="file"
                                    onChange={this.postInputChangeHandler}
                                />
                            </div>
                            <div className="new-post__preview-image">
                                {!this.state.imagePreview
                                    ? <p>Please choose an image.</p>
                                    : <img src={this.state.imagePreview} alt="" />}

                            </div>
                            <div className="input">
                                <label>Content</label>
                                <textarea
                                    name="content"
                                    value={postForm.content}
                                    onChange={this.postInputChangeHandler}
                                />
                            </div>

                        </form>
                    </div>
                </Modal>
            </React.Fragment>
        )
    }
}

export default withState(FeedEdit);