import React from 'react';
import Modal from '../Modal/Modal';
import Backdrop from '../Backdrop/Backdrop';
import { withState } from '../../blog-content';


const errorHandler = props => (
    <React.Fragment>
        {props.state.error && <Backdrop onClick={props.onHandle} />}
        {
            props.state.error && (
                <Modal
                    title="An Error Occurred"
                    onCancelModal={props.onHandle}
                    onAcceptModal={props.onHandle}
                >
                    <p>{props.state.error.message}</p>
                </Modal>
            )
        }
    </React.Fragment>
);

export default withState(errorHandler);