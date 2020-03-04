/*
 * Geometry class for text abstractions in nodejs
 * Store and manipulate bounding boxes
 */

const utilOne = require("util-one");

/*
 * Constructor takes four numerical arguments, two for position and two for size
 * or two object arguments, one for position and one for size
 */
const Geometry = function(left, top, width, height) {
	// initialize all with zero
	this.left = 0;
	this.top = 0;
	this.bottom = 0;
	this.right = 0;
	this.width = 0;
	this.height = 0;

	// set null parent
	this._parent = null;

	// assume four arguments form
	if (typeof(left) === "number") {
		this.left = left;
		if (typeof(top) === "number")
			this.top = top;
		if (typeof(width) === "number")
			this.width = width;
		if (typeof(height) === "number")
			this.height = height;
	}

	// check that arguments are objects, in that case assume object form
	if (typeof(left) === "object" && !(left instanceof Geometry )) { // in this case it's actually "position"
		this.left = left.left;
		this.top = left.top;
		if (typeof(top) === "object") { // in this case it's actually "size"
			this.width = top.width;
			this.height = top.height;
		}
	}

	// check if we have a copy constructor
	if (left instanceof Geometry) {
		this.left = left.left;
		this.top = left.top;
		this.width = left.width;
		this.height = left.height;
	}

	// calculate right and bottom positions
	this.right = this.left + this.width;
	this.bottom = this.top + this.height;
};

/* Static values that can be changed at runtime */
Geometry.DEFAULT_ALIGNMENT_TOLERANCE = 1;

/* Flags for relative positions, flag always refers to the first element in relation to the second */
/* Positions:
 *
 *  before   after  crosses(l/t)   crosses(r/b)   included   includes   overlaps
 *   A  B    A  B       A  B           A  B         A  B       A  B       A  B
 *   +          +       +                 +            +       +
 *   |          |       |                 |            |       |          +  +
 *   +          +       |  +              |         +  |       |  +       |  |
 *                      +  |           +  +         |  |       |  |       |  |
 *      +    +             |           |            +  |       |  +       |  |
 *      |    |             |           |               |       |          +  +
 *      +    +             +           +               +       +
 *
 * If opposite sides have the same coordinates, it's considered crossing
 * If objects are inside each other and either of the same sides have the same coordinates, it's considered inclusion
 * If both coordinates on one axis are the same, it's overlapping
 */
Geometry.rel = {
	NONE:			0,
	BEFORE_X:		1 << 0,
	BEFORE_Y:		1 << 1,
	AFTER_X:		1 << 2,
	AFTER_Y:		1 << 3,
	CROSSES_L:		1 << 4,
	CROSSES_T:		1 << 5,
	CROSSES_R:		1 << 6,
	CROSSES_B:		1 << 7,
	INCLUDED_X:		1 << 8,
	INCLUDED_Y:		1 << 9,
	INCLUDES_X:		1 << 10,
	INCLUDES_Y:		1 << 11,
	OVERLAPS_X:		1 << 12,
	OVERLAPS_Y:		1 << 13
};

/* Flags for alignment (same as for positions, the first element in relation to the second)
 * Situations:
 *
 *     left_out       left       center       right       right_out
 * A -----+           +----       +---+       -----+           +------
 * B      +------     +----    +---------+    -----+     ------+
 *
 *      top_out        top       middle       bottom      bottom_out
 *        A  B         A  B       A  B         A  B          A  B
 *        |                       +                             |
 *        |            +  +       |  +         |  |             |
 *        +  +         |  |       |  |         |  |          +  +
 *           |         |  |       |  +         +  +          |
 *           |                    +                          |
 */
Geometry.align = {
	NONE:			0,
	LEFT_OUT:		1 << 14,
	LEFT:			1 << 15,
	CENTER:			1 << 16,
	RIGHT:			1 << 17,
	RIGHT_OUT:		1 << 18,
	TOP_OUT:		1 << 19,
	TOP:			1 << 20,
	MIDDLE:			1 << 21,
	BOTTOM:			1 << 22,
	BOTTOM_OUT:		1 << 23
};

/*
 * Set parent for this object
 */
Geometry.prototype.setParent = function(_parent) {
	if (_parent instanceof Geometry) {
		this._parent = _parent;
		return true;
	}
	return false;
};

/*
 * Get parent for this object
 */
Geometry.prototype.getParent = function(_parent) {
	return this._parent;
};

