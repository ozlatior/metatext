/*
 * StyleEngine class - load, parse and calculate styles for html elements
 */

var html = require("util-one").html;
var string = require("util-one").string;

var StyleEngine = function() {
	this.reset();
};

/*
 * Reset the engine - clear all loaded styles
 */
StyleEngine.prototype.reset = function() {
	this.styles = [];
};

/*
 * Get a list of all styles stored in the styles engine
 */
StyleEngine.prototype.getStyles = function() {
	return this.styles;
};

/*
 * Load and parse styles from string
 */
StyleEngine.prototype.loadString = function(str) {
	str = html.removeComments(str, true);
	str = str.replace(/[\t\n]+/g, "").replace(/ +/g, " ");
	let pieces = str.split("}");
	for (let i=0; i<pieces.length; i++) {
		let piece = pieces[i].split("{");
		if (piece.length !== 2)
			continue;
		// we might have multiple keys in one definition so we split by comma
		let keys = piece[0].split(",");
		let def = this.parseStyleDefinition(piece[1]);
		for (let j=0; j<keys.length; j++) {
			let key = keys[j].trim();
			let condition = this.parseMatchingCondition(key);
			let specificity = this.calculateSpecificty(condition);
			this.styles.push({
				key: key,
				condition: condition,
				definition: def,
				specificity: specificity
			});
		}
	}
};

/*
 * Parse attribute condition and return it as object (eg name="element name")
 */
StyleEngine.prototype.parseAttributeCondition = function(str) {
	ret = {
		str: str
	};
	let m = str.match(/[~|^$*]?=/g);
	if (m === null) {
		ret.attribute = str;
		return ret;
	}
	let parts = str.split(m[0]);
	ret.attribute = parts[0];
	ret.value = string.trim(parts[1], [ "\"", "'" ]);
	ret.condition = m[0];
	return ret;
};

/*
 * Parse a single condition in a stylesheet (eg div.myClass)
 * For now only the really common expressions are covered
 */
StyleEngine.prototype.parseSingleCondition = function(str) {
	let ret = {};
	// check if it's a *
	if (str === "*")
		return { matchAll: true };
	// check for attributes
	let r = /\[[^\[\]]+\]/g;
	let m = str.match(r);
	str = str.replace(r, "");
	if (m !== null) {
		ret.attributes = [];
		for (let i=0; i<m.length; i++) {
			ret.attributes.push(this.parseAttributeCondition(m[i].slice(1, -1)));
		}
	}
	let parts;
	// check that it's a "#" id
	parts = str.split("#");
	if (parts.length > 1) {
		if (parts[0].length > 0)
			ret.tag = parts[0];
		ret.id = parts[1];
		return ret;
	}
	// check that it's a "." class
	parts = str.split(".");
	if (parts.length > 1) {
		if (parts[0].length > 0)
			ret.tag = parts[0];
		ret.class = parts.slice(1);
		return ret;
	}
	// otherwise, it's just a boring tag
	ret.tag = str;
	return ret;
};

/*
 * Parse a style matching condition and return an array of elements it should match in order
 */
StyleEngine.prototype.parseMatchingCondition = function(str) {
	let ret = [];
	let pieces = str.split(" ");
	let specifier = null;
	for (let i=0; i<pieces.length; i++) {
		// for now we only look for these; remember we found one
		if (pieces[i] === ">") {
			specifier = ">";
			continue;
		}
		let condition = this.parseSingleCondition(pieces[i]);
		if (condition === undefined)
			continue;
		// we found a specifier in the previous piece, we'll save it in this condition
		if (specifier !== null) {
			condition.specifier = specifier;
			specifier = null;
		}
		ret.push(condition);
	}
	return ret;
};

/*
 * Parse a style definition block and return an object with all properties and values
 */
StyleEngine.prototype.parseStyleDefinition = function(str) {
	let ret = {};
	str = str.trim();
	str = str.split(";");
	for (let i=0; i<str.length; i++) {
		let pieces = str[i].split(":");
		if (pieces.length < 2)
			continue;
		let key = pieces.shift().trim();
		let value = pieces.join(":").trim();
		ret[key] = value;
	}
	return ret;
};

/*
 * Calculate style key specificity based on what it contains
 */
