/*
 * Main Document Class
 */

const Geometry = require("./geometry.js");
const TextElement = require("./text_element.js");

const ml = require("./ml.js");

var Document = function() {
	// raw content from HTML parser
	this.rawContent = [];
	// these are the basic text elements in an array
	this.elements = [];
	// these are the text elements organized in lines
	this.lines = [];
	// these are the text elements organized in blocks
	this.blocks = [];
	// these are the text elements organized as a tree
	this.resetTree();
	// this is the document page block
	this.page = new Geometry();
	// metric information about the page
	// distances between elements
	this.disX = {};
	this.disY = {};
	// margins between elements and page
	this.marL = [];
	this.marY = [];
	this.marT = [];
	this.marB = [];
};

/*
 * Clear the document
 */
Document.prototype.clear = function() {
	this.rawContent = [];
	this.elements = [];
	this.lines = [];
	this.blocks = [];
	this.resetTree();
	this.page.setPosition(0, 0);
	this.page.setSize(0, 0);
	this.disX = {};
	this.disY = {};
	this.marL = [];
	this.marY = [];
	this.marT = [];
	this.marB = [];
};

/*
 * Add new content from HTML Parser
 */
Document.prototype.addParsedContent = function(content) {
	this.rawContent = this.rawContent.concat(content);
};

/*
 * Element extraction from tree recursive call
 */
Document.prototype.extractElementsFromTree = function(node, elements) {
	if (node.textBox)
		elements.push(node.textBox);
	if (node.children === undefined)
		return;
	for (let i=0; i<node.children.length; i++)
		this.extractElementsFromTree(node.children[i], elements);
};

/*
 * Extract elements from tree and put them in a nicely ordered array
 */
Document.prototype.buildTextElements = function() {
	// extract elements from tree
	this.elements = [];
	this.extractElementsFromTree(this.tree, this.elements);
	console.log(this.elements);
	// sort elements by position
	this.elements.sort(function (a, b) {
		// consider same line if they are within 10 pixels of each other
		// we are not going to use the functions isBefore/isAfter provided by Geometry
		// because we want do to a simple quick check and make sure we don't encounter
		// issues with overlapping blocks
		if (a.geometry.getBottom() > b.geometry.getBottom() + 10)
			return 1;
		if (a.geometry.getBottom() < b.geometry.getBottom() - 10)
			return -1;
		if (a.geometry.getLeft() > b.geometry.getLeft())
			return 1;
		if (a.geometry.getLeft() < b.geometry.getLeft())
			return -1;
		return 0;
	});
};

/*
 * Reset the document tree
 */
Document.prototype.resetTree = function() {
	this.tree = {
		element: {
			tag: null,
			class: null,
			id: null,
			attributes: {},
			style: null,
			computedStyle: {},
			inheritedStyle: {}
		},
		children: []
	};
};

/*
 * Compute size information for all elements in a tree
 * TODO: This has some severe limitations and should be extended (see below as well)
 */
Document.prototype.computeSizes = function(node) {
	// store sizes in these variables
	let lineWidth = 0;	// width of current row
	let lineHeight = 0;	// height of current row
	let width = 0;		// total element width
	let height = 0;		// total element height
	// for now, by default, consider children coming one under the other
	if (node.children && node.children.length > 0) {
		for (let i=0; i<node.children.length; i++) {
			let r = this.computeSizes(node.children[i]);
			// if display is block, start a new row
			if (node.children[i].element.inheritedStyle.display === "block") {
				// save current line size
				if (lineWidth > width)
					width = lineWidth;
				height += lineHeight;
				// save element size
				if (r.getWidth > width)
					width = r.getWidth();
				height += r.getHeight();
				// reset line (next element goes on next line)
				lineWidth = 0;
				lineHeight = 0;
			}
			else {
				// place elemnent to the right of the previous - increas width
				// and correct height if necessary
				lineWidth += r.getWidth();
				if (r.getHeight > lineHeight)
					lineHeight = r.getHeight();
			}
		}
	}
	else {
		// if we have a textbox, use its size for width and height
		if (node.textBox) {
			width = node.textBox.geometry.getWidth();
			height = node.textBox.geometry.getHeight();
		}
	}
	// if we don't have a geometry object yet, create it
	if (node.geometry === undefined)
		node.geometry = new Geometry(0, 0, 0, 0);
	// if specified explicitly, use it
	if (node.element.inheritedStyle.width && node.element.inheritedStyle.height)
		node.geometry.setSize(parseInt(node.element.inheritedStyle.width), parseInt(node.element.inheritedStyle.height));
	else
		node.geometry.setSize(width, height);
	return node.geometry;
};

/*
 * Compute position information for all elements in a tree
 * referencePosition [ left, top ] is the position of the previous positioned element in the path
 * parentNode is a reference to the parent node in the tree if any
 * previousChild is list of { left, top, right, bottom } positions of the previous child
 * - in case of relative positioning, this should be the position before the child is moved
 * - in case of absolute positioning, this should be the position of the child before, if any
 * TODO: This has some severe limitations and should be extended (see below as well)
 * Stores position directly in node and returns the coordinates where space is reserved in the document
 */
