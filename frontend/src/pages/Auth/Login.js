import React from 'react';
import { withRouter } from 'react-router-dom';
import { withState } from '../../blog-content';
import { AUTH_FAIL, AUTH_SUCCESS } from '../../store/actionTypes';


class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loginForm: {
                email: '',
                password: ''
            }
        }
    }

    inputChangeHandler = (event) => {
        this.setState(prevState => {
            const updatedForm = {
                ...prevState.loginForm,
                [event.target.name]: [event.target.value]
            }
            return { loginForm: updatedForm };
        })
    }

    onLogin = (event) => {
        const { loginForm } = this.state;
        event.preventDefault();
        const graphqlQuery = {
            query: `
            query UserLogin($email: String!, $password: String!){
                login(email: $email, password: $password) {
                    token
                    userId
                }
            }`,
            variables: {
                email: loginForm.email,
                password: loginForm.password
            }
        };
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
                localStorage.setItem('token', resData.data.login.token);
                localStorage.setItem('userId', resData.data.login.userId);
                const remainingMilliseconds = 60 * 60 * 1000;
                const expiryDate = new Date(
                    new Date().getTime() + remainingMilliseconds
                );
                localStorage.setItem('expiryDate', expiryDate.toISOString());
                this.props.logout(remainingMilliseconds);
                this.props.dispatch({ type: AUTH_SUCCESS, token: resData.data.login.token, userId: resData.data.login.userId })
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
        const { loginForm } = this.state;
        return (
            <div className="auth-form">
                <form onSubmit={this.onLogin}>
                    <div className="input">
                        <label>your email</label>
                        <input
                            name="email"
                            placeholder="email"
                            value={loginForm.email}
                            onChange={this.inputChangeHandler}
                        />
                    </div>
                    <div className="input">
                        <label>password</label>
                        <input
                            name="password"
                            placeholder="password"
                            value={loginForm.password}
                            onChange={this.inputChangeHandler}
                        />
                    </div>
                    <button className="button auth_btn" type="submit">Login</button>
                </form>
            </div>
        );
    }

}

export default withRouter(withState(Login));