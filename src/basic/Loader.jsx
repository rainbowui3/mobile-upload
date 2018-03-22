export default class Loader extends React.Component {

    render() {
        return (
            <span className="fa fa-spinner fa-pulse fa-5x" 
            	style={{fontSize: "100px", color: "#FFFFFF"}}>
            </span>
        );
    }

};


/**
 * Loader component prop types
 */
Loader.propTypes = {
    id: React.PropTypes.string.isRequired,
    side: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string])
};

/**
 * Get loader component default props
 */
Loader.defaultProps = {
    side: 150
};
