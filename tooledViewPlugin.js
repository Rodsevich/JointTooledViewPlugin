joint.plugins = joint.plugins || {};
joint.plugins.TooledModelInterface = {
    interface: 'Tools',
    portsToolMarkup: '<g class="handleInPorts"><path class="aggregate"/><rect class="remove"/></g><g class="handleOutPorts"><path class="aggregate"/><rect class="remove"/></g>',
    resizeToolMarkup: '<path class="resize"/>',
    moveToolMarkup: '<circle class="area"/><path class="visual"/>',

    moveTool: true,
    resizeTool: true,
    portsTool: {handleInPorts: true,
                handleOutPorts: true,
                addPortFunction: 'addPort',
                removePortFunction: 'removePort'},

    addPortsDefaultMessage: "Introduce the name of the new <%= portType %>Port:",
    addPort: function(portType){
        var portsArray = (portType == "in") ? this.get("inPorts") : this.attributes.outPorts;
        var name = prompt(_.template(this.addPortsDefaultMessage, {portType: portType}), portType + "Port" + (portsArray.length + 1));
        portsArray.push(name);
        this.trigger("change:" + portType + "Ports");
    },
    removePort: function(portType){
        var portsArray = (portType == "in") ? this.attributes.inPorts : this.get("outPorts");
        portsArray.splice(-1, 1);
        this.trigger("change:" + portType + "Ports");
    },

    toolsDefaults: {
        '.portsTool path.aggregate': {'d': "m0,5l5,0l0,-5l5,0l0,5l5,0l0,5-5,0l0,5l-5,0l0,-5l-5,0z", 'stroke-width': 2, stroke:'#000', fill: '#5F5'},
        '.portsTool rect.remove': {width: 15, height: 6, 'stroke-width': 3, stroke:'#000', fill: '#F55', y: 21},
        '.portsTool .handleInPorts': {ref: '.body', 'ref-x':-30, 'ref-y':-40},
        '.portsTool .handleOutPorts': {ref: '.body', 'ref-dx':10, 'ref-y':-40},
        '.resizeTool .resize': {
            'd': 'M 0,10l10,0l0,-10z M -2,13l15,0l0,-14l0,14',
            fill: 'black', stroke: 'black',
            ref: '.body', 'ref-dx':10, 'ref-dy':10 },
        '.moveTool .visual': {
            'd': 'M 0,15l5,-3l0,6l-5,-3l30,0l-5,-3l0,6l5,-3l-15,0l0,15l-3,-5l6,0l-3,5l0,-30l-3,5l6,0l-3,-5l0,15',
            fill: 'black', stroke: 'black',
            ref: '.body', 'ref-x':-40, 'ref-dy':10 
        },
        '.moveTool .area': {
            ref:'.moveTool .visual', 'ref-x': 0, 'ref-y': 0, cx:'15', cy:'15', r:'15', 'fill-opacity':'0', 'stroke-width':'0'
        }
    },
    checkMarkup: function(thisInterface){
        //Get all the properties defined in this interface
        //ending with a 'Tool' expression in their names
        var tools = _.filter(Object.getOwnPropertyNames(thisInterface), function(name){ return /Tool$/.test(name)});
        var errorMsg = _.template(this.get("type") + " element extended " + this.interface + " Interface but didn't deactivated it's <%= property %> property and/or didn't included '<g class=\"<%= property %>\"/>' in it's markup.");
        var requiredMarkup = _.template("<g.+class=['\"]?<%= tool %>['\"]?.*/>");
        
        //Check that the markup of the Object is well defined
        //for the use of each Tool not deactivated
        for(var i = 0; i < tools.length; i++){
            var tool = tools[i];
            if(!_.isUndefined(this.attributes[tool]))
                this[tool] = this[tool] & this.attributes[tool];
            if(this[tool]){
                var neededMarkup = requiredMarkup({tool: tool});
                var regEx = new RegExp(neededMarkup);
                if(false == regEx.test(this.markup)){
                    throw new Error(errorMsg({property: tool}));
                }
            }
        }
    },
    initialize: function(){
//        console.log("initialize del PortsModelInterface", this);
        var thisInterface = Object.getPrototypeOf(this);
        while(!thisInterface.hasOwnProperty("interface") || !(thisInterface.interface == "Tools")){
            thisInterface = thisInterface.constructor.__super__;
        }
        this.checkMarkup(thisInterface);
        var parentWithInitialize = thisInterface.constructor.__super__;
        while(!parentWithInitialize.hasOwnProperty("initialize")){
            parentWithInitialize = parentWithInitialize.constructor.__super__;
        }
        parentWithInitialize.initialize.apply(this, arguments);
        var attrs = _.clone(this.toolsDefaults);
        joint.util.deepMixin(attrs, this.attributes.attrs);
        this.attributes.attrs = attrs;
    }
};
joint.plugins.TooledViewInterface = {
    interface: 'Tools',
    renderMoveTool: function () {
        var moveContainer = this.$('.moveTool').empty();
//        for(var elem of V(this.model.moveToolMarkup))
//            moveContainer.append(elem.node);
//        As ↑this↑ code is not ES5 valid, I remake it ES5-valid in order to have ng-annotate working
        var markup = V(this.model.moveToolMarkup);
        for(var id in markup)
            moveContainer.append(markup[id].node);
    },
    renderPortsTool: function (config) {
        //Add the Nodes
        var $portsContainer = this.$('.portsTool').empty();
        var SVGPortsElements = V(this.model.portsToolMarkup);
        var funcRemove = this.model[config.removePortFunction];
        var funcAggregate = this.model[config.addPortFunction];
        var modelo = this.model;
        if(config.hasOwnProperty('handleInPorts') && config.handleInPorts){
            var inPortsGroup = SVGPortsElements[0];
            $portsContainer.append(inPortsGroup.node);
            this.$('.portsTool .handleInPorts .aggregate').on('click',function(){ funcAggregate.apply(modelo, ["in"])});
            this.$('.portsTool .handleInPorts .remove').on('click', function(){ funcRemove.apply(modelo, ["in"])});
        }
        if(config.hasOwnProperty('handleOutPorts') && config.handleOutPorts){
            var outPortsGroup = SVGPortsElements[1];
            $portsContainer.append(outPortsGroup.node);
            this.$('.portsTool .handleOutPorts .aggregate').on('click', function(){ funcAggregate.apply(modelo, ["out"])});
            this.$('.portsTool .handleOutPorts .remove').on('click', function(){ funcRemove.apply(modelo, ["out"])});
        }
        //Inherited from joint.shapes.basic.PortsViewInterface
        //this.renderPorts(); <al parecer ya no es necesario>
    },
    renderResizeTool: function () {
        var resizeContainer = this.$('.resizeTool').empty();
        resizeContainer.append(V(this.model.resizeToolMarkup).node);
        //resizeContainer.find('path.resize')[0]
        var modelo = this.model;
        var performanceLock = false;
        resizeContainer.children()[0].addEventListener("mousedown", function(e){
            document.resizeInitialValues = {x: e.pageX, y:e.pageY, model: modelo, bbox: $(this).closest(".element").find(".scalable")[0].getBoundingClientRect()};
            document.onmousemove = function(e){
                if(!performanceLock){
                    performanceLock = true;
                    setTimeout(function(){
                        performanceLock = false;
                    }, 77);
                    var model = document.resizeInitialValues.model;
                    var bbox = document.resizeInitialValues.bbox;
                    var difX = e.pageX - document.resizeInitialValues.x;
                    var difY = e.pageY - document.resizeInitialValues.y;
                    model.resize(bbox.width + difX, bbox.height + difY);
                }
            };
            document.onmouseup = function(e){
                document.resizeInitialValues = null;
                document.onmousemove = null;
                document.onmouseup = null;
            };
            e.stopPropagation();
        }, true);
    },
    update: function(){
//        console.log("se ejecuto el update de " + this.model.prop('type'));
        if(this.model.moveTool){
            this.renderMoveTool();
        }
        if(this.model.resizeTool){
            this.renderResizeTool();
        }
        if(this.model.portsTool && (_.isObject(this.model.portsTool) && !_.isEmpty(this.model.portsTool))){
            this.renderPortsTool(this.model.portsTool);
        }
        var thisInterface = Object.getPrototypeOf(this);
        while(!(thisInterface.hasOwnProperty("interface") && (thisInterface.interface == "Tools"))){
            thisInterface = thisInterface.constructor.__super__;
        }
        var parentWithUpdate = thisInterface.constructor.__super__;
        while(!parentWithUpdate.hasOwnProperty("update")){
            parentWithUpdate = parentWithUpdate.constructor.__super__;
        }
        parentWithUpdate.update.apply(this, arguments);
    }
};