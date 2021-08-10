import React from 'react';
import { withRouter } from 'react-router-dom';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Paginator from '../../components/Paginator/Paginator';
import Post from '../../components/Feed/Post/Post';
import Loader from '../../components/Loader/Loader';
import { withState } from '../../blog-content';
import { SET_ERROR } from '../../store/actionTypes';
import './Feed.css';

class Feed extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isEditing: false,
            posts: [],
            totalPosts: 0,
            editPost: null,
            status: '',
            postPage: 1,
            postLoading: true,
            editLoading: false
        }
    }

    componentDidMount() {
        const graphqlQuery = {
            query: `
            {
                user{
                    status
                }
            }
            `
        }
        fetch('http://localhost:8080/graphql', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + this.props.state.token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(graphqlQuery)
        })
            .then(res => {
                return res.json();
            })
            .then(resData => {
                if (resData.errors) {
                    throw new Error('Fetching status failed!');
                }
                this.setState({ status: resData.data.user.status });
            })
            .catch(err => {
                this.props.dispatch({type: SET_ERROR, error: err});
            })
        this.loadPosts();
    }

    newPostHandler = () => {
        this.setState({ isEditing: true })
    }

    loadPosts = direction => {
        if (direction) {
            this.setState({ postLoading: true, posts: [] })
        }

        let page = this.state.postPage;
        if (direction === 'next') {
            page++;
            this.setState({ postPage: page })
        }
        if (direction === 'previous') {
            page--;
            this.setState({ postPage: page })
        }
        const graphqlQuery = {
            query: `
            query FetchPosts($page: Int)
            {
              posts(page: $page) {
                posts {
                  _id
                  title
                  content
                  creator {
                    name
                  }
                  createdAt
                }
                totalPosts
              }
            }
            `,
            variables: {
                page: page
            }
        }
        fetch('http://localhost:8080/graphql', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + this.props.state.token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(graphqlQuery)
        })
            .then(res => {
                return res.json();
            })
            .then(resData => {

                if (resData.errors) {
                    throw new Error('Fetching posts failed!');
                }

                this.setState({
                    posts: resData.data.posts.posts,
                    totalPosts: resData.data.posts.totalPosts,
                    postLoading: false
                })
            }).catch(err => {
                this.props.dispatch({type: SET_ERROR, error: err});
            })

    }

    cancelEditHandler = () => {
        this.setState({ isEditing: false, editPost: null });
    }


    finishEditHandler = async (postData) => {

        const formData = new FormData();
        formData.append('image', postData.image);
        this.setState({ editLoading: true });
        if (this.state.editPost && this.state.editPost.imageUrl) {
            formData.append('oldPath', this.state.editPost.imageUrl);
        }
        fetch('http://localhost:8080/post-image', {
            method: 'PUT',
            headers: {
                Authorization: 'Bearer ' + this.props.state.token
            },
            body: formData
        }).then(res => {
            return res.json()
        }).then(fileResData => {
            const imageUrl = (fileResData.filePath && fileResData.filePath.replace("\\", '/')) || 'undefined';

            let graphqlQuery = {
                query: `
                mutation CreateNewPost($title: String!, $content: String!, $imageUrl: String!){
                    createPost(postInput: {title: $title, content: $content, imageUrl: $imageUrl}){
                        _id
                        title
                        content
                        imageUrl
                        creator {
                            name
                        }
                        createdAt
                    }
                } `,
                variables: {
                    title: postData.title,
                    content: postData.content,
                    imageUrl: imageUrl
                }
            }


            if (this.state.editPost) {
                graphqlQuery = {
                    query: `
                    mutation UpdateExistingPost($postId: ID!, $title: String!, $content: String!, $imageUrl: String! ) {
                        updatePost(id: $postId postInput: {title: $title, content: $content, imageUrl: $imageUrl}){
                            _id
                            title
                            content
                            imageUrl
                            creator {
                                name
                            }
                            createdAt
                        }
                    } `,
                    variables: {
                        postId: this.state.editPost._id,
                        title: postData.title,
                        content: postData.content,
                        imageUrl: imageUrl
                    }
                }
            }

            return fetch('http://localhost:8080/graphql', {
                method: 'POST',
                body: JSON.stringify(graphqlQuery),
                headers: {
                    Authorization: 'Bearer ' + this.props.state.token,
                    'Content-Type': 'application/json'
                }
            })

        })
            .then(res => {
                return res.json();
            })
            .then(resData => {
                if (resData.errors && resData.errors[0].status === 422) {
                    throw new Error("Validation failed. Make sure the email address isn't used yet!");
                };
                if (resData.errors) {
                    
                    throw new Error('User creation failed!');
                }

                let resDataField = 'createPost';
                if (this.state.editPost) {
                    resDataField = 'updatePost'
                }
                
                const post = {
                    _id: resData.data[resDataField]._id,
                    title: resData.data[resDataField].title,
                    content: resData.data[resDataField].content,
                    creator: resData.data[resDataField].creator,
                    createdAt: resData.data[resDataField].createdAt,
                    imageUrl: resData.data[resDataField].imageUrl
                }
                this.setState(prevState => {
                    let updatedPosts = [...prevState.posts];
                    let updatedTotalPosts = prevState.totalPosts;
                    if (prevState.editPost) {

                        const postIndex = prevState.posts.findIndex(p => p._id === prevState.editPost._id);
                        updatedPosts[postIndex] = post;
                    } else {
                        updatedTotalPosts++;
                        if (prevState.posts.length >= 2) {
                            updatedPosts.pop();
                        }
                        updatedPosts.unshift(post);
                    }

                    return {
                        posts: updatedPosts,
                        isEditing: false,
                        editPost: null,
                        editLoading: false,
                        totalPosts: updatedTotalPosts
                    };
                });

            })
            .catch(err => {
                this.props.dispatch({type: SET_ERROR, error: err});
                this.setState({
                    isEditing: false,
                    editPost: null,
                    editLoading: false,
                    error: err
                });
            })

    }

    onViewFullPostHandler = (id) => {
        this.props.history.replace(`/${id}`);
    }

    startEditPostHandler = (postId) => {
        this.setState(prevState => {
            const loadedPost = { ...prevState.posts.find(p => p._id === postId) };

            return {
                isEditing: true,
                editPost: loadedPost
            };
        });
    }

    deletePostHandler = (id) => {
        this.setState({ postLoading: true })
        const graphqlQuery = {
            query: `
            mutation {
                deletePost(id: "${id}")
            }
            `
        }
        fetch('http://localhost:8080/graphql', {
            method: 'POST',
            body: JSON.stringify(graphqlQuery),
            headers: {
                Authorization: 'Bearer ' + this.props.state.token,
                'Content-Type': 'application/json'
            }
        }).then(res => {
            return res.json();
        })
            .then(resData => {
                if (resData.errors) {
                    throw new Error('User creation failed!');
                }
                this.loadPosts();
            }).catch(err => {
                this.props.dispatch({type: SET_ERROR, error: err});
                this.setState({ postsLoading: false });
            })

    }
    statusInputChangeHandler = (event) => {
        this.setState({ status: event.target.value });
    };

    statusUpdateHandler = (event) => {
        event.preventDefault();
        const graphqlQuery = {
            query: `
                mutation UpdateUserStatus($userStatus: String!) {
                    updateStatus(status: $userStatus){
                        status
                    }
                }
            `,
            variables: {
                userStatus: this.state.status
            }
        };
        fetch('http://localhost:8080/graphql', {
            method: 'POST',
            body: JSON.stringify(graphqlQuery),
            headers: {
                Authorization: 'Bearer ' + this.props.state.token,
                'Content-Type': 'application/json'
            }
        }).then(res => {
            return res.json();
        })
            .then(resData => {
                
                if (resData.errors) {
                    
                    throw new Error('User creation failed!');
                }
            }).catch(err => {
                this.props.dispatch({type: SET_ERROR, error: err});
            })
    }

    render() {
        
        return (
            <React.Fragment>
                <FeedEdit
                    editing={this.state.isEditing}
                    selectedPost={this.state.editPost}
                    onCancelEdit={this.cancelEditHandler}
                    onFinishEdit={this.finishEditHandler}
                />
                <section className="feed_status">  {/* feed status */}
                    <form onSubmit={this.statusUpdateHandler}>
                        <div className="input">
                            <input

                                type="text"
                                placeholder="Your Status"
                                onChange={this.statusInputChangeHandler}
                                value={this.state.status}
                            />
                        </div>
                        <button className="button" type="submit">
                            UPDATE
                        </button>
                    </form>
                </section>
                <section className="feed_control"> {/* new post */}
                    <button className="button new_post_btn" onClick={this.newPostHandler}>New Post</button>
                </section>
                <section className="feed"> {/* feed */}
                    {this.state.postLoading && (
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <Loader />
                        </div>
                    )}
                    {this.state.posts.length <= 0 && !this.state.postsLoading ? (
                        <p style={{ textAlign: 'center' }}>No posts found.</p>
                    ) : null}

                    {!this.state.postLoading && (<Paginator
                        onPrevious={() => this.loadPosts('previous')}
                        onNext={() => this.loadPosts('next')}
                        lastPage={Math.ceil(this.state.totalPosts / 2)}
                        currentPage={this.state.postPage}
                    >
                        {this.state.posts.map(post => {

                            return <Post
                                key={post._id}
                                author={post.creator.name}
                                date={new Date(post.createdAt).toLocaleDateString('en-US')}
                                title={post.title}
                                image={post.imageUrl}
                                content={post.content}
                                onViewFullPost={() => this.onViewFullPostHandler(post._id)}
                                onStartEdit={() => this.startEditPostHandler(post._id)}
                                onDelete={() => this.deletePostHandler(post._id)}
                            />
                        })}
                    </Paginator>)}
                </section>
            </React.Fragment>
        );
    }
}

export default withRouter(withState(Feed));