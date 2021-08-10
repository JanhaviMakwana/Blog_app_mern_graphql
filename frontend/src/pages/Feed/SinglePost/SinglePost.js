import React from 'react';
import { withState } from '../../../blog-content';
import { SET_ERROR } from '../../../store/actionTypes';
import './SinglePost.css';


class SinglePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            author: '',
            date: '',
            image: '',
            content: ''
        }
    }

    componentDidMount() {
        const postId = this.props.match.params.postId;

        const graphqlQuery = {
            query: `query FetchSinglePost($postId: ID!){
            post(id: $postId) {
                title
                content
                imageUrl
                creator {
                    name
                }
                createdAt
            }
            }
            `,
            variables: {
                postId: postId
            }
        }

        fetch('http://localhost:8080/graphql', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + this.props.state.token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(graphqlQuery)
        }).then(res => res.json())
            .then(resData => {
                if (resData.errors) {
                    console.log(resData.errors);
                    throw new Error('User creation failed!');
                }
                this.setState({
                    title: resData.data.post.title,
                    author: resData.data.post.creator.name,
                    image: 'http://localhost:8080/' + resData.data.post.imageUrl,
                    date: new Date(resData.data.post.createdAt).toLocaleDateString('en-US'),
                    content: resData.data.post.content
                });
            })
            .catch(err => {

                this.props.dispatch({ type: SET_ERROR, error: err });
            });
    }

    render() {
        return (
            <section className="single-post">
                <h1>{this.state.title}</h1>
                <h2>
                    Created by {this.state.author} on {this.state.date}
                </h2>
                <div className="single-post__image">
                    <img src={this.state.image} alt="" />
                </div>
                <p>{this.state.content}</p>
            </section>
        );
    }
};

export default withState(SinglePost);