import React from 'react';
import { withRouter } from 'react-router-dom';
import { withState } from '../../blog-content';
import { AUTH_FAIL } from '../../store/actionTypes';

class Signup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            signupForm: {
                email: '',
                password: '',
                name: ''
            }
        }
    }

    inputChangeHandler = (event) => {
        this.setState(prevState => {
            const updatedForm = {
                ...prevState.signupForm,
                [event.target.name]: [event.target.value]
            }
            return { signupForm: updatedForm }
        })
    }

    onSignup = (event) => {
        event.preventDefault();
        const { signupForm } = this.state;
        const graphqlQuery = {
            query: `
            mutation CreateNewUser($email: String!, $name: String!, $password: String!){
                createUser(userInput: {email: $email, name: $name, password: $password}) {
                    _id
                    email
                }
            } `,
            variables: {
                email: signupForm.email,
                password: signupForm.password,
                name: signupForm.name
            }
        }

        fetch('http://localhost:8080/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(graphqlQuery)
        })
            .then(res => {
                return res.json();
            })
            .then(resData => {
                localStorage.setItem('token', resData.token);
                localStorage.setItem('userId', resData.userId);
                const remainingMilliseconds = 60 * 60 * 1000;
                const expiryDate = new Date(
                    new Date().getTime() + remainingMilliseconds
                );
                localStorage.setItem('expiryDate', expiryDate.toISOString());
                this.props.logout(remainingMilliseconds);
                if (resData.errors && resData.errors[0].status === 422) {
                    throw new Error("Validation failed. Make sure the email address isn't used yet!");
                };
                if (resData.errors) {
                    throw new Error('User creation failed!');
                }
            })
            .catch(err => {
                this.props.dispatch({ type: AUTH_FAIL, error: err });
                this.props.history.replace('/');
            })
    }

    render() {
        const { signupForm } = this.state;
        return (
            <div className="auth-form">
                <form onSubmit={this.onSignup}>
                    <div className="input">
                        <label>your email</label>
                        <input
                            name="email"
                            placeholder="Email"
                            value={signupForm.email}
                            onChange={this.inputChangeHandler}
                        />
                    </div>
                    <div className="input">
                        <label>password</label>
                        <input
                            name="password"
                            placeholder="Password"
                            value={signupForm.password}
                            onChange={this.inputChangeHandler}
                        />
                    </div>
                    <div className="input">
                        <label>your name</label>
                        <input
                            name="name"
                            placeholder="Name"
                            value={signupForm.name}
                            onChange={this.inputChangeHandler}
                        />
                    </div>
                    <button className="button" type="submit">Sign up</button>
                </form>
            </div>
        );
    }
}

export default withRouter(withState(Signup));