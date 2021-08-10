import './Paginator.css';

const paginator = props => (
    <div className="paginator">
        {props.children}
        <div className="paginator__controls">
            {props.currentPage > 1 && (
                <button className="button prev" onClick={props.onPrevious}>Previous</button>
            )}
            {props.currentPage < props.lastPage && (
                <button className="button next" onClick={props.onNext}>Next</button>
            )}
        </div>
    </div>
);

export default paginator;