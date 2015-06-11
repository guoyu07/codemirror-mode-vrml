// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("vrml", function(conf, parserConf) {
	
	var fields = ["appearance", "children", "proxy", "addChildren", "removeChildren", "collideTime", "geometry", "material", "texture", "textureTransform", "ambientIntensity", "diffuseColor", "emissiveColor", "shininess", "specularColor", "transparency", "size", "bottomRadius", "height", "side", "bottom", "radius", "top", "bboxCenter", "bboxSize", "string", "length", "maxExtent", "fontStyle", "family", "style", "spacing", "justify", "horizontal", "leftToRight", "topToBottom", "language", "translation", "rotation", "scale", "scaleOrientation", "center", "key", "keyValue", "set_fraction", "value_changed", "enabled", "isActive", "isOver", "touchTime", "hitPoint_changed", "hitNormal_changed", "hitTexcoord_changed", "autoOffset", "offset", "maxPosition", "minPosition", "translation_changed", "trackPoint_changed", "rotation_changed", "diskAngle", "maxAngle", "minAngle", "choice", "whichChoice", "axisOfRotation", "point", "coord", "color", "coordIndex", "colorIndex", "colorPerVertex", "set_coordIndex", "set_colorIndex", "texCoord", "texCoordIndex", "normalIndex", "normalPerVertex", "ccw", "convex", "solid", "creaseAngle", "set_texCoordIndex", "set_normalIndex", "xDimension", "xSpacing", "zDimension", "zSpacing", "crossSection", "spine", "beginCap", "endCap", "set_spine", "set_crossSection", "set_scale", "set_orientation", "url", "repeatS", "repeatT", "image", "loop", "speed", "startTime", "stopTime", "duration_changed", "vector", "on", "location", "intensity", "attenuation", "direction", "beamWidth", "cutOffAngle", "skyColor", "skyAngle", "groundColor", "groundAngle", "backUrl", "bottomurl", "fronturl", "leftUrl", "rightUrl", "topUrl", "set_bind", "bind_changed", "visibilityRange", "fogType", "duration", "pitch", "priority", "spatialize", "maxFront", "maxBack", "minFront", "minBack", "level", "range", "fieldOfView", "description", "jump", "isBound", "bindTime", "type", "avatarSize", "headLight", "visibilityLimit", "enterTime", "exitTime", "collide", "parameter", "title", "info", "mustEvaluate", "directOutput", "source"];
	
	var fieldTypes = ["SFBool", "SFColor", "MFColor", "SFFloat", "MFFloat", "SFImage", "SFInt32", "MFInt32", "SFNode", "MFnode", "SFRotation", "MFRotation", "SFString", "MFString", "SFTime", "SFVec2f", "MFVec2f", "SFVec3f", "MFVec3f"];
	
	var nodeTypes = ["Shape", "Appearance", "Material", "Box", "Cone", "Cylinder", "Sphere", "Group", "Text", "FontStyle", "Transform", "TimeSensor", "PositionInterpolator", "OrientationInterpolator", "TouchSensor", "PlaneSensor", "SphereSensor", "CylinderSensor", "ColorInterpolater", "ScalarInterpolator", "Switch", "Transform", "Billboard", "Inline", "Coordinate", "CoordinateInterpolator", "PointSet", "IndexedLineSet", "IndexedFaceSet", "ElevationGrid", "Extrusion", "Color", "PointSet", "ImageTexture", "PixelTexture", "MovieTexture", "TextureCoordinate", "TextureTransform", "Normal", "NormalInterpolator", "PointLight", "DirectionalLight", "SpotLight", "Background", "Fog", "AudioClip", "Sound", "LOD", "Viewpoint", "NavigationInfo", "VisibilitySensor", "ProximitySensor", "Collision", "Anchor", "WorldInfo", "Script"];
	
	var specialWords = ["DEF", "ROUTE", "PROTO", "EXTERNPROTO", "IS", "TO", "USE"];
	
	var atomWords = ['TRUE', 'FALSE', 'field', 'exposedField', 'NULL', "eventIn", "eventOut"];
		
	var ERRORCLASS = 'error';
	
    function wordRegexp(words) {
        return new RegExp("^((" + words.join(")|(") + "))\\b");
    }
	
	var stringPrefixes = '"';
	
    var singleOperators = new RegExp("^[\\+\\-\\*/&\\\\\\^<>=]");
    var doubleOperators = new RegExp("^((<>)|(<=)|(>=))");
    var singleDelimiters = new RegExp('^[\\.,]');
    var brakets = new RegExp('^[\\(\\)]');
    var identifiers = new RegExp("^[A-Za-z][_A-Za-z0-9]*");

    var openingKeywords = ['class','sub','select','while','if','function', 'property', 'with', 'for'];
    var middleKeywords = ['else','elseif','case'];
    var endKeywords = ['next','loop','wend'];

    var wordOperators = wordRegexp(['and', 'or', 'not', 'xor', 'is', 'mod', 'eqv', 'imp']);
    var commonkeywords = ['dim', 'redim', 'then',  'until', 'randomize',
                          'byval','byref','new','property', 'exit', 'in',
                          'const','private', 'public',
                          'get','set','let', 'stop', 'on error resume next', 'on error goto 0', 'option explicit', 'call', 'me'];

    
    //This list was from: http://msdn.microsoft.com/en-us/library/3ca8tfek(v=vs.84).aspx
    var builtinFuncsWords = ['abs', 'array', 'asc', 'atn', 'cbool', 'cbyte', 'ccur', 'cdate', 'cdbl', 'chr', 'cint', 'clng', 'cos', 'csng', 'cstr', 'date', 'dateadd', 'datediff', 'datepart',
                        'dateserial', 'datevalue', 'day', 'escape', 'eval', 'execute', 'exp', 'filter', 'formatcurrency', 'formatdatetime', 'formatnumber', 'formatpercent', 'getlocale', 'getobject',
                        'getref', 'hex', 'hour', 'inputbox', 'instr', 'instrrev', 'int', 'fix', 'isarray', 'isdate', 'isempty', 'isnull', 'isnumeric', 'isobject', 'join', 'lbound', 'lcase', 'left',
                        'len', 'loadpicture', 'log', 'ltrim', 'rtrim', 'trim', 'maths', 'mid', 'minute', 'month', 'monthname', 'msgbox', 'now', 'oct', 'replace', 'rgb', 'right', 'rnd', 'round',
                        'scriptengine', 'scriptenginebuildversion', 'scriptenginemajorversion', 'scriptengineminorversion', 'second', 'setlocale', 'sgn', 'sin', 'space', 'split', 'sqr', 'strcomp',
                        'string', 'strreverse', 'tan', 'time', 'timer', 'timeserial', 'timevalue', 'typename', 'ubound', 'ucase', 'unescape', 'vartype', 'weekday', 'weekdayname', 'year'];

    
    //This list was from: http://msdn.microsoft.com/en-us/library/hkc375ea(v=vs.84).aspx
    var knownProperties = ['description', 'firstindex', 'global', 'helpcontext', 'helpfile', 'ignorecase', 'length', 'number', 'pattern', 'source', 'value', 'count'];
    var knownMethods = ['clear', 'execute', 'raise', 'replace', 'test', 'write', 'writeline', 'close', 'open', 'state', 'eof', 'update', 'addnew', 'end', 'createobject', 'quit'];

    

	var knownWords = fields;//knownMethods.concat(knownProperties)

    var builtinObjsWords = nodeTypes.concat(fieldTypes);

    var keywords = wordRegexp(commonkeywords);
    var atoms = wordRegexp(atomWords);
	specialWords = wordRegexp(specialWords);
    var builtinFuncs = wordRegexp(builtinFuncsWords);
    var builtinObjs = wordRegexp(builtinObjsWords);
    var known = wordRegexp(knownWords);
    var stringPrefixes = '"';

    var opening = wordRegexp(openingKeywords);
    var middle = wordRegexp(middleKeywords);
    var closing = wordRegexp(endKeywords);
    var doubleClosing = wordRegexp(['end']);
    var doOpening = wordRegexp(['do']);
    var noIndentWords = wordRegexp(['on error resume next', 'exit']);
	
    function indent(_stream, state) {
      state.currentIndent++;
    }

    function dedent(_stream, state) {
      state.currentIndent--;
    }
	
    // tokenizers
    function tokenBase(stream, state) {
        if (stream.eatSpace()) {
            return 'space';
            //return null;
        }

        var ch = stream.peek();

        // Handle Comments
        if (ch === "#") {
            stream.skipToEnd();
            return 'comment';
        }


        // Handle Number Literals
        if (stream.match(/^((&H)|(&O))?[0-9\.]/i, false) && !stream.match(/^((&H)|(&O))?[0-9\.]+[a-z_]/i, false)) {
            var floatLiteral = false;
            // Floats
            if (stream.match(/^\d*\.\d+/i)) { floatLiteral = true; }
            else if (stream.match(/^\d+\.\d*/)) { floatLiteral = true; }
            else if (stream.match(/^\.\d+/)) { floatLiteral = true; }

            if (floatLiteral) {
                // Float literals may be "imaginary"
                stream.eat(/J/i);
                return 'number';
            }
            // Integers
            var intLiteral = false;
            // Hex
            if (stream.match(/^&H[0-9a-f]+/i)) { intLiteral = true; }
            // Octal
            else if (stream.match(/^&O[0-7]+/i)) { intLiteral = true; }
            // Decimal
            else if (stream.match(/^[1-9]\d*F?/)) {
                // Decimal literals may be "imaginary"
                stream.eat(/J/i);
                // TODO - Can you have imaginary longs?
                intLiteral = true;
            }
            // Zero by itself with no other piece of number.
            else if (stream.match(/^0(?![\dx])/i)) { intLiteral = true; }
            if (intLiteral) {
                // Integer literals may be "long"
                stream.eat(/L/i);
                return 'number';
            }
        }

        // Handle Strings
        if (stream.match(stringPrefixes)) {
            state.tokenize = tokenStringFactory(stream.current());
            return state.tokenize(stream, state);
        }

        // Handle operators and Delimiters
        if (stream.match(doubleOperators)
            || stream.match(singleOperators)
            || stream.match(wordOperators)) {
            return 'operator';
        }
        if (stream.match(singleDelimiters)) {
            return null;
        }

        if (stream.match(noIndentWords)) {
            state.doInCurrentLine = true;

            return 'keyword';
        }

        if (stream.match(doOpening)) {
            indent(stream,state);
            state.doInCurrentLine = true;

            return 'keyword';
        }
        if (stream.match(opening)) {
            if (! state.doInCurrentLine)
              indent(stream,state);
            else
              state.doInCurrentLine = false;

            return 'keyword';
        }
        if (stream.match(known)) {
            return 'keyword';
        }

        if (stream.match(atoms)) {
            return 'atom';
        }

        if (stream.match(specialWords)) {
            return 'meta';
        }

        if (stream.match(builtinFuncs)) {
            return 'builtin';
        }

        if (stream.match(builtinObjs)){
            return 'variable-2';
        }

        if (stream.match(identifiers)) {
            return 'variable';
        }

        // Handle non-detected items
        stream.next();
        return null;
    }
	
    function tokenStringFactory(delimiter) {
        var singleline = delimiter.length == 0;
        var OUTCLASS = 'string';

        return function(stream, state) {
            while (!stream.eol()) {
                stream.eatWhile(/[^'"]/);
                if (stream.match(delimiter)) {
                    state.tokenize = tokenBase;
                    return OUTCLASS;
                } else {
                    stream.eat(/['"]/);
                }
            }
            if (singleline) {
                if (parserConf.singleLineStringErrors) {
                    return ERRORCLASS;
                } else {
                    state.tokenize = tokenBase;
                }
            }
            return OUTCLASS;
        };
    }
	
    function tokenLexer(stream, state) {
        var style = state.tokenize(stream, state);
        var current = stream.current();

        // Handle '.' connected identifiers
        if (current === '.') {
            style = state.tokenize(stream, state);

            current = stream.current();
            if (style && (style.substr(0, 8) === 'variable' || style==='builtin' || style==='keyword')){//|| knownWords.indexOf(current.substring(1)) > -1) {
                if (style === 'builtin' || style === 'keyword') style='variable';
                if (knownWords.indexOf(current.substr(1)) > -1) style='variable-2';

                return style;
            } else {
                return ERRORCLASS;
            }
        }

        return style;
    }

    var external = {
        //electricChars:"dDpPtTfFeE ",
        startState: function() {
            return {
              tokenize: tokenBase,
              lastToken: null,
              currentIndent: 0,
              nextLineIndent: 0,
              doInCurrentLine: false,
              ignoreKeyword: false


          };
        },

        token: function(stream, state) {
            if (stream.sol()) {
              state.currentIndent += state.nextLineIndent;
              state.nextLineIndent = 0;
              state.doInCurrentLine = 0;
            }
            var style = tokenLexer(stream, state);

            state.lastToken = {style:style, content: stream.current()};

            if (style==='space') style=null;

            return style;
        },

        indent: function(state, textAfter) {
            var trueText = textAfter.replace(/^\s+|\s+$/g, '') ;
            if (trueText.match(closing) || trueText.match(doubleClosing) || trueText.match(middle)) return conf.indentUnit*(state.currentIndent-1);
            if(state.currentIndent < 0) return 0;
            return state.currentIndent * conf.indentUnit;
        }

    };
    return external;
	
});

CodeMirror.defineMIME("x-world/x-vrml", "flr");
CodeMirror.defineMIME("x-world/x-vrml", "vrml");
CodeMirror.defineMIME("x-world/x-vrml", "wrl");
CodeMirror.defineMIME("x-world/x-vrml", "wrz");
CodeMirror.defineMIME("x-world/x-vrml", "xaf");
CodeMirror.defineMIME("x-world/x-vrml", "xof");

});