StyleEngine.prototype.calculateSpecificty = function(condition) {
	let ids = 0;
	let cls = 0;
	let tag = 0;
	// count everything that matters
	for (let i=0; i<condition.length; i++) {
		if (condition[i].tag !== undefined)
			tag++;
		if (condition[i].class !== undefined)
			cls += condition[i].class.length;
		if (condition[i].attributes !== undefined)
			cls += condition[i].attributes.length;
		if (condition[i].id !== undefined)
			ids++;
	}
	return [ 0, 0, ids, cls, tag ];
};

/*
 * Compare specificity arrays (same: 0, a < b: -1; a > b: +1)
 */
StyleEngine.prototype.compareSpecificity = function(a, b) {
	if (a.length !== 5 || b.length !== 5)
		return 0;
	for (var i=0; i<a.length; i++) {
		if (a[i] > b[i])
			return 1;
		if (a[i] < b[1])
			return -1;
	}
	return 0;
};

/*
 * Determine if a path element follows a condition
 * TODO: check attributes
 */
StyleEngine.prototype.elementFollowsCondition = function(element, condition) {
	// regardless of what we have, it matches
	if (condition.matchAll === true)
		return true;
	// does the tag match?
	if (condition.tag !== undefined && condition.tag !== element.tag)
		return false;
	// does the id match?
	if (condition.id !== undefined && condition.id !== element.id)
		return false;
	// does the class match?
	if (condition.class !== undefined && condition.class.indexOf(element.class) === -1)
		return false;
	// do attributes match?
	// TODO: check other things than "=", for now this is enough
	if (condition.attributes !== undefined) {
		for (let i=0; i<condition.attributes.length; i++) {
			switch (condition.attributes[i].condition) {
				case "=":
					if (element.attributes[condition.attributes[i].attribute] !== condition.attributes[i].value)
						return false;
				default:
					if (element.attributes[condition.attributes[i].attribute] === undefined)
						return false;
			}
		}
	}
	return true;
};

/*
 * Determine if a path follows a condition array
 */
StyleEngine.prototype.pathFollowsCondition = function(path, condition) {
	// copy and reverse arrays
	path = path.slice(0).reverse();
	condition = condition.slice(0).reverse();
	// flag which tells us the very next element must follow the condition
	// it happens for the first element (div p { ... must match a paragraph) as well as
	// for the ">" specifier (div > p { ... after matching a <p> we must match a <div>)
	let nextMustFollow = true;
	for (let i=0; i<condition.length; i++) {
		let found = false;
		for (let j=0; j<path.length; j++) {
			if (this.elementFollowsCondition(path[j], condition[i]) === true) {
				found = true;
				path = path.slice(j+1);
				if (condition[i].specifier === ">")
					nextMustFollow = true;
				else
					nextMustFollow = false;
				break;
			}
			// if we're here and we didn't find the element, we don't have a match
			if (nextMustFollow === true)
				return false;
		}
		if (found === false)
			return false;
	}
	return true;
};

/*
 * Get elment style based on path and inline styles
 * The path is an array of path element objects containing:
 * - tag: string, the tag name eg div, p etc
 * - class: string, the class attribute, if any
 * - name: string, the name attribute, if any
 * - id: string, the id attribute, if any
 * - style: string, inline style, if any
 * TODO: process !important (not supported currently)
 */
StyleEngine.prototype.getElementStyle = function(path) {
	// object of properties based on the path of the element
	let properties = {};
	// go through all matching style definitions and collect properties based on specificity
	for (let i=0; i<this.styles.length; i++) {
		if (this.pathFollowsCondition(path, this.styles[i].condition)) {
			// push all defined properties together with specificities
			for (let j in this.styles[i].definition) {
				// we already have the property and the new property comes from a less specific definition
				if (properties[j] !== undefined &&
					this.compareSpecificity(this.styles[i].specificity, properties[j].specificity) < 0)
					continue;
				properties[j] = {
					value: this.styles[i].definition[j],
					specificity: this.styles[i].specificity.slice(0)
				};
			}
		}
	}
	// apply inline style if any
	if (typeof(path[path.length-1].style) === "string") {
		let style = this.parseStyleDefinition(path[path.length-1].style);
		for (let i in style) {
			properties[i] = {
				value: style[i],
				specificity: [ 0, 1, 0, 0, 0 ]
			};
		}
	}
	// remove specificity information
	for (let i in properties)
		properties[i] = properties[i].value;
	return properties;
};

module.exports = StyleEngine;
