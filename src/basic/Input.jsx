import config from "config";
import Component from "./Component";
import Param from "./Param";
import Event from "./Event";
import OnChangeEvent from '../event/OnChangeEvent';
import OnBlurEvent from '../event/OnBlurEvent';
import OnFocusEvent from '../event/OnFocusEvent';


export default class Input extends Component {

    renderComponent() {
            if (this.props.layout == "vertical") {
                return this.renderVerticalLayout();
            }

            else if (this.props.layout == "horizontal") {
                return this.renderHorizontalLayout();
            }
    }

    renderVerticalLayout() {
        if (this.props.label) {
            return (
                <div className="form-group">
                    <label htmlFor={this.componentId}>
                        {this._label}
                        {this.renderHelpText()}
                        {this.renderRequired()}
                    </label>
                    <div>
                        {this.renderInputComponent()}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="form-group">
                    <label htmlFor={this.componentId}/>
                    <div>
                        {this.renderInputComponent()}
                    </div>
                </div>
            );
        }
    }

    /*** Render horizontal layout */
    renderHorizontalLayout() {
        let styleClassArray = this.getStyleClassArray();
        let styleClassWidth = this.getStyleClassWidth();
        let labelWidth = null, inputWidth = null;

        if (styleClassWidth.length != 0) {
            labelWidth = styleClassWidth[0];
            inputWidth = styleClassWidth[1];
        }

        if (this.props.label) {
            return (
                <div className="form-group row">
                    <label htmlFor={this.componentId} className={styleClassArray[0] + " col-form-label"}
                           style={{width: labelWidth}}>
                        {this._label}
                        {this.renderHelpText()}
                        {this.renderRequired()}
                    </label>
                    <div className={styleClassArray[1]} style={{width: inputWidth}}>{this.renderInputComponent()}</div>
                </div>
            );
        } else {
            return (
                <div className="form-group row">
                    <label htmlFor={this.componentId} className={styleClassArray[0] + " col-form-label"}
                           style={{width: labelWidth}}/>
                    <div className={styleClassArray[1]} style={{width: inputWidth}}>{this.renderInputComponent()}</div>
                </div>
            );
        }
    }

    /*** Render input component */
    renderInputComponent() {
        if (this.props.io == "in" || this.props.io == null) {
            return this.renderInput();
        } else if (this.props.io == "out") {
            return this.renderOutput();
        }

        return null;
    }

    /*** Render input */
    renderInput() {
        return null;
    }

    /*** Render output */
    renderOutput() {
        return (
            <span id={this.componentId} className="outPutText" style={this.props.style}>
                {this.getOutputValue()}
            </span>
        );
    }

    /*** Get output value */
    getOutputValue() {
        let value = this.getComponentValue();

        if (this.props.mask != null && this.props.mask != undefined) {
            value = UITools.StringUtil.mask(value, this.props.mask);
        }

        return value;
    }

    /*** Set component value */
    setComponentValue(event) {
        let inputValue = UITools.Convertor.getAsObject(this.getConvertorId(), this, this.getInputValue(event));

        /*
        * UIPercent componet limit error handler
        */
        if (this.props.limit) {
            if (inputValue >= parseFloat(this.props.limit) / 100) {
                inputValue = parseFloat(this.props.limit) / 100;
            }
        }

        // handler valueLink & value
        if (this.props.valueLink) {
            this.props.valueLink.requestChange(inputValue);
        } else {
            this.setValue(this.props.value, inputValue);
        }
    }

    getEventNewValue(event) {
        let inputValue = UITools.Convertor.getAsObject(this.getConvertorId(), this, this.getInputValue(event));

        /*
         * UIPercent componet limit error handler
         */
        if (this.props.limit) {
            if (inputValue >= parseFloat(this.props.limit) / 100) {
                inputValue = parseFloat(this.props.limit) / 100;
            }
        }

        return inputValue;
    }

    /**
     * Get component value
     * If value is not null, it get value. else it get default value.
     */
    getComponentValue() {
        let value = null, {defaultValue} = this.props;

        if (this.props.valueLink) {
            value = this.props.valueLink.value;
        } else {
            value = this.getValue(this.props.value);
        }

        // if value is null or undefined, and default value is not null or not defined, set default value to component value
        if ((value == null || value == undefined) && (defaultValue != null && defaultValue != undefined)) {
            value = defaultValue;
            if (this.props.valueLink) {
                this.props.valueLink.requestChange(value);
            } else {
                this.setValue(this.props.value, UITools.Convertor.getAsObject(this.getConvertorId(), this, value));
            }
        }

        return UITools.Convertor.getAsString(this.getConvertorId(), this, value);
    }

