/*
 * BoxMeter Class for nodejs
 * For now the only features are related to text metrics
 * It can calculate the size of the bounding box of a text based on styling
 */

const settings = require("./boxmeter.json");

const BoxMeter = function() {
	// min width of a glyph
	this.minWidth = 1;
	this.minHeight = 1;

	// maps are stored here and can be extended at runtime
	// a map is a key-value pair between a font name ("Times New Roman") and a key in the
	// metrics object, eg: map["Times New Roman"] = "times";
	this.map = settings.map;

	// reference to the metrics object; paths in the metrics object are
	// <font_key>.<font_weight> = <array>
	// - font_key is something to be mapped to, such as "times", "sans", "tahoma"
	// - font_weight is one of the following: straight, italic, bold, bold-italic
	// The array contains metrics for all charcodes (1-127) and an average of all metrics at
	// position zero; the metrics object has the following keys:
	// - wat15: width at 15px
	// - wsb15: width slope below 15px
	// - wsa15: width slope above 15px
	// - hat15: height at 15px
	// - hsb15: height slope below 15px
	// - hsa15: height slope above 15px
	// - en15:  extra-width for narrow display at 15px
	// - ew15:  extra-width for wide display at 15px
	// - enb15: extra-width slope for narrow display below 15px
	// - ewb15: extra-width slope for wide display below 15px
	// - ena15: extra-width slope for narrow display above 15px
	// - ewa15: extra-width slope for wide display above 15px
	// The values are used to calculate the actual width and height for each glyph
	this.metrics = settings.params;

	// font glyph sizes are cached in this object for performance reasons
	// paths are:
	// - for heights: <font_key>.<font_weight>.<font_size>.height = [];
	// - for width: <font_key>.<font_weight>.<font_size>.width.<spacing> = [];
	// where [] is an array containing the value for each charcode (1-127) and the average value on index 0
	// - font_key is something to be mapped to, such as "times", "sans", "tahoma"
	// - font_weight is one of the following: straight, italic, bold, bold-italic
	// - font_size is the font size string like in CSS (12px, etc)
	// - spacing is the spacing string, also like in CSS (-2px, 2px, etc)
	this.cache = {};

	// check mappings before we're good to go
	for (var i in this.map)
		if (this.metrics[this.map[i]] === undefined)
			throw new Error("Unknown mapping " + this.map[i] + " for font " + i);
};

/*
 * Set glyph min width
 */
BoxMeter.prototype.setMinWidth = function(m) {
	this.minWidth = m;
}

/*
 * Set glyph min height
 */
BoxMeter.prototype.setMinHeight = function(m) {
	this.minHeight = m;
}

/*
 * Set mapping for a font name
 */
BoxMeter.prototype.setMapping = function(font, mapping) {
	if (this.metrics[mapping] === undefined)
		throw new Error("Unknown mapping " + mapping);
	this.map[font] = mapping;
};

/*
 * Get mapping for a font name
 */
BoxMeter.prototype.getMapping = function(font) {
	return this.map[font];
};

/*
 * get properties from style definition object
 * makes sure the font is one of the mapped values
 */
BoxMeter.prototype.getStyleProperties = function(styleObject) {
	if (styleObject === undefined)
		styleObject = {}; // make it empty so we get default properties only
	var ret = {
		font: "Times",
		fontSize: "16px",
		bold: false,
		italic: false,
		spacing: "0px"
	};
	if (styleObject["font-family"] !== undefined && this.map[styleObject["font-family"]] !== undefined)
		ret.font = styleObject["font-family"];
	if (styleObject["font-size"] !== undefined)
		ret.fontSize = styleObject["font-size"];
	if (styleObject["font-weight"] === "bold")
		ret.bold = true;
	if (styleObject["font-style"] === "italic")
		ret.italic = true;
	if (styleObject["letter-spacing"] !== undefined)
		ret.spacing = styleObject["letter-spacing"];
	return ret;
};

/*
 * Static: get font weight string
 */
BoxMeter.getWeightString = function(bold, italic) {
	if (bold === true && italic === false)
		return "bold";
	if (bold === false && italic === true)
		return "italic";
	if (bold === true && italic === true)
		return "bold-italic";
	return "straight";
};

/*
 * Get metrics for a font name
 */
BoxMeter.prototype.getMetrics = function(map, weight) {
	if (map === undefined)
		return undefined;
	if (this.metrics[map] === undefined)
		return undefined;
	if (this.metrics[map][weight] === undefined)
		throw new Error("Weight " + weight + " is undefined for font mapping " + map + " (" + font + ")");
	return this.metrics[map][weight];
};

/*
 * Static: calculate glyph bounding box based on metrics and params
 */
