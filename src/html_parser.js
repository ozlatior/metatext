const JsDom = require("JsDom").JSDOM;

const StyleEngine = require("./style_engine.js");

const html = require("util-one").html;

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

HtmlParser.boldTags = [ "b", "strong" ];
HtmlParser.italicTags = [ "em", "i" ];

/*
 * Get metastyle (bold, italic) from array of html tags
 */
HtmlParser.prototype.getStyleFromTags = function(tags, style) {
	for (let i=0; i<tags.length; i++) {
		if (HtmlParser.boldTags.indexOf(tags[i]) !== -1)
			style["font-weight"] = "bold";
		if (HtmlParser.italicTags.indexOf(tags[i]) !== -1)
			style["font-style"] = "italic";
	}
};

/*
 * Sanitize content after everything has been extracted
 */
HtmlParser.prototype.sanitizeContent = function(str) {
	str = html.decodeEntities(str);
	return str;
};

/*
 * Split a content node by styling and return an array of nodes
 * Each content row will be placed inside a div of span elements
 */
HtmlParser.prototype.splitByStyling = function(path, content) {
	let ret = [];
	let pieces = html.breakByTag(content);
	for (let i=0; i<pieces.length; i++) {
		let rowStyle = {
			display: "block",
			margin: "0",
			padding: "0"
		};
		let inheritedRowStyle = this.styleEngine.getInheritedStyle(rowStyle, path[path.length-1].inheritedStyle);
		let rowPath = path.slice(0);
		let rowDiv = { tag: "div", class: null, id: null, attributes: {}, style: null };
		rowDiv.computedStyle = rowStyle;
		rowDiv.inheritedStyle = inheritedRowStyle;
		rowPath.push(rowDiv);
		for (let j=0; j<pieces[i].length; j++) {
			let elementStyle = {
				display: "inline",
				margin: "0",
				padding: "0"
			};
			let inheritedStyle = this.styleEngine.getInheritedStyle(elementStyle, path[path.length-1].inheritedStyle);
			this.getStyleFromTags(pieces[i][j].tags, inheritedStyle);
			let elementPath = rowPath.slice(0);
			let span = { tag: "span", class: null, id: null, attributes: {}, style: null };
			span.computedStyle = elementStyle;
			span.inheritedStyle = inheritedStyle;
			elementPath.push(span);
			// we can sanitize it already
			ret.push({
				content: this.sanitizeContent(pieces[i][j].content),
				path: elementPath,
				inheritedStyle: inheritedStyle
			});
		}
	}
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
		let toPush = this.splitByStyling(path, domNode.innerHTML);
		for (let i=0; i<toPush.length; i++)
			content.push(toPush[i]);
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
