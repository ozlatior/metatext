const JsDom = require("JsDom").JSDOM;

const StyleEngine = require("./style_engine.js");

/* Ignore tags will be skipped when parsing the tree */
const DEFAULT_IGNORE_TAGS = [ "style", "script", "img" ];
/* Content tags will be considered as part of the content and not of the tree */
const DEFAULT_CONTENT_TAGS = [ "a", "b", "del", "em", "i", "strong", "br" ];

var HtmlParser = function() {
	this.styleEngine = new StyleEngine();
	this.reset();
	this.resetIgnoreTags();
	this.resetContentTags();
};

/*
 * Reset the parser - content, styles, except for tag configuration options
 */
HtmlParser.prototype.reset = function() {
	this.data = "";
	this.styleSheets = [];
	this.content = [];
	
	this.styleEngine.reset();
};

/*
 * Reset ignore tags to default list (new array)
 */
HtmlParser.prototype.resetIgnoreTags = function() {
	this.ignoreTags = DEFAULT_IGNORE_TAGS.slice(0);
};

/*
 * Reset content tags to default list (new array)
 */
HtmlParser.prototype.resetContentTags = function() {
	this.contentTags = DEFAULT_CONTENT_TAGS.slice(0);
};

/*
 * Add ignore tag
 */
HtmlParser.prototype.addIgnoreTag = function(tag) {
	this.ignoreTags.push(tag);
};

/*
 * Add content tag
 */
HtmlParser.prototype.addContentTag = function(tag) {
	this.contentTags.push(tag);
};

/*
 * Clear ignore tags - replace with new array
 */
HtmlParser.prototype.clearIgnoreTags = function(tag) {
	this.ignoreTags = [];
};

/*
 * Clear content tags - replace with new array
 */
HtmlParser.prototype.clearContentTags = function(tag) {
	this.contentTags = [];
};

/*
 * Load content into the parser, it will be concatenated to existing content
 */
HtmlParser.prototype.loadData = function(str) {
	this.data += str;
};

/*
 * Extract style tag content and return it as an array of strings
 */
HtmlParser.prototype.extractStyleTags = function(dom) {
	let ret = [];
	let doc = dom.window.document;
	let e = doc.getElementsByTagName("style");
	for (var i=0; i<e.length; i++)
		ret.push(e[i].innerHTML);
	return ret;
};

/*
 * Extract DOM content recursively from tree
 */
HtmlParser.prototype.extractContent = function(domNode, content, path) {
	// we don't have to do anything if the tag is in the list of tags to ignore
	if (path === undefined)
		path = [];
	// get a list of all children tags we shouldn't consider part of content
	let children = [];
	for (let i=0; i<domNode.children.length; i++) {
		if (this.contentTags.indexOf(domNode.children[i].tagName.toLowerCase()) === -1)
			children.push(domNode.children[i]);
	}
	for (let i=0; i<children.length; i++) {
		let tag = children[i].tagName.toLowerCase();
		if (this.ignoreTags.indexOf(tag) !== -1)
			continue;
		// TODO: get all attributes
		let element = {
			tag: tag,
			class: children[i].getAttribute("class"),
			id: children[i].getAttribute("id"),
			attributes: {
				name: children[i].getAttribute("name")
			},
			style: children[i].getAttribute("style")
		};
		// calculate style using styleEngine
		let parentStyle = null;
		if (path.length > 0)
			parentStyle = path[path.length-1].inheritedStyle;
//		let newPath = JSON.parse(JSON.stringify(path));
		let newPath = path.slice(0); // use slice to preserve references
		newPath.push(element);
		element.computedStyle = this.styleEngine.getElementStyle(newPath);
		element.inheritedStyle = this.styleEngine.getInheritedStyle(element.computedStyle, parentStyle);
		let size = this.extractContent(children[i], content, newPath);
	}
	// we didn't find any non-content children, extract the content and put it in the content list
	if (children.length === 0) {
		let toPush = {
			content: domNode.innerHTML,
			path: path,
			inheritedStyle: path[path.length-1].inheritedStyle
		};
		content.push(toPush);
	}
};

/*
 * The main parser function, call this once all data and stylesheets has been loaded
 */
HtmlParser.prototype.parse = function() {
	let dom = new JsDom(this.data, { includeNodeLocations: true });
	let style = this.extractStyleTags(dom);
	style = style.concat(this.styleSheets);
	for (let i=0; i<style.length; i++)
		this.styleEngine.loadString(style[i]);
	let content = [];
	this.extractContent(dom.window.document.getElementsByTagName("body")[0], content);
	this.content = content;
};

HtmlParser.prototype.getStyles = function() {
	return this.styleEngine.getStyles();
};

HtmlParser.prototype.getContent = function() {
	return this.content;
};

module.exports = HtmlParser;