BoxMeter.getGlyphBoundingBox = function(metrics, fontSize, spacing) {
	var ret;
	var spa = 0;
	// calculate base width and height and base spacing
	if (spacing < 0)
		spa = metrics.en15;
	if (spacing > 0)
		spa = metrics.ew15;
	if (fontSize === 15) {
		ret = [ metrics.wat15, metrics.hat15 ];
	}
	if (fontSize < 15) {
		ret = [
			metrics.wat15 - metrics.wsb15 * (15 - fontSize),
			metrics.hat15 - metrics.hsb15 * (15 - fontSize)
		];
	}
	if (fontSize > 15) {
		ret = [
			metrics.wat15 + metrics.wsa15 * (fontSize - 15),
			metrics.hat15 + metrics.hsa15 * (fontSize - 15)
		];
	}
	ret[0] += spa * Math.abs(spacing);
	if (ret[0] < this.minWidth)
		ret[0] = this.minWidth;
	if (ret[1] < this.minHeight)
		ret[1] = this.minHeight;
	return ret;
};

/*
 * Check if we have the cache for font and params
 * bold, italic are boolean
 * fontSize and spacing are expressed as "px" values
 * Warning: for optimisation reasons this function assumes correct arguments
 */
BoxMeter.prototype.hasCache = function(map, weight, fontSize, spacing) {
	if (this.cache[map] === undefined)
		return false;
	if (this.cache[map][weight] === undefined)
		return false;
	if (this.cache[map][weight][fontSize] === undefined)
		return false;
	if (this.cache[map][weight][fontSize].width[spacing] === undefined)
		return false;
	return true;
};

/*
 * Generate cached values for font and params
 * Warning: for optimisation reasons this function assumes correct arguments
 */
BoxMeter.prototype.generateCache = function(map, weight, fontSize, spacing) {
	// create the cache object if not already there
	if (this.cache[map] === undefined)
		this.cache[map] = {};
	if (this.cache[map][weight] === undefined)
		this.cache[map][weight] = {};
	if (this.cache[map][weight][fontSize] === undefined)
		this.cache[map][weight][fontSize] = { height: [], width: {} };
	if (this.cache[map][weight][fontSize].width[spacing] === undefined)
		this.cache[map][weight][fontSize].width[spacing] = [];

	var fontSizeFl = parseFloat(fontSize.replace("px", ""));
	var spacingFl = parseFloat(spacing.replace("px", ""));

	// get the metrics and run trough all characters and store the bounding box values
	// in the cache
	var metrics = this.getMetrics(map, weight);
	for (var i=0; i<metrics.length; i++) {
		var box = BoxMeter.getGlyphBoundingBox(metrics[i], fontSizeFl, spacingFl);
		this.cache[map][weight][fontSize].height[i] = box[1];
		this.cache[map][weight][fontSize].width[spacing][i] = box[0];
	}
};

/*
 * Get Glyph Bounding Box from cache (not the static method)
 * Warning: for optimisation reasons this function assumes cache exists and arguments are correct
 */
BoxMeter.prototype.getGlyphBoundingBox = function(map, weight, fontSize, spacing, charcode) {
	return [
		this.cache[map][weight][fontSize].width[spacing][charcode],
		this.cache[map][weight][fontSize].height[charcode]
	];
};

/*
 * Static - sanitize string
 */
BoxMeter.sanitizeString = function(str) {
	// multiple spaces
	str = str.replace(/ +/g, " ");
	// replace entities with the letter a - this should be close enough for now
	str = str.replace(/&[a-zA-Z0-9]+;/g, "a");
	// replace anything that's not ascii with the letter a - also close enough
	str = str.replace(/[^\x01-\x7f]/g, "a");
	// remove all html tags
	str = str.replace(/<[^<>]+>/g, "");
	return str;
};

/*
 * Function to call to calculate bounding box for a specific piece of text and arguments
 */
BoxMeter.prototype.getTextBoundingBox = function(font, bold, italic, fontSize, spacing, text) {
	if (typeof(font) !== "string")
		throw new Error("Bad value for font argument (" + font + ")");
	if (typeof(text) !== "string")
		throw new Error("Bad value for text argument (" + text + ")");
	if (bold !== true && bold !== false)
		throw new Error("Bad value for bold argument (" + bold + ")");
	if (italic !== true && italic !== false)
		throw new Error("Bad value for italic argument (" + italic + ")");
	if (fontSize.match(/^[0-9]+px$/) === null)
		throw new Error("Bad value for fontSize argument (" + fontSize + ")");
	if (spacing.match(/^-?[0-9.]+px$/) === null)
		throw new Error("Bad value for spacing argument (" + spacing + ")");

	// get mapping and weight
	var map = this.getMapping(font);
	var weight = BoxMeter.getWeightString(bold, italic);

	// check that cache exists and generate one if it does not
	if (!this.hasCache(map, weight, fontSize, spacing))
		this.generateCache(map, weight, fontSize, spacing);

	// reduce spaces and sanitize the text
	text = BoxMeter.sanitizeString(text);

	// go trough the string and calculate the width and height
	var width = 0;
	var height = 0;
	for (var i=0; i<text.length; i++) {
		var charCode = text.charCodeAt(i);
		if (charCode > 127)
			charCode = 0; // quick solution for non-ascii stuff
		var box = this.getGlyphBoundingBox(map, weight, fontSize, spacing, charCode);
		width += box[0];
		if (box[1] > height)
			height = box[1];
	}

	return [ width, height ];
};

module.exports = BoxMeter;
