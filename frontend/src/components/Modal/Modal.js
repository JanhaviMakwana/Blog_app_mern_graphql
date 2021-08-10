import ReactDOM from "react-dom";
import './Modal.css';

const Modal = props =>
    ReactDOM.createPortal(
        <div className="modal">
            <header className="modal_header">
                <h4>{props.title}</h4>
            </header>
            <div className="modal_content">
                {props.children}
            </div>
            <div className="modal_actions">
                <button className="button" onClick={props.onCancelModal}>
                    Cancel
                </button>
                <button className="button" onClick={props.onAcceptModal}>
                    Accept
                </button>
            </div>
        </div>,
        document.getElementById('modal-root')
    );

export default Modal;