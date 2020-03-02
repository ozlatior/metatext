/*
 * Geometry class for text abstractions in nodejs
 * Store and manipulate bounding boxes
 */

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
 * Get distance information relative to parent
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

module.exports = Geometry;