/*
 * Unset parent (set to null)
 */
Geometry.prototype.unsetParent = function() {
	this._parent = null;
};

/*
 * Setter for position (top/left)
 */
Geometry.prototype.setPosition = function(left, top) {
	// assume four arguments form
	if (typeof(left) === "number") {
		this.left = left;
		if (typeof(top) === "number")
			this.top = top;
	}

	// check that arguments are objects, in that case assume object form
	if (typeof(left) === "object") { // in this case it's actually "position"
		this.left = left.left;
		this.top = left.top;
	}

	// calculate right and bottom positions
	this.right = this.left + this.width;
	this.bottom = this.top + this.height;
};

/*
 * Setter for size (width/height)
 */
Geometry.prototype.setSize = function(width, height) {
	// assume four arguments form
	if (typeof(width) === "number") {
		this.width = width;
		if (typeof(height) === "number")
			this.height = height;
	}

	// check that arguments are objects, in that case assume object form
	if (typeof(width) === "object") { // in this case it's actually "size"
		this.width = width.width;
		this.height = width.height;
	}

	// calculate right and bottom positions
	this.right = this.left + this.width;
	this.bottom = this.top + this.height;
};

/*
 * Setter for opposing corner (right, bottom)
 */
Geometry.prototype.setOpposite = function(right, bottom) {
	// assume four arguments form
	if (typeof(right) === "number") {
		this.right = right;
		if (typeof(bottom) === "number")
			this.bottom = bottom;
	}

	// check that arguments are objects, in that case assume object form
	if (typeof(right) === "object") { // in this case it's actually "position"
		this.right = right.right;
		this.bottom = right.bottom;
	}

	// calculate width and height
	this.width = this.right - this.left;
	this.height = this.bottom - this.top;
};

/*
 * Getters for basic properties
 */
Geometry.prototype.getLeft = function() {
	return this.left;
};

Geometry.prototype.getTop = function() {
	return this.top;
};

Geometry.prototype.getRight = function() {
	return this.right;
};

Geometry.prototype.getBottom = function() {
	return this.bottom;
};

Geometry.prototype.getWidth = function() {
	return this.width;
};

Geometry.prototype.getHeight = function() {
	return this.height;
};

/*
 * Get position information relative to parent
 */
Geometry.prototype.getLeftRelative = function() {
	if (this._parent === null)
		return this.left;
	return this.left - this._parent.left;
};

Geometry.prototype.getTopRelative = function() {
	if (this._parent === null)
		return this.top;
	return this.top - this._parent.top;
};

Geometry.prototype.getRightRelative = function() {
	if (this._parent === null)
		return this.right;
	return this.right - this._parent.left;
};

Geometry.prototype.getBottomRelative = function() {
	if (this._parent === null)
		return this.bottom;
	return this.bottom - this._parent.top;
};

Geometry.prototype.getRelative = function() {
	if (this._parent === null)
		return {
			left: this.left,
			top: this.top,
			right: this.right,
			bottom: this.bottom
		};
	return {
		left: this.left - this._parent.left,
		top: this.top - this._parent.top,
		right: this.right - this._parent.left,
		bottom: this.bottom - this._parent.top
	};
};

/*
 * Get "margin" (distance) information relative to parent
 */
Geometry.prototype.getLeftDistance = function() {
	if (this._parent === null)
		return undefined;
	return this.left - this._parent.left;
};

Geometry.prototype.getTopDistance = function() {
	if (this._parent === null)
		return undefined;
	return this.top - this._parent.top;
};

Geometry.prototype.getRightDistance = function() {
	if (this._parent === null)
		return undefined;
	return this._parent.right - this.right;
};

Geometry.prototype.getBottomDistance = function() {
	if (this._parent === null)
		return undefined;
	return this._parent.bottom - this.bottom;
};

Geometry.prototype.getDistance = function() {
	if (this._parent === null)
		return undefined;
	return {
		left: this.left - this._parent.left,
		top: this.top - this._parent.top,
		right: this._parent.right - this.right,
		bottom: this._parent.bottom - this.bottom
	};
};

/*
 * Fix orientation - in case the box is fliped up/down or left/right and we have negative sizes
 */
Geometry.prototype.fixOrientation = function() {
	if (this.left > this.right) {
		let t = this.right;
		this.right = this.left;
		this.left = t;
	}
	if (this.top > this.bottom) {
		let t = this.top;
		this.top = this.bottom;
		this.bottom = t;
	}
	this.width = this.right - this.left;
	this.height = this.bottom - this.top;
};

