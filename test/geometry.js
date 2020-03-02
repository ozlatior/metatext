const assert = require("assert");

const Geometry = require("../src/geometry.js");

describe("Geometry Class", () => {

	describe("Constructor and getters", () => {

		describe("Nominal use", () => {

			it("Creates default object (0,0,0,0) if called without arguments", () => {
				var geometry = new Geometry();
				assert.equal(geometry.getLeft(), 0);
				assert.equal(geometry.getTop(), 0);
				assert.equal(geometry.getRight(), 0);
				assert.equal(geometry.getBottom(), 0);
				assert.equal(geometry.getWidth(), 0);
				assert.equal(geometry.getHeight(), 0);
			});

			it("Creates zero-sized object if called only with position arguments", () => {
				var geometry = new Geometry(50, 100);
				assert.equal(geometry.getLeft(), 50);
				assert.equal(geometry.getTop(), 100);
				assert.equal(geometry.getRight(), 50);
				assert.equal(geometry.getBottom(), 100);
				assert.equal(geometry.getWidth(), 0);
				assert.equal(geometry.getHeight(), 0);
			});

			it("Creates zero-sized object if called only with position object", () => {
				var geometry = new Geometry({ left: 50, top: 100 });
				assert.equal(geometry.getLeft(), 50);
				assert.equal(geometry.getTop(), 100);
				assert.equal(geometry.getRight(), 50);
				assert.equal(geometry.getBottom(), 100);
				assert.equal(geometry.getWidth(), 0);
				assert.equal(geometry.getHeight(), 0);
			});

			it("Creates object if called with number arguments", () => {
				var geometry = new Geometry(50, 100, 200, 50);
				assert.equal(geometry.getLeft(), 50);
				assert.equal(geometry.getTop(), 100);
				assert.equal(geometry.getRight(), 250);
				assert.equal(geometry.getBottom(), 150);
				assert.equal(geometry.getWidth(), 200);
				assert.equal(geometry.getHeight(), 50);
			});

			it("Creates object if called with object arguments", () => {
				var geometry = new Geometry({ left: 50, top: 100 }, { width: 200, height: 50});
				assert.equal(geometry.getLeft(), 50);
				assert.equal(geometry.getTop(), 100);
				assert.equal(geometry.getRight(), 250);
				assert.equal(geometry.getBottom(), 150);
				assert.equal(geometry.getWidth(), 200);
				assert.equal(geometry.getHeight(), 50);
			});

			it("Creates object if called with Geometry argument (copy constructor)", () => {
				var geometryTemplate = new Geometry({ left: 50, top: 100 }, { width: 200, height: 50});
				var geometry = new Geometry(geometryTemplate);
				assert.notEqual(geometry, geometryTemplate);
				assert.equal(geometry.getLeft(), 50);
				assert.equal(geometry.getTop(), 100);
				assert.equal(geometry.getRight(), 250);
				assert.equal(geometry.getBottom(), 150);
				assert.equal(geometry.getWidth(), 200);
				assert.equal(geometry.getHeight(), 50);
			});

		});

		describe("Bad arguments", () => {

			it("Creates default object (0,0,0,0) if called with bad argument type", () => {
				var geometry = new Geometry("100", 200, 150, 50);
				assert.equal(geometry.getLeft(), 0);
				assert.equal(geometry.getTop(), 0);
				assert.equal(geometry.getRight(), 0);
				assert.equal(geometry.getBottom(), 0);
				assert.equal(geometry.getWidth(), 0);
				assert.equal(geometry.getHeight(), 0);
			});

			it("Creates zero-sized object if called only with position arguments and bad size argument types", () => {
				var geometry = new Geometry(50, 100, [ 100, 50 ]);
				assert.equal(geometry.getLeft(), 50);
				assert.equal(geometry.getTop(), 100);
				assert.equal(geometry.getRight(), 50);
				assert.equal(geometry.getBottom(), 100);
				assert.equal(geometry.getWidth(), 0);
				assert.equal(geometry.getHeight(), 0);
			});

			it("Creates zero-sized object if called only with position object and bad size argument type", () => {
				var geometry = new Geometry({ left: 50, top: 100 }, "100", "50");
				assert.equal(geometry.getLeft(), 50);
				assert.equal(geometry.getTop(), 100);
				assert.equal(geometry.getRight(), 50);
				assert.equal(geometry.getBottom(), 100);
				assert.equal(geometry.getWidth(), 0);
				assert.equal(geometry.getHeight(), 0);
			});

		});

	});

	describe(".setPosition() (left-top corner) - sets position and recalculates opposite corner", () => {

		describe("Nominal use", () => {

			it("Sets new position if called with number arguments", () => {
				var geometry = new Geometry(50, 100, 200, 150);
				geometry.setPosition(400, 500);
				assert.equal(geometry.getLeft(), 400);
				assert.equal(geometry.getTop(), 500);
				assert.equal(geometry.getRight(), 600);
				assert.equal(geometry.getBottom(), 650);
				assert.equal(geometry.getWidth(), 200);
				assert.equal(geometry.getHeight(), 150);
			});

			it("Sets new position if called with object argument", () => {
				var geometry = new Geometry(50, 100, 200, 150);
				geometry.setPosition({ left: 400, top: 500 });
				assert.equal(geometry.getLeft(), 400);
				assert.equal(geometry.getTop(), 500);
				assert.equal(geometry.getRight(), 600);
				assert.equal(geometry.getBottom(), 650);
				assert.equal(geometry.getWidth(), 200);
				assert.equal(geometry.getHeight(), 150);
			});

			it("Sets new position to argument position if called with Geometry argument", () => {
				var geometry = new Geometry(50, 100, 200, 150);
				var moveTo = new Geometry(400, 500, 300, 200);
				geometry.setPosition(moveTo);
				assert.equal(geometry.getLeft(), 400);
				assert.equal(geometry.getTop(), 500);
				assert.equal(geometry.getRight(), 600);
				assert.equal(geometry.getBottom(), 650);
				assert.equal(geometry.getWidth(), 200);
				assert.equal(geometry.getHeight(), 150);
			});

		});

		describe("Bad arguments", () => {

			it("Leaves object unchanged if called with bad argument type", () => {
				var geometry = new Geometry(50, 100, 200, 50);
				geometry.setPosition("500", 600);
				assert.equal(geometry.getLeft(), 50);
				assert.equal(geometry.getTop(), 100);
				assert.equal(geometry.getRight(), 250);
				assert.equal(geometry.getBottom(), 150);
				assert.equal(geometry.getWidth(), 200);
				assert.equal(geometry.getHeight(), 50);
			});

		});

	});

	describe(".setSize() (width and height) - sets size and recalculates opposite corner", () => {

		describe("Nominal use", () => {

			it("Sets new size if called with number arguments", () => {
				var geometry = new Geometry(50, 100, 200, 150);
				geometry.setSize(300, 200);
				assert.equal(geometry.getLeft(), 50);
				assert.equal(geometry.getTop(), 100);
				assert.equal(geometry.getRight(), 350);
				assert.equal(geometry.getBottom(), 300);
				assert.equal(geometry.getWidth(), 300);
				assert.equal(geometry.getHeight(), 200);
			});

			it("Sets new size if called with object argument", () => {
				var geometry = new Geometry(50, 100, 200, 150);
				geometry.setSize({ width: 300, height: 200 });
				assert.equal(geometry.getLeft(), 50);
				assert.equal(geometry.getTop(), 100);
				assert.equal(geometry.getRight(), 350);
				assert.equal(geometry.getBottom(), 300);
				assert.equal(geometry.getWidth(), 300);
				assert.equal(geometry.getHeight(), 200);
			});

			it("Sets new size to argument size if called with Geometry argument", () => {
				var geometry = new Geometry(50, 100, 200, 150);
				var resizeTo = new Geometry(400, 500, 300, 200);
				geometry.setSize(resizeTo);
				assert.equal(geometry.getLeft(), 50);
				assert.equal(geometry.getTop(), 100);
				assert.equal(geometry.getRight(), 350);
				assert.equal(geometry.getBottom(), 300);
				assert.equal(geometry.getWidth(), 300);
				assert.equal(geometry.getHeight(), 200);
			});

		});

		describe("Bad arguments", () => {

			it("Leaves object unchanged if called with bad argument type", () => {
				var geometry = new Geometry(50, 100, 200, 50);
				geometry.setSize("500", 600);
				assert.equal(geometry.getLeft(), 50);
				assert.equal(geometry.getTop(), 100);
				assert.equal(geometry.getRight(), 250);
				assert.equal(geometry.getBottom(), 150);
				assert.equal(geometry.getWidth(), 200);
				assert.equal(geometry.getHeight(), 50);
			});

		});

	});

	describe(".setOpposite() (right-bottom corner) - sets opposite corner and recalculates size", () => {

		describe("Nominal use", () => {

			it("Sets new size if called with number arguments", () => {
				var geometry = new Geometry(50, 100, 200, 150);
				geometry.setOpposite(350, 300);
				assert.equal(geometry.getLeft(), 50);
				assert.equal(geometry.getTop(), 100);
				assert.equal(geometry.getRight(), 350);
				assert.equal(geometry.getBottom(), 300);
				assert.equal(geometry.getWidth(), 300);
				assert.equal(geometry.getHeight(), 200);
			});

			it("Sets new size if called with object argument", () => {
				var geometry = new Geometry(50, 100, 200, 150);
				geometry.setOpposite({ right: 350, bottom: 300 });
				assert.equal(geometry.getLeft(), 50);
				assert.equal(geometry.getTop(), 100);
				assert.equal(geometry.getRight(), 350);
				assert.equal(geometry.getBottom(), 300);
				assert.equal(geometry.getWidth(), 300);
				assert.equal(geometry.getHeight(), 200);
			});

			it("Sets new size to stretch argument right-bottom position if called with Geometry argument", () => {
				var geometry = new Geometry(50, 100, 200, 150);
				var stretchTo = new Geometry(0, 0, 350, 300);
				geometry.setOpposite(stretchTo);
				assert.equal(geometry.getLeft(), 50);
				assert.equal(geometry.getTop(), 100);
				assert.equal(geometry.getRight(), 350);
				assert.equal(geometry.getBottom(), 300);
				assert.equal(geometry.getWidth(), 300);
				assert.equal(geometry.getHeight(), 200);
			});

		});

		describe("Bad arguments", () => {

			it("Leaves object unchanged if called with bad argument type", () => {
				var geometry = new Geometry(50, 100, 200, 50);
				geometry.setOpposite("500", 600);
				assert.equal(geometry.getLeft(), 50);
				assert.equal(geometry.getTop(), 100);
				assert.equal(geometry.getRight(), 250);
				assert.equal(geometry.getBottom(), 150);
				assert.equal(geometry.getWidth(), 200);
				assert.equal(geometry.getHeight(), 50);
			});

		});

	});

	describe("Parent methods", () => {

		describe("Nominal use", () => {

			it("Parent of new Geometry object is null", () => {
				var geometry = new Geometry(100, 100, 100, 100);
				assert.equal(geometry.getParent(), null);
			});

			it("Sets parent to Geometry argument", () => {
				var container = new Geometry(0, 0, 600, 600);
				var geometry = new Geometry(100, 100, 100, 100);
				geometry.setParent(container);
				assert.equal(geometry.getParent(), container);
			});

			it("Unsets parent", () => {
				var container = new Geometry(0, 0, 600, 600);
				var geometry = new Geometry(100, 100, 100, 100);
				geometry.setParent(container);
				assert.equal(geometry.getParent(), container);
				geometry.unsetParent();
				assert.equal(geometry.getParent(), null);
			});

		});

		describe("Bad arguments", () => {

			it("Does not set parent if argument not of Geometry type", () => {
				var geometry = new Geometry(100, 100, 100, 100);
				geometry.setParent({ left: 100, top: 100, right: 200, bottom: 200, width: 100, height: 100 });
				assert.equal(geometry.getParent(), null);
			});

		});

	});

	describe("Relative getters", () => {

		describe("Position relative to (0, 0) in case no parent is defined", () => {

			it("Gets individual positions", () => {
				var geometry = new Geometry(50, 100, 200, 250);
				assert.equal(geometry.getLeftRelative(), 50);
				assert.equal(geometry.getTopRelative(), 100);
				assert.equal(geometry.getRightRelative(), 250);
				assert.equal(geometry.getBottomRelative(), 350);
			});

			it("Gets position object", () => {
				var geometry = new Geometry(50, 100, 200, 250);
				var position = geometry.getRelative();
				assert.equal(position.left, 50);
				assert.equal(position.top, 100);
				assert.equal(position.right, 250);
				assert.equal(position.bottom, 350);
			});

		});

		describe("Position relative to parent in case parent is defined", () => {

			it("Gets individual positions", () => {
				var geometry = new Geometry(450, 600, 200, 250);
				var container = new Geometry(400, 500, 1000, 1000);
				geometry.setParent(container);
				assert.equal(geometry.getLeftRelative(), 50);
				assert.equal(geometry.getTopRelative(), 100);
				assert.equal(geometry.getRightRelative(), 250);
				assert.equal(geometry.getBottomRelative(), 350);
			});

			it("Gets position object", () => {
				var geometry = new Geometry(450, 600, 200, 250);
				var container = new Geometry(400, 500, 1000, 1000);
				geometry.setParent(container);
				var position = geometry.getRelative();
				assert.equal(position.left, 50);
				assert.equal(position.top, 100);
				assert.equal(position.right, 250);
				assert.equal(position.bottom, 350);
			});

		});

	});

	describe("Distance getters", () => {

		describe("Undefined distance in case no parent is defined", () => {

			it("Gets individual distances", () => {
				var geometry = new Geometry(50, 100, 200, 250);
				assert.equal(geometry.getLeftDistance(), undefined);
				assert.equal(geometry.getTopDistance(), undefined);
				assert.equal(geometry.getRightDistance(), undefined);
				assert.equal(geometry.getBottomDistance(), undefined);
			});

			it("Gets distance object (as undefined)", () => {
				var geometry = new Geometry(50, 100, 200, 250);
				var distance = geometry.getDistance();
				assert.equal(distance, undefined);
			});

		});

		describe("Distance relative to parent in case parent is defined", () => {

			it("Gets individual positions", () => {
				var geometry = new Geometry(150, 300, 200, 250);
				var container = new Geometry(100, 200, 1000, 1000);
				geometry.setParent(container);
				assert.equal(geometry.getLeftDistance(), 50);
				assert.equal(geometry.getTopDistance(), 100);
				assert.equal(geometry.getRightDistance(), 750);
				assert.equal(geometry.getBottomDistance(), 650);
			});

			it("Gets position object", () => {
				var geometry = new Geometry(150, 300, 200, 250);
				var container = new Geometry(100, 200, 1000, 1000);
				geometry.setParent(container);
				var distance = geometry.getDistance();
				assert.equal(distance.left, 50);
				assert.equal(distance.top, 100);
				assert.equal(distance.right, 750);
				assert.equal(distance.bottom, 650);
			});

		});

	});

});
