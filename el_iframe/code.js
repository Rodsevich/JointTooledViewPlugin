var graph = new joint.dia.Graph;
var paper = new joint.dia.Paper({ el: $('#papel'), width: 550, height: 550, gridSize: 1, model: graph });

//Include the Interface
var style = {
    position: { x: 50, y: 50 },
    size: { width: 90, height: 90 },
    attrs: {
        '.label': { text: 'Model', 'ref-x': .4, 'ref-y': .2 },
        'rect.body': { fill: '#2ECC71' },
        '.inPorts circle': { fill: '#16A085' },
        '.outPorts circle': { fill: '#E74C3C' }
    }
};

joint.shapes.devs.TooledModel = joint.shapes.devs.Model.extend(_.extend({}, joint.plugins.TooledModelInterface, {

    markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><text class="label"/><g class="inPorts"/><g class="outPorts"/><g class="moveTool"/><g class="resizeTool"/><g class="portsTool"/></g>',

    defaults: joint.util.deepSupplement({
        type: 'devs.TooledModel',
    }, joint.shapes.devs.Model.prototype.defaults),
}));

joint.shapes.devs.TooledModelView = joint.shapes.devs.ModelView.extend(joint.plugins.TooledViewInterface);


var m1 = new joint.shapes.devs.Model(joint.util.deepSupplement({
    inPorts: ['in1','in2'],
    outPorts: ['out'],
    attrs: {
        '.label': { text: "\tNormal\nModel"}
    }
}, style));
m1.translate(300, 0);

var m2 = new joint.shapes.devs.TooledModel(joint.util.deepSupplement({
    attrs: {
        '.body': { magnet: true },
        '.label': { fill:'white', text: "Can't you\nmove me?\n(If this text is too large, enlarge the figure to read it well ;-) )"}
    },
    portsTool: false,
    moveTool: false
}, style));

var m3 = new joint.shapes.devs.TooledModel(joint.util.deepSupplement({
    attrs: {
        '.body': { magnet: true },
        '.label': { text: "Try to\nmove me"}
    },
    portsTool: false,
    moveTool: true
}, style));
m3.translate(0, 250);

var m4 = new joint.shapes.devs.TooledModel(joint.util.deepSupplement({
    attrs: {
        '.label': { text: "Change\nmy\nports!!"},
    },
    inPorts: ['in'],
    outPorts: ['out'],
    moveTool: false,
    resizeTool: false
}, style));
m4.translate(300, 250);
graph.addCells([m1,m2,m3,m4]);
//graph.addCell(m2);
