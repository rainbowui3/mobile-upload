import Component from "./Component";
import Param from "./Param";
import Icon from "../display/Icon";
import OnClickEvent from '../event/OnClickEvent';

export default class Command extends Component {

    constructor(props) {
        super(props);
    }

    getSize() {
        if (this.props.size != null && this.props.size != undefined) {
            return "btn-" + this.props.size;
        }
        return "";
    }

    /**
     * Render icon
     */
    renderIcon() {
        if (this.props.icon != null && this.props.icon != undefined) {
            if (this.props.value != null && this.props.value != undefined) {
                return (<Icon {...this.props}/>);
            }
            return (<Icon {...this.props}/>);
        }
        return "";
    }

    onClick(event) {
        event.preventDefault();
        if (this.getDisabled() == "disabled") {
            return;
        }

        if (!UITools.ValidatorContext.validate(this.props.causeValidation, this.props.validationGroup, this.props.exceptValidationGroup)) {
            return;
        }

        // handler onClick
        let clickEvent = new OnClickEvent(this, event, Param.getParameter(this));
        if (this.props.onClick) {
            if(global && global.UiClientEventRuleIntegration){
                global.UiClientEventRuleIntegration.uiClientEventProxyHandler(clickEvent,this.props.onClick);
            }else{
                this.props.onClick(new OnClickEvent(this, event, Param.getParameter(this)));
            }
        }else{
            if(global && global.UiClientEventRuleIntegration){
                global.UiClientEventRuleIntegration.uiClientEventProxyHandler(clickEvent);
            }
        }

        // handler onComplete
        if (this.props.onComplete != undefined) {
            eval(this.props.onComplete);
        }

        // handler update
        if (this.props.update != undefined) {
            UITools.UpdateContext.forceUpdate(this.props.update);
        }
    }

    componentDidMount() {
        UITools.UpdateContext.put(this.props.id, this);
    }

};


/**
 * Command component prop types
 */
Command.propTypes = $.extend({}, Component.propTypes, {
    //id: React.PropTypes.string,
    //value: React.PropTypes.string,
    //style: React.PropTypes.string,
    //styleClass: React.PropTypes.oneOf(["default", "primary", "success", "warning", "danger", "info"]),
    icon: React.PropTypes.string,
    size: React.PropTypes.oneOf(["lg", "sm", "xs", "block"]),
    //disabled: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string]),
    visibled: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string]),

    //onClick: React.PropTypes.func
});

/**
 * Get Command component default props
 */
Command.defaultProps = $.extend({}, Component.defaultProps, {
    //disabled: null,
    //styleClass: config.DEFAULT_STYLE_CLASS,
    size: null,
    visibled: true
});
