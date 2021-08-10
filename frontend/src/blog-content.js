import { createContext, useReducer } from 'react';
import reducer, { initialState } from './store/authReducer';

const BlogContext = createContext();

const Store = (props) => {

    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <BlogContext.Provider value={{ state, dispatch }}>
            {props.children}
        </BlogContext.Provider>
    );
};

const withState = (Child) => (props) => (
    <BlogContext.Consumer>
        {(context) => <Child {...props} {...context} />}
    </BlogContext.Consumer>
);

export { Store, withState };