    /**
     * Set value
     */


    setValue(value, inputValue) {
        const model = this.props.model;
        const property = this.props.property;
        if (UITools.ELUtil.isEL(value)) {
            value = UITools.ELUtil.getELContent(value);
            let index = value.indexOf('.');
            let prefix = value.substr(0, index);
            let suffix = null;
            //model[0].a.b || model.a.b
            if (prefix.indexOf("[") != -1) {
                let i = prefix.indexOf("[");
                prefix = value.substr(0, i);//model[0]
                suffix = value.substr(i, value.length);//.a.b
            } else {
                suffix = value.substr(index + 1, value.length);//a.b
                suffix = "." + suffix;//.a.b
            }

            let contextModel = UITools.DataContext.get(prefix);

            const su1Index = suffix.lastIndexOf(".");

            const subProperty = suffix.substr(su1Index + 1, suffix.length);

            const suModel = suffix.substr(0, su1Index);

            const InputObject = eval("contextModel" + suModel);

            InputObject[subProperty] = inputValue;

        } else if (model != null && property != null) {
            model[property] = inputValue;
        } else if (value != null){
            value = inputValue;
        } else {
            UITools.DataContext.put(this.componentId, inputValue);
        }
    }


    /**
     * Get value
     */

    getValue(value) {
        let inputValue = null;
        const model = this.props.model;
        const property = this.props.property;
        if (UITools.ELUtil.isEL(value)) {
            value = UITools.ELUtil.getELContent(value);
            try {
                inputValue = eval(value);
            } catch (e) {
                let index = value.indexOf('.');
                let prefix = value.substr(0, index);
                let suffix = null;
                if (prefix.indexOf("[") != -1) {
                    let i = prefix.indexOf("[");
                    prefix = value.substr(0, i);
                    suffix = value.substr(i, value.length);
                } else {
                    suffix = value.substr(index + 1, value.length);
                    suffix = "." + suffix;
                }

                let contextModel = UITools.DataContext.get(prefix);
                if (contextModel != undefined) {
                    inputValue = eval("contextModel" + suffix);
                }
            }
        } else if (this.isFunction(value)) {
            inputValue = value();
        } else if (value != null) {
            inputValue = value;
        } else if (model != null && property != null) {
            for (let props in model) {
                if (props == property) {
                    inputValue = model[props];
                    break;
                }
            }
        } else {
            inputValue = UITools.DataContext.get(this.componentId);
        }

        return inputValue;

    }

    /**
     * Get prefix and suffix json from value
     */
    getPrefixSuffixJson(value) {
        let psJson = {};
        let index = value.indexOf('.');
        psJson.prefix = value.substr(0, index);

        //model[0].a.b || model.a.b
        if (psJson.prefix.indexOf("[") != -1) {
            let leftIndex = psJson.prefix.indexOf("[");
            let rightIndex = psJson.prefix.indexOf("]");
            psJson.count = psJson.prefix.substr(leftIndex + 1, rightIndex - leftIndex - 1); // 0

            psJson.prefix = value.substr(0, leftIndex);//model
        }
        psJson.suffix = value.substr(index + 1, value.length);//a.b

        return psJson;
    }

    getValidatorId() {
        return null;
    }

    getConvertorId() {
        return null;
    }

    getComponent() {
        let inputRef = this.getInputRefProperty();
        return $(React.findDOMNode(this.refs[inputRef]));
    }

    getInputValue(event) {
        // let inputRef = this.getInputRefProperty();
        // if (React.findDOMNode(this.refs[inputRef])) {
        //     return React.findDOMNode(this.refs[inputRef]).value;
        // } else {
        //     return "";
        // }

        return $('#' + this.componentId).val();
    }

    initEvent() {
        let _self = this;
        let me = $("#" + this.componentId);
        // handler input propertychange
        me.bind("input propertychange", (event) => {
            //排除DateTimePicker在手动输入时超限的问题
            if (!(_self.props.manualInput && _self.parseBool(_self.props.manualInput))) {
                _self.setComponentValue(event);
            }
        });

        // handle onchange event
        me.bind("change", (event) => {
            _self.onChangeCallback(_self);
        });

        // handle onblur event
        me.bind("blur", (event) => {
            if (_self.props.onBlur) {
                _self.props.onBlur(new OnBlurEvent(_self, event, Param.getParameter(_self), null, null));
            }
        });

        // handle onfocus event
        me.bind("focus", (event) => {
            if (_self.props.onFocus) {
                _self.props.onFocus(new OnFocusEvent(_self, event, Param.getParameter(_self), null, null));
            }
        });

        me.bind("keydown", (event) => {
            if (_self.props.onKeyDown) {
                _self.props.onKeyDown(new OnFocusEvent(_self, event, Param.getParameter(_self), null, null));
            }
        });

        me.bind("contextmenu", (event) => {
            if (UITools.Util.parseBool(this.props.unableContext)) {
                return false;
            }
        });

        me.bind("paste", (event) => {
            if (UITools.Util.parseBool(this.props.unablePaste)) {
                return false;
            }
        });
    }

    onChangeCallback(_self) {
        let value = _self.getInputValue(event);
        if (_self.getDigitValue) {
            value = _self.getDigitValue(value);
        }
        let valueChangeEvent = new OnChangeEvent(_self, event, Param.getParameter(_self), value, _self.onEvent.newValue);
        if (_self.props.onChange) {
            if(global && global.UiClientEventRuleIntegration){
                global.UiClientEventRuleIntegration.uiClientEventProxyHandler(valueChangeEvent,_self.props.onChange);
            }else{
                _self.props.onChange(valueChangeEvent);
            }
        }else{
            if(global && global.UiClientEventRuleIntegration){
                global.UiClientEventRuleIntegration.uiClientEventProxyHandler(valueChangeEvent);
            }
        }

        _self.onEvent = {newValue: value, oldValue: _self.onEvent.newValue};
    }

    /*** Get input ref property  */
    getInputRefProperty() {
        let refProperty = this.getRefProperty();
        return refProperty + "_ref";
    }
    /*** Init value */
    initValue() {
        $("#" + this.componentId).val(this.getComponentValue());
    }

    /*** Init disabled */
    initDisabled() {
        $("#" + this.componentId).attr("disabled", this.getDisabled());
    }

    initReadOnly() {

    }

    /*** Init property */
    initProperty() {
        this.initValue();

        this.initDisabled();

        this.initReadOnly();
    }

    /*** Init component */
    initComponent() {
    }

    /*** Init validator */
    initValidator() {
        UITools.ValidatorContext.removeValidator(this.getValidationGroup(), this.componentId);

        if (this.props.io == "in" || this.props.io == null) {
            UITools.Validator.validate("InputValidator", this);

            // call component validator
            UITools.Validator.validate(this.getValidatorId(), this);
        }
    }

    getValidationGroup() {
        if (this.props.validationGroup == null || this.props.validationGroup == undefined) {
            return "commonValidation";
        } else {
            return this.props.validationGroup;
        }
    }

    /**
     * render children comonent required
     */
    renderRequired() {
        if (this.parseBool(this._required) && this.props.io != "out") {
            return (
                <span id={this.componentId + "_required"} className="glyphicon glyphicon-asterisk"
                      data-toggle="tooltip" data-placement="top" title={this.props.label + " is required."}
                      style={{paddingLeft: "5px", color: "#ff5555",transform:"scale(0.7)"}}>
				</span>
            );
        }
    }

    /**
     * render children comonent helpText
     */
    renderHelpText() {
        if (this.props.helpText != null && this.props.helpText != undefined) {
            return (
                <span id={this.componentId + "_helpText"} className="fa fa-question-circle fa-lx"
                      data-toggle="tooltip" data-placement="top" title={this.props.helpText}
                      style={{paddingLeft: "5px", color: "#ed9c28"}}>
				</span>
            );
        }
    }

    getWidthAllocation() {
        let allocation = this.props.widthAllocation.split(",");
        let widthAllocation = [];
        widthAllocation[0] = UITools.StringUtil.trim(allocation[0]);
        widthAllocation[1] = UITools.StringUtil.trim(allocation[1]);

        return widthAllocation;
    }

