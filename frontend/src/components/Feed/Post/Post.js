import './Post.css';

const post = props => (
    <article className="post">
        <header className="post__header">
            <h3 className="post__meta">
                Posted by {props.author} on {props.date}
            </h3>
            <h1 className="post__title">{props.title}</h1>
        </header>
        <div className="post__actions">
            <button className="button view_btn" mode="flat" onClick={props.onViewFullPost}>
                View
            </button>
            <button className="button edit_btn" mode="flat" onClick={props.onStartEdit}>
                Edit
            </button>
            <button className="button delete_btn" onClick={props.onDelete}>
                Delete
            </button>
        </div>
    </article>
);

export default post;