/*
 * Statically add two boxes - calculate the minimum box that includes both of them and return it as a new box
 */
Geometry.add = function(g1, g2) {
	if (!(g1 instanceof Geometry) || !(g2 instanceof Geometry))
		return null;
	// get the farthest corners
	let left = utilOne.array.min([ g1.left, g1.right, g2.left, g2.right ]);
	let right = utilOne.array.max([ g1.left, g1.right, g2.left, g2.right ]);
	let top = utilOne.array.min([ g1.top, g1.bottom, g2.top, g2.bottom ]);
	let bottom = utilOne.array.max([ g1.top, g1.bottom, g2.top, g2.bottom ]);
	// use them to create a new object
	return new Geometry(left, top, right - left, bottom - top);
};

/*
 * Add a box to current box and preserve orientation
 */
Geometry.prototype.add = function(g) {
	if (!(g instanceof Geometry))
		return false;
	// get the farthest corners
	let left = utilOne.array.min([ this.left, this.right, g.left, g.right ]);
	let right = utilOne.array.max([ this.left, this.right, g.left, g.right ]);
	let top = utilOne.array.min([ this.top, this.bottom, g.top, g.bottom ]);
	let bottom = utilOne.array.max([ this.top, this.bottom, g.top, g.bottom ]);
	// get new width and height
	let width = right - left;
	let height = bottom - top;
	// check if reversed, if so reflect this in the new values
	if (this.width < 0) {
		width = -width;
		let t = right;
		right = left; // box actually starts from "right" and goes to the left
		left = t;
	}
	if (this.height < 0) {
		height = -height;
		let t = top;
		top = bottom; // box actually starts from "bottom" and goes up
		bottom = t;
	}
	// update values in object
	this.left = left;
	this.top = top;
	this.right = right;
	this.bottom = bottom;
	this.width = width;
	this.height = height;
	return true;
};

/*
 * Determine relative position to another geometry object (box)
 * Verbs refer to this box in relationship to the argument box
 */
Geometry.prototype.isBeforeX = function(g) {
	let ref = g.left;
	if (g.right < ref)
		ref = g.right;
	if (this.left < ref && this.right < ref)
		return true;
	return false;
};

Geometry.prototype.isBeforeY = function(g) {
	let ref = g.top;
	if (g.bottom < ref)
		ref = g.bottom;
	if (this.top < ref && this.bottom < ref)
		return true;
	return false;
};

Geometry.prototype.isAfterX = function(g) {
	let ref = g.right;
	if (g.left > ref)
		ref = g.left;
	if (this.left > ref && this.right > ref)
		return true;
	return false;
};
Geometry.prototype.isAfterY = function(g) {
	let ref = g.bottom;
	if (g.top > ref)
		ref = g.top;
	if (this.top > ref && this.bottom > ref)
		return true;
	return false;
};

