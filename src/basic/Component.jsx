import reactMixin from "react-mixin";
import config from "config";

export default class Component extends React.Component {

    constructor(props) {
        super(props);
        //this.state = {};
    }

    render() {
        this.setProperty();

        if (this.parseBool(this._visibled)) {
            return this.renderComponent();
        }
        return null;
    }

    renderComponent() {
        return null;
    }

    /*** Get component property */
    getProperty(propertyName, component) {
        let _self = component ? component : this;
        let property = _self.props[propertyName];

        if (this.isFunction(property)) {
            return property(_self);
        }

        return property;
    }

    getId() {
        return this.componentId;
    }

    /*** Get ref property  id */
    getRefProperty() {
        // for ref is the key word in react,use refName to define ref.
        if(this.props.refName){
            return this.props.refName;
        }else{
            return this.getId();
        }
    }

    /*** Get composed ref property  */
    getComposedRefProperty() {
       let refProperty = this.getRefProperty();
        return refProperty + "_composed";
    }

    getName() {
        return this.componentId;
    }

    getNameForTest() {
        return this.componentName;
    }

    getDisabled() {
        if (this.parseBool(this.getProperty("disabled")) || !this.parseBool(this.getProperty("enabled"))) {
            return "disabled";
        }
        return null;
    }

    getReadOnly() {
        if (this.parseBool(this.getProperty("readonly"))) {
            return "disabled";
        }
        return null;
    }

    getURL() {
        let url = this.getProperty("url")
       // if (url.indexOf("?") > -1) {
       //     url = url + "&" + sessionStorage.getItem("Authorization");
       // } else {
       //     url = url + "?" + sessionStorage.getItem("Authorization");
       // }

        return url;
    }

    setProperty() {
        this._disabled = this.getProperty("disabled");
        this._enabled = this.getProperty("enabled");
        this._visibled = this.getProperty("visibled");

    }

    componentWillMount() {
        this._componentWillMount();
    }

    _componentWillMount() {
        this.componentId = (this.props.id) ? this.props.id : this.generateId();

        this.componentName = "";
        if (this.props.id) {
            this.componentName = this.props.id;
        } else {
            const props = this.props;
            const arr = [props.label, props.value, props.valueLink, props.model, props.property];

            for (let i = 0; i < arr.length; i++) {
                if (arr[i]) {
                    this.componentName += arr[i];
                }
            }
            this.componentName = this.componentName.replace(/[#\{\}\.\[\] ]/g, "_").replace(/_+/g, "_");
            if (this.componentName[this.componentName.length - 1] == "_") {
                this.componentName = this.componentName.substring(0, this.componentName.length - 1);
            }
        }

        //this.setProperty();
    }

    componentDidMount() {
        this._componentDidMount();
    }

    _componentDidMount() {
        this.addComponentId();
    }

    componentWillUpdate() {
        this._componentWillUpdate();
    }

    _componentWillUpdate() {
        //this.setProperty();
    }

    componentDidUpdate() {
        this._componentDidUpdate();
    }

    _componentDidUpdate() {

    }

}

// Mixin Class
reactMixin.onClass(Component, UITools.Util);
reactMixin.onClass(Component, UITools.Classable);
reactMixin.onClass(Component, UITools.UniqueId);

/**
 * Component component prop types
 */
Component.propTypes = {
    id: React.PropTypes.string,
    name: React.PropTypes.string,
    value: React.PropTypes.string,
    style: React.PropTypes.object,
    styleClass: React.PropTypes.oneOf(["default", "primary", "success", "warning", "danger", "info"]),
    className: React.PropTypes.string,
    enabled: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string, React.PropTypes.func]),
    disabled: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string, React.PropTypes.func]),
    visibled: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string]),

    onClick: React.PropTypes.func
};

/**
 * Get component component default props
 */
Component.defaultProps = {
    enabled: function() {
        const page_readOnly = UITools.DataContext.get("PAGE_READONLY");
            if(page_readOnly == null) {
                return true;
            } else {
                return !page_readOnly;
            }
    },
    disabled: function(){
        const page_readOnly = UITools.DataContext.get("PAGE_READONLY");
        if(page_readOnly == null) {
            return false;
        } else {
            return page_readOnly;
        }
    },
    visibled: true,
    style: {},
    styleClass: config.DEFAULT_STYLE_CLASS,

    onClick: () => {}
};