    getStyleClassArray() {
        let allocation = this.getWidthAllocation();
        let styleClass = [];
        styleClass[0] = "col-sm-" + allocation[0] + " col-md-" + allocation[0] + " col-lg-" + allocation[0];
        styleClass[1] = "col-sm-" + allocation[1] + " col-md-" + allocation[1] + " col-lg-" + allocation[1];

        return styleClass;
    }

    getStyleClassWidth() {
        let styleClassWidth = [];
        let colspan = this.props.colspan;

        if (colspan != null && colspan != undefined) {
            let allocation = this.getWidthAllocation();
            styleClassWidth[0] = ((100 * allocation[0]) / (12 * colspan)).toFixed(8) + "%";
            styleClassWidth[1] = 100 - ((100 * allocation[0]) / (12 * colspan)).toFixed(8) + "%";
        }

        return styleClassWidth;
    }

    setProperty() {
        super.setProperty();

        this._label = this.getProperty("label");
        this._required = this.getProperty("required");
    }

    componentWillMount() {
        super._componentWillMount();

        this.onEvent = {newValue: this.getComponentValue(), oldValue: null};
    }

    componentDidMount() {
        super._componentDidMount();

        if (this.props.io != "out") {
            this.initEvent();
            this.initProperty();
            this.initValidator();
            this.initComponent();

            Event.initEventListener(this);

            UITools.UpdateContext.put(this.componentId, this);
        }
    }

    componentWillUpdate(nextProps, nextState) {
        super._componentWillUpdate();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.io != "out") {
            let object = $("#" + this.componentId);
            if (object.length != 0) {
                if (object.length > 0 && $._data(object[0], "events") == undefined) {
                    this.initEvent();
                }
            } else {
                object = $("input[name=" + this.componentId + "]");
                if (object.length > 0 && $._data(object[0], "events") == undefined) {
                    this.initCodeTableEvent();
                }
            }

            //if($("#" + this.componentId).length > 0 && $._data($("#" + this.componentId)[0], "events") == undefined){
            //	this.initEvent();
            //}

            if (document.activeElement != null && document.activeElement.id != this.componentId) {
                this.initProperty();
            }

            this.initValidator();
            if (prevProps.io == "out" || !this.parseBool(prevProps.visibled)) {
                this.initComponent();
            }
        }
    }

    initCodeTableEvent() {

    }

};

// Minxin
//reactMixin.onClass(Input, BindToMixin);

/**
 * Input component prop types
 */
Input.propTypes = $.extend({}, Component.propTypes, {
    label: React.PropTypes.string,
    hasLabel: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string]),
    validationLabel: React.PropTypes.string,
    valueLink: React.PropTypes.shape({
        value: React.PropTypes.string.isRequired,
        requestChange: React.PropTypes.func.isRequired
    }),
    defaultValue: React.PropTypes.string,
    io: React.PropTypes.oneOf(["in", "out"]),
    placeHolder: React.PropTypes.string,
    //pattern: React.PropTypes.string,
    format: React.PropTypes.string,
    mask: React.PropTypes.string,
    helpText: React.PropTypes.string,
    layout: React.PropTypes.oneOf(["horizontal", "vertical"]),
    widthAllocation: React.PropTypes.string,
    styleClassAllocation: React.PropTypes.string,
    validationGroup: React.PropTypes.string,

    required: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string]),
    unableContext: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string]),
    unablePaste: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string]),

    minLength: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]),
    maxLength: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]),
    minLengthMessage: React.PropTypes.string,
    maxLengthMessage: React.PropTypes.string,
    requiredMessage: React.PropTypes.string,
    //componentType: React.PropTypes.string,

    onChange: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    //onSelect, onPropertyChange
});

/**
 * Get Input component default props
 */
Input.defaultProps = $.extend({}, Component.defaultProps, {
    io: "in",
    //causeValidation: true,
    defaultValue: null,
    required: false,
    layout: config.DEFAULT_INPUT_LAYOUT,
    widthAllocation: "4,8",
    componentType: "INPUT",
    unableContext: "false",
    unablePaste: "false",

    onChange: () => {
    },
    onBlur: () => {
    },
    onFocus: () => {
    }
});
