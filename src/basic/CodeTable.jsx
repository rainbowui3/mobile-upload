import config from 'config';

export default class CodeTable {

    /**
     * construct code table
     * @param codeTableArray array of json object, eg: {id:"1", text:"text"}
     * @param renderer optional
     * @param sorter {CodeTableSorter} optional
     */
    constructor(codeTableArray, renderer, sorter, api, param) {
        const _self = this;
        if (codeTableArray != null) {
            this.buildCodeTable(codeTableArray, renderer, sorter);
        } else if (api != null) {
            $.when(UITools.Caller.call(api, param))
                .done(function (data) {
                    _self.buildCodeTable(data, renderer, sorter);
                })
                .fail(function (err) {
                    //MessageHelper.error(err, null, MessageHelper.POSITION_TOP_FULL_WIDTH);
                });
        } else {
            throw new Error("codeTableArray or api is null!");
        }

    }

    buildCodeTable(codes, renderer, sorter) {
        let map = {};
        this.codes = codes;
        this.codes.forEach(function (code) {
            map[code[config.DEFAULT_CODETABLE_KEYVALUE.KEY]] = code;
            if (renderer) {
                code[config.DEFAULT_CODETABLE_KEYVALUE.VALUE] = renderer(code);
            }
        });

        this.map = map;
        if (sorter) {
            sorter.sort(this.codes);
        }
    }

    /**
     * Get codetable code
     */
    getCode() {
        return this.codes;
    }

    /**
     * Get codetable map
     */
    getMap() {
        return this.map;
    }

    /**
     * Get codetable key
     */
    getKey(value) {
        let key = null;
        this.codes.forEach(function (code) {
            if (code[config.DEFAULT_CODETABLE_KEYVALUE.VALUE] == value) {
                key = code[config.DEFAULT_CODETABLE_KEYVALUE.KEY];
                return;
            }
        });
        return key;
    }

    /**
     * Get codetable value
     */
    getValue(keyArray) {
        let _self = this, valueArray = [];
        if (keyArray != null && keyArray != undefined) {
            if (UITools.Util.isArray(keyArray)) {
                $.each(keyArray, (index, element) => {
                    if (_self.map[element]) {
                        valueArray.push(_self.map[element][config.DEFAULT_CODETABLE_KEYVALUE.VALUE]);
                    }
                });
            } else {
                if (this.map[keyArray]) {
                    valueArray.push(this.map[keyArray][config.DEFAULT_CODETABLE_KEYVALUE.VALUE]);
                }
            }
        }

        return valueArray;
    }

    /**
     * Get codetable by foreign key
     */
    getCodeTableByForeignKey(foreignKey, parentValue) {
        let codeList = [];

        if (foreignKey == null) {
            return this.codes;
        }

        if (parentValue != undefined) {
            this.codes.forEach(function (code) {
                if (parentValue == code[foreignKey]) {
                    codeList.push(code);
                }
            });
            return codeList;
        }

        return {};
    }

    loadDataListAction(parameters) {
        let codeTableId = parameters.codeTableId;
        let conditionMap = parameters.conditionMap;
        let isChild = parameters.isChild;
        let componentId = parameters.componentId;
        let dataConditionUrl = parameters.dataConditionUrl;
        let dataListUrl = parameters.dataListUrl;

        let cacheId = "dataListById_" + codeTableId;
        if (isChild) {
            cacheId += isChild;
        }
        if (conditionMap) {
            cacheId += JSON.stringify(conditionMap);
        }

        if (UITools.Cache.get(cacheId) != null) {
            return UITools.Cache.get(cacheId);
        }

        let async = false;
        if (componentId) {
            async = true;
            if (UITools.Cache.get(codeTableId) != null && UITools.Cache.get(codeTableId).length > 0) {
                let componentList = UITools.Cache.get(codeTableId);
                componentList.push(componentId);
                UITools.Cache.put(codeTableId, componentList);
                return new CodeTable([]);
            }
            UITools.Cache.put(codeTableId, [componentId]);
        }

        let codeTableList = [];
        this.loadDataListService(codeTableId, conditionMap, dataConditionUrl, dataListUrl, async).then(
            function (dataList) {
                console.log("dataList", dataList);
                dataList.map(function (data, index) {
                    if (isChild && data.ConditionFields != null && data.ConditionFields.length > 0) {
                        data.ConditionFields.map(function (condition, index) {
                            codeTableList.push({id: data.Id, text: data.Description, Parent: condition.ParentId});
                        });
                    } else {
                        codeTableList.push({id: data.Id, text: data.Description});
                    }
                });
                UITools.Cache.put(cacheId, new CodeTable(codeTableList));
                if (async) {
                    let componentList = UITools.Cache.get(codeTableId);
                    for (let i = 0; i < componentList.length; i++) {
                        UITools.UpdateContext.forceUpdate(componentList[i]);
                        UITools.Cache.remove(codeTableId);
                    }
                }
            },
            function (err) {
                if (err.status != 200) {
                    MessageHelper.error(err.statusText, "CodeTable->DataList Load Error,id: " + codeTableId);
                }
            }
        );
        if (codeTableList == null) {
            codeTableList = [];
        }

        return new CodeTable(codeTableList);
    }

    loadDataListService(codeTableId, conditionMap, dataConditionUrl, dataListUrl, async){
        let url = null;
        if(conditionMap != null){
            let param = conditionMap;
            url = dataConditionUrl + codeTableId;
            return UITools.Caller.call(url, param, {method:'POST', async:async});
        } else {
            url = dataListUrl + codeTableId;
            return UITools.Caller.call(url, undefined, {method:'GET', async:async});
        }
    }
}