Document.prototype.computePositions = function(node, referencePosition, parentNode, previousChild) {
	let style = node.element.inheritedStyle;
	let left = 0;
	let top = 0;
	if (referencePosition === undefined)
		referencePosition = [ 0, 0 ];

	// by default, place elements starting from top left corner of parent node
	if (parentNode) {
		left = parentNode.geometry.getLeft();
		top = parentNode.geometry.getTop();
	}
	// if there is a previousChild, place the element under it or next to it, depending on display
	if (previousChild) {
		// any of the elements have "block" as display style? the go one under the other, otherwise next to eachother
		if (previousChild.display === "block" || style.display === "block")
			top = previousChild.maxBottom;
		else
			left = previousChild.right;
	}
	if (style.position === "absolute") {
		// absoulte positioning: position element relative to the referencePosition
		left = referencePosition[0];
		top = referencePosition[1];
	}
	// before changing coodinates according to relative or absolute positioning, remember coordinates
	// for absolute positioning, we skip this element and remember the coordinates of the previous child
	// for everything else, this element needs space reserved in the document so we remember the coordinates
	let currentCoordinates;
	if (style.position === "absolute")
		currentCoordinates = previousChild;
	else
		currentCoordinates = {
			display: style.display,
			left: left,
			top: top,
			right: left + node.geometry.getWidth(),
			bottom: top + node.geometry.getHeight(),
			maxBottom: top + node.geometry.getHeight()
		};
	// max bottom - keep a maximum of all children to know where to place block elements underneath
	if (previousChild && previousChild.maxBottom > currentCoordinates.maxBottom)
		currentCoordinates.maxBottom = previousChild.maxBottom;
	// absolute or relative: move the element according to left or right
	if (style.position === "absolute" || style.position === "relative") {
		if (style.left)
			left += parseInt(style.left);
		if (style.top)
			top += parseInt(style.top);
		// get new reference position, since this is a positioned element
		referencePosition = [ left, top ];
	}
	// assign to geometry object
	node.geometry.setPosition(left, top);
	// call again for all children, if any
	if (node.children && node.children.length > 0) {
		let prev = null;
		for (let i=0; i<node.children.length; i++) {
			prev = this.computePositions(node.children[i], referencePosition, node, prev);
		}
	}
	return currentCoordinates;
};

/*
 * Organize all elements in a document tree based on path
 */
Document.prototype.rebuildTree = function() {
	// clear the tree root
	this.resetTree();
	for (let i=0; i<this.rawContent.length; i++) {
		let target = this.tree;
		let path = this.rawContent[i].path;
		for (let j=0; j<path.length; j++) {
			let found = null;
			for (let k=0; k<target.children.length; k++) {
				if (target.children[k].element === path[j]) {
					found = target.children[k];
					break;
				}
			}
			if (found === null) {
				target.children.push({
					element: path[j],
					children: []
				});
				target = target.children[target.children.length-1];
			}
			else
				target = found;
		}
		// last element stores a TextElement and plain text content
		// we only know the sizes for now, so we'll have to run trough the tree again and calculate
		// all element sizes and all positions
		// for now, all elements are at 0, 0
		// TODO: this only works for a very narrow set-up, has to be enhanced and fixed
		// Limitations: it does not work for multiple elements (does not know how to place them next to
		// eah other) and it does not work for margins and padding, text wrapping and so on
		target.content = this.rawContent[i].content;
		target.textBox = new TextElement(this.rawContent[i].content, this.rawContent[i].inheritedStyle);
		target.geometry = target.textBox.geometry; // some items only have the geometry object so we keep a reference here
	}
	this.computeSizes(this.tree);
	this.computePositions(this.tree);
};

/*
 * Compute page boundaries
 */
Document.prototype.computePageBoundaries = function() {
	let minL = 1e10;
	let minT = 1e10;
	let maxR = 0;
	let maxB = 0;
	for (let i=0; i<this.elements.length; i++) {
		if (minL > this.elements[i].geometry.getLeft())
			minL = this.elements[i].geometry.getLeft();
		if (minT > this.elements[i].geometry.getTop())
			minT = this.elements[i].geometry.getTop();
		if (maxR < this.elements[i].geometry.getRight())
			maxR = this.elements[i].geometry.getRight();
		if (maxB < this.elements[i].geometry.getBottom())
			maxB = this.elements[i].geometry.getBottom();
	}
	this.page.setPosition(minL, minT);
	this.page.setOpposite(maxR, maxB);
};

/*
 * Compute Margin Ranges
 */
Document.prototype.computeMarginRanges = function() {
};

/*
 * Compute Distance Ranges
 * Elements should be in natural reading order, sorted by x and y position
 */
Document.prototype.computeDistanceRanges = function() {
};

/*
 * Compute Layout
 */
Document.prototype.computeLayout = function() {
	// the tree is based on HTML hierarchy in the input, so we can process positioning
	// it has to be built first
	this.rebuildTree();
	// text elements are derived from the tree elements
	this.buildTextElements();
	this.computePageBoundaries();
	this.computeMarginRanges();
	this.computeDistanceRanges();
};

module.exports = Document;
