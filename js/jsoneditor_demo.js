var extendObj = function (destination) {
    var source, i, property;
    for (i = 1; i < arguments.length; i++) {
        source = arguments[i];
        for (property in source) {
            if (!source.hasOwnProperty(property)) continue;
            if (source[property] && typeof source[property] === 'object' && source[property] !== null) {
                if (!destination.hasOwnProperty(property)) destination[property] = {};
                extendObj(destination[property], source[property]);
            } else {
                destination[property] = source[property];
            }
        }
    }
    return destination;
}

// Theme to use in ACE editor instances
var aceTheme = 'ace/theme/monokai';

// ACE Editor placeholders
var jeEditSchema = document.querySelector('#schema');
var jeOutput = document.querySelector('#output'); // Form output

// ACE Editor instances
var aceSchemaEditor;
var aceOutputEditor;

// Split panels
var jeSplitCfg = {
    sizes: [75, 25],
    minSize: [200, 200],
    gutterSize: 4
};
var jeSplitPanels = [
    ['#split-panel1'],
    ['#split-panel5']
];


// filter function for objects
Object.filter = function (obj, predicate) {
    var result = {}, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key) && predicate(obj[key])) result[key] = obj[key];
    }
    return result;
}

// Create ACE Editor instance
var createEditor = function (el, options) {
    var replaceCmd = {
        name: 'replace',
        bindKey: {win: 'Ctrl-R', mac: 'Command-Option-F'},
        exec: function (editor) {
            window.ace.config.loadModule('ace/ext/searchbox', function (e) {
                e.Search(editor, true)
            })
        },
        readOnly: true
    }, ed = window.ace.edit(el);

    ed.setOptions({theme: aceTheme});
    ed.session.setOptions(extendObj({}, {
        tabSize: 2,
        useSoftTabs: true
    }, options));
    ed.renderer.setOptions({minLines: 40, maxLines: 40});
    // Change replace shortcut from Ctrl-H to Ctrl-R
    ed.commands.addCommand(replaceCmd);

    return ed;
}

// Setup ACE editor for editing Schema
aceSchemaEditor = createEditor(jeEditSchema, {mode: 'ace/mode/json'});

// Setup ACE editor for editing output values
aceOutputEditor = createEditor(jeOutput, {mode: 'ace/mode/json'});

// Set resizable split panels
window.Split(jeSplitPanels[0], jeSplitCfg);
window.Split(jeSplitPanels[1], jeSplitCfg);

