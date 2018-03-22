import Input from "./Input";
import Param from "./Param";
import Event from "./Event";
import OnChangeEvent from '../event/OnChangeEvent';
import OnFocusEvent from '../event/OnFocusEvent';
import OnBlurEvent from '../event/OnBlurEvent';
import CodeTable from '../basic/CodeTable';

export default class KeyValue extends Input {

	componentWillMount(){
		super._componentWillMount();

        this.initCodeTable(this.props);

		this.onEvent = {newValue: this.getComponentValue(), oldValue: null};
	}

	componentDidMount(){
		super._componentDidMount();
		if(this.props.io != "out"){
			this.initCodeTableEvent();
			this.initProperty();
			this.initValidator();
			this.initComponent();
			Event.initEventListener(this);

			UITools.UpdateContext.put(this.componentId, this);
		}
	}

	componentWillUpdate(nextProps, nextState){
		super._componentWillUpdate();
		this.initCodeTable(nextProps);
	}

	componentDidUpdate(){
		super._componentDidUpdate();
		if(this.props.io != "out"){
			$("input[name=" + this.componentId +"]").unbind();
			this.initCodeTableEvent();
			this.initProperty();
			this.initValidator();
			this.initComponent();
			Event.initEventListener(this);

			UITools.UpdateContext.put(this.componentId, this);
		}
	}

	/**
	 * Init codetable
	 */
	initCodeTable(props){
		let {codeTable} = (props == undefined) ? this.props : props;
		let parameters = this.props.parameters;

		if (parameters) {
			if (this.isFunction(codeTable)) {
				this.codeTable = codeTable(parameters);
			} else {
				this.codeTable = new CodeTable([]).loadDataListAction(this.props.parameters);
			}
		} else {
			if(this.isString(codeTable)){
				this.codeTable = eval(codeTable);
			} else if(this.isFunction(codeTable)){
				this.codeTable = codeTable();
			} else {
				this.codeTable = codeTable;
			}
		}

		// if(codeTable != undefined){
		// 	if(this.isString(codeTable)){
		// 		this.codeTable = eval(codeTable);
		// 	} else if(this.isFunction(codeTable)){
		// 		this.codeTable = codeTable();
		// 	} else {
		// 		this.codeTable = codeTable;
		// 	}
		// } else if (this.props.parameters){
		// 	this.codeTable = new CodeTable([]).loadDataListAction(this.props.parameters);
		// }
	}

	/**
	 * Get option json
	 */
	getOptionJson(){
		let _self = this, optionJson = null;

		if(this.props.codeTable != undefined || this.props.parameters){
			// get codeTable object
			let codeTable = this.codeTable;

			// get select option json
			if(codeTable != null && codeTable != undefined){
				if(this.props.io != "out" && this.props.parentId){
					optionJson = codeTable.getCodeTableByForeignKey(this.props.foreignKey, this.getParentElement().val());
				} else if(codeTable != undefined) {
					optionJson = codeTable.getCode();
				}
			}
		}

		else if(this.props.dataSource != undefined){
			let foreignKey = _self.props.foreignKey == undefined ? null : _self.props.foreignKey;

			AjaxUtil.doPost(
				this.props.dataSource,
				{foreignKey: foreignKey},
				{
					async: false,
					done: function(data){
						var codeTable = new CodeTable(data);
						if(this.props.io != 'out' && this.props.parentId){
							optionJson = codeTable.getCodeTableByForeignKey(this.props.foreignKey, this.getParentElement().val());
						} else if(codeTable != undefined) {
							optionJson = codeTable.getCode();
						}
						//optionJson = codeTable.getCodeTableByForeignKey(_self.props.foreignKey, _self.getParentElement().val());
					}
				}
			);
		}

		return optionJson;
	}

	/**
	 * Init code table event
	 */
	initCodeTableEvent() {
		let _self = this;

		// handler input propertychange
		$("input[name=" + this.componentId+"]").bind("input propertychange", (event) => {
			_self.setComponentValue(event);
		});

		// handle onchange event
		$("input[name=" + this.componentId+"]").change(function(event){
			_self.setComponentValue(event);

			let inputValue = _self.getEventNewValue(event);
			let valueChangeEvent = new OnChangeEvent(_self, event, Param.getParameter(_self), inputValue, null);
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
		});

		// handle onblur event
		if(this.props.onBlur){
			$("input[name=" + this.componentId+"]").blur(function(event){
				_self.props.onBlur(new OnBlurEvent(_self, event, Param.getParameter(_self)));
			});
		}

		// handle onfocus event
		if(this.props.onFocus){
			$("input[name=" + this.componentId+"]").focus(function(event){
				_self.props.onFocus(new OnFocusEvent(_self, event, Param.getParameter(_self)));
			});
		}
	}

	/**
	 * Get codetable output value
	 */
	getOutputValue(){
		let value = this.getComponentValue();

		return this.codeTable.getValue(value).join(" ");
	}

	/**
	 * Get checked
	 */
	getChecked(key, value){
		if(key == value){
			return "checked";
		}
		return null;
	}

	/**
	 * Get size style class, it's used by CheckboxButton & RadioButton
	 */
	getSizeStyleClass(){
		if(this.props.size != null && this.props.size != undefined){
			return " btn-group-" + this.props.size;
		}
		return "";
	}

	/**
	 * Get active style class, it's used by CheckboxButton & RadioButton
	 */
	getActiveStyleClass(inputValue, value){
		return this.isKeyValueElement(inputValue, value) ? "active" : "";
	}

	/**
	 * Get disabled style class, it's used by CheckboxButton & RadioButton
	 */
	getDisabledStyleClass(){
		return (this.getDisabled() != null) ? "disabled" : "";
	}

	/**
	 * Is key value element
	 */
	isKeyValueElement(inputValue, value){
		if(inputValue != null && this.isArray(inputValue)){
			for(let index in inputValue){
				if(String(inputValue[index]) == value){
					return true;
				}
			}
		} else {
			if(inputValue == value){
				return true;
			}
		}
		return false;
	}

};


/**
 * KeyValue prop types
 */
KeyValue.PropTypes = $.extend({}, Input.propTypes, {
	codeTable: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.string]),
	dataSource: React.PropTypes.string,
    codeTableId: React.PropTypes.string,
	//tableName: React.PropTypes.string,
	//orderBy: React.PropTypes.string,
	//whereClause: React.PropTypes.string,
});

/**
 * Get KeyValue default props
 */
KeyValue.defaultProps = $.extend({}, Input.defaultProps, {

});