Geometry.prototype.isCrossingLeft = function(g) {
	let target = [ this.left, this.right ];
	let ref = [ g.left, g.right ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (target[0] < ref[0] && target[1] >= ref[0] && target[1] < ref[1])
		return true;
	return false;
};

Geometry.prototype.isCrossingTop = function(g) {
	let target = [ this.left, this.right ];
	let ref = [ g.left, g.right ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (target[0] < ref[0] && target[1] >= ref[0] && target[1] < ref[1])
		return true;
	return false;
};

Geometry.prototype.isCrossingRight = function(g) {
	let target = [ this.left, this.right ];
	let ref = [ g.left, g.right ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (target[0] <= ref[1] && target[0] > ref[0] && target[1] > ref[1])
		return true;
	return false;
};

Geometry.prototype.isCrossingBottom = function(g) {
	let target = [ this.top, this.bottom ];
	let ref = [ g.top, g.bottom ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (target[0] <= ref[1] && target[0] > ref[0] && target[1] > ref[1])
		return true;
	return false;
};

Geometry.prototype.isIncludedX = function(g) {
	let target = [ this.left, this.right ];
	let ref = [ g.left, g.right ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (target[0] <= ref[0] && target[1] >= ref[1])
		return true;
	return false;
};

Geometry.prototype.isIncludedY = function(g) {
	let target = [ this.top, this.bottom ];
	let ref = [ g.top, g.bottom ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (target[0] <= ref[0] && target[1] >= ref[1])
		return true;
	return false;
};

Geometry.prototype.isIncluded = function(g) {
	return this.isIncludedX(g) && this.isIncludedY(g);
};

Geometry.prototype.isIncludingX = function(g) {
	let target = [ this.left, this.right ];
	let ref = [ g.left, g.right ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (target[0] >= ref[0] && target[1] <= ref[1])
		return true;
	return false;
};

Geometry.prototype.isIncludingY = function(g) {
	let target = [ this.top, this.bottom ];
	let ref = [ g.top, g.bottom ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (target[0] >= ref[0] && target[1] <= ref[1])
		return true;
	return false;
};

Geometry.prototype.isIncluding = function(g) {
	return this.isIncludingX(g) && this.isIncludingY(g);
};

Geometry.prototype.isOverlappingX = function(g) {
	let target = [ this.left, this.right ];
	let ref = [ g.left, g.right ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (target[0] === ref[0] && target[1] === ref[1])
		return true;
	return false;
};

Geometry.prototype.isOverlappingY = function(g) {
	let target = [ this.top, this.bottom ];
	let ref = [ g.top, g.bottom ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (target[0] === ref[0] && target[1] === ref[1])
		return true;
	return false;
};

Geometry.prototype.isOverlapping = function(g) {
	return this.isOverlappingX(g) && this.isOverlappingY(g);
};

/*
 * Get a set of flags for relative positioning to another box
 * Flags refer to this box in relationship to the argument box
 */
Geometry.prototype.getRelativePosition = function(g) {
	let ret = Geometry.rel.NONE;

	if (this.isBeforeX(g) === true)
		ret |= Geometry.rel.BEFORE_X;
	if (this.isBeforeY(g) === true)
		ret |= Geometry.rel.BEFORE_Y;
	if (this.isAfterX(g) === true)
		ret |= Geometry.rel.AFTER_X;
	if (this.isAfterY(g) === true)
		ret |= Geometry.rel.AFTER_Y;
	if (this.isCrossingLeft(g) === true)
		ret |= Geometry.rel.CROSSES_L;
	if (this.isCrossingTop(g) === true)
		ret |= Geometry.rel.CROSSES_T;
	if (this.isCrossingRight(g) === true)
		ret |= Geometry.rel.CROSSES_R;
	if (this.isCrossingBottom(g) === true)
		ret |= Geometry.rel.CROSSES_B;
	if (this.isIncludedX(g) === true)
		ret |= Geometry.rel.INCLUDED_X;
	if (this.isIncludedY(g) === true)
		ret |= Geometry.rel.INCLUDED_Y;
	if (this.isIncludingX(g) === true)
		ret |= Geometry.rel.INCLUDES_X;
	if (this.isIncludingY(g) === true)
		ret |= Geometry.rel.INCLUDES_Y;
	if (this.isOverlappingX(g) === true)
		ret |= Geometry.rel.OVERLAPS_X;
	if (this.isOverlappingY(g) === true)
		ret |= Geometry.rel.OVERLAPS_Y;

	return ret;
};

/*
 * Determine relative alignment to another geometry object (box)
 * Verbs refer to this box in relationship to the argument box
 */
Geometry.prototype.isAlignedLeftOut = function(g, tolerance) {
	if (tolerance === undefined)
		tolerance = Geometry.DEFAULT_ALIGNMENT_TOLERANCE;
	let target = [ this.left, this.right ];
	let ref = [ g.left, g.right ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (ref[1] >= target[0] - tolerance && ref[1] <= target[0] + tolerance)
		return true;
	return false;
};

Geometry.prototype.isAlignedLeft = function(g, tolerance) {
	if (tolerance === undefined)
		tolerance = Geometry.DEFAULT_ALIGNMENT_TOLERANCE;
	let target = [ this.left, this.right ];
	let ref = [ g.left, g.right ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (ref[0] >= target[0] - tolerance && ref[0] <= target[0] + tolerance)
		return true;
	return false;
};

Geometry.prototype.isAlignedCenter = function(g, tolerance) {
	if (tolerance === undefined)
		tolerance = Geometry.DEFAULT_ALIGNMENT_TOLERANCE;
	let target = this.left + this.right;
	let ref = g.left + g.right;
	if (ref >= target - tolerance && ref <= target + tolerance)
		return true;
	return false;
};

Geometry.prototype.isAlignedRight = function(g, tolerance) {
	if (tolerance === undefined)
		tolerance = Geometry.DEFAULT_ALIGNMENT_TOLERANCE;
	let target = [ this.left, this.right ];
	let ref = [ g.left, g.right ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (ref[1] >= target[1] - tolerance && ref[1] <= target[1] + tolerance)
		return true;
	return false;
};

Geometry.prototype.isAlignedRightOut = function(g, tolerance) {
	if (tolerance === undefined)
		tolerance = Geometry.DEFAULT_ALIGNMENT_TOLERANCE;
	let target = [ this.left, this.right ];
	let ref = [ g.left, g.right ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (ref[0] >= target[1] - tolerance && ref[0] <= target[1] + tolerance)
		return true;
	return false;
};

Geometry.prototype.isAlignedTopOut = function(g, tolerance) {
	if (tolerance === undefined)
		tolerance = Geometry.DEFAULT_ALIGNMENT_TOLERANCE;
	let target = [ this.top, this.bottom ];
	let ref = [ g.top, g.bottom ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (ref[1] >= target[0] - tolerance && ref[1] <= target[0] + tolerance)
		return true;
	return false;
};

Geometry.prototype.isAlignedTop = function(g, tolerance) {
	if (tolerance === undefined)
		tolerance = Geometry.DEFAULT_ALIGNMENT_TOLERANCE;
	let target = [ this.top, this.bottom ];
	let ref = [ g.top, g.bottom ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (ref[0] >= target[0] - tolerance && ref[0] <= target[0] + tolerance)
		return true;
	return false;
};

Geometry.prototype.isAlignedMiddle = function(g, tolerance) {
	if (tolerance === undefined)
		tolerance = Geometry.DEFAULT_ALIGNMENT_TOLERANCE;
	let target = this.top + this.bottom;
	let ref = g.top + g.bottom;
	if (ref >= target - tolerance && ref <= target + tolerance)
		return true;
	return false;
};

Geometry.prototype.isAlignedBottom = function(g, tolerance) {
	if (tolerance === undefined)
		tolerance = Geometry.DEFAULT_ALIGNMENT_TOLERANCE;
	let target = [ this.top, this.bottom ];
	let ref = [ g.top, g.bottom ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (ref[1] >= target[1] - tolerance && ref[1] <= target[1] + tolerance)
		return true;
	return false;
};

Geometry.prototype.isAlignedBottomOut = function(g, tolerance) {
	if (tolerance === undefined)
		tolerance = Geometry.DEFAULT_ALIGNMENT_TOLERANCE;
	let target = [ this.top, this.bottom ];
	let ref = [ g.top, g.bottom ];
	target.sort((a, b) => { return a - b; });
	ref.sort((a, b) => { return a - b; });
	if (ref[0] >= target[1] - tolerance && ref[0] <= target[1] + tolerance)
		return true;
	return false;
};

/*
 * Get a set of flags for relative alignment to another object (box)
 * Flags refer to this box in relationship to the argument box
 */
Geometry.prototype.getRelativeAlignment = function(g, tolerance) {
	let ret = Geometry.align.NONE;

	if (this.isAlignedLeftOut(g) === true)
		ret |= Geometry.align.LEFT_OUT;
	if (this.isAlignedLeft(g) === true)
		ret |= Geometry.align.LEFT;
	if (this.isAlignedCenter(g) === true)
		ret |= Geometry.align.CENTER;
	if (this.isAlignedRight(g) === true)
		ret |= Geometry.align.RIGHT;
	if (this.isAlignedRightOut(g) === true)
		ret |= Geometry.align.RIGHT_OUT;
	if (this.isAlignedTopOut(g) === true)
		ret |= Geometry.align.TOP_OUT;
	if (this.isAlignedTop(g) === true)
		ret |= Geometry.align.TOP;
	if (this.isAlignedMiddle(g) === true)
		ret |= Geometry.align.MIDDLE;
	if (this.isAlignedBottom(g) === true)
		ret |= Geometry.align.BOTTOM;
	if (this.isAlignedBottomOut(g) === true)
		ret |= Geometry.align.BOTTOM_OUT;

	return ret;
};

/*
 * Get all relative flags (position and alignment)
 */
Geometry.prototype.getRelativeFlags = function(g, tolerance) {
	return this.getRelativePosition(g) | this.getRelativeAlignment(g, tolerance);
};

module.exports = Geometry;
