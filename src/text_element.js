/*
 * Text Element Class - stores all information about text (content, position and size, styling etc)
 */

const Geometry = require("./geometry.js");
const BoxMeter = require("./boxmeter.js");

const html = require("util-one").html;

var TextElement = function(str, style, metaStyle) {
	this.content = str === undefined ? "" : str;
	this.style = style === undefined ? {} : style;
	this.metaStyle = metaStyle === undefined ? {} : metaStyle;
	this.recalculateGeometry();
	// box meter reference, this can be overwritten by a deferent meter if desired
};

TextElement.boldTags = [ "b", "strong" ];
TextElement.italicTags = [ "em", "i" ];

/*
 * Get metastyle (bold, italic) from array of html tags
 */
TextElement.prototype.getMetaStyleFromTags = function(tags) {
	let ret = {
		isBold: false,
		isItalic: false
	};
	for (let i=0; i<tags.length; i++) {
		if (TextElement.boldTags.indexOf(tags[i]) !== -1)
			ret.isBold = true;
		if (TextElement.italicTags.indexOf(tags[i]) !== -1)
			ret.isItalic = true;
	}
	return ret;
};

/*
 * Sanitize content and extract metastyle and return new text elements
 * as an array to reflect the splitting
 */
TextElement.prototype.splitByStyling = function(spacingX, spacingY) {
	// we can't be too wrong with 1px and it might save us from some trouble later
	// TODO: check if this needs adjustment
	// TODO: include style information such as margin and padding
	let ret = [];
	if (spacingX === undefined)
		spacingX = 1;
	if (spacingY === undefined)
		spacingY = 1;
	let pieces = html.breakByTag(this.content);
	// remember position of original element
	let left = this.geometry.getLeft();
	let top = this.geometry.getTop();
	// remember position of new elements here
	let offsetX = 0;
	let offsetY = 0;
	for (let i=0; i<pieces.length; i++) {
		let rowHeight = 0;
		for (let j=0; j<pieces[i].length; j++) {
			let metaStyle = this.getMetaStyleFromTags(pieces[i][j].tags);
			metaStyle.left = left + offsetX;
			metaStyle.top = top + offsetY;
			// we can decode entities at this stage since we got all the tags out
			pieces[i][j].content = html.decodeEntities(pieces[i][j].content);
			let element = new TextElement(pieces[i][j].content, this.style, metaStyle);
			element.geometry.setParent(this.geometry.getParent());
			offsetX += element.geometry.getWidth() + spacingX;
			if (element.geometry.getHeight() > rowHeight)
				rowHeight = element.geometry.getHeight();
			ret.push(element);
		}
		offsetX = 0;
		offsetY = rowHeight + spacingY;
	}
	return ret;
};

/*
 * Recalculate geometry for this element
 */
TextElement.prototype.recalculateGeometry = function() {
	let left = 0;
	let top = 0;
	let width = 0;
	let height = 0;
	let boxMeter = BoxMeter.getInstance();
	// in case of absolute positioning, simply get left and top from the style object
	// TODO: handle other cases without absolute positioning
	if (this.style.position === "absolute") {
		left = parseInt(this.style.left);
		top = parseInt(this.style.top);
	}
	// if position defined in metastyle use that instead
	if (this.metaStyle.left !== undefined)
		left = this.metaStyle.left;
	if (this.metaStyle.top !== undefined)
		top = this.metaStyle.top;
	// calculate width and height using the boxmeter
	let s = boxMeter.getStyleProperties(this.style);
	// if defined in metaStyle, apply those as well
	s.bold = s.bold || this.metaStyle.isBold === true;
	s.italic = s.italic || this.metaStyle.isItalic === true;
	let box = boxMeter.getTextBoundingBox(s.font, s.bold, s.italic, s.fontSize, s.spacing, this.content);
	width = box[0];
	height = box[1];
	let lineHeight = parseInt(this.style['line-height']);
	if (lineHeight > height)
		height = lineHeight;
	if (this.geometry === undefined)
		this.geometry = new Geometry(left, top, width, height);
	else {
		this.geometry.setPosition(left, top);
		this.geometry.setSize(width, height);
	}
};

module.exports = TextElement;
