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

	describe("Addition functions", () => {

		describe("Static addition", () => {

			it("Adds two disjunct boxes and returns a new object (1)", () => {
				var g1 = new Geometry(100, 200, 300, 400);
				var g2 = new Geometry(500, 700, 100, 200);
				var r = Geometry.add(g1, g2);
				assert.notEqual(r, g1);
				assert.notEqual(r, g2);
				assert.equal(r.getLeft(), 100);
				assert.equal(r.getTop(), 200);
				assert.equal(r.getRight(), 600);
				assert.equal(r.getBottom(), 900);
				assert.equal(r.getWidth(), 500);
				assert.equal(r.getHeight(), 700);
			});

			it("Adds two disjunct boxes and returns a new object (2)", () => {
				var g1 = new Geometry(500, 700, 100, 200);
				var g2 = new Geometry(100, 200, 300, 400);
				var r = Geometry.add(g1, g2);
				assert.notEqual(r, g1);
				assert.notEqual(r, g2);
				assert.equal(r.getLeft(), 100);
				assert.equal(r.getTop(), 200);
				assert.equal(r.getRight(), 600);
				assert.equal(r.getBottom(), 900);
				assert.equal(r.getWidth(), 500);
				assert.equal(r.getHeight(), 700);
			});

			it("Adds two intersecting boxes and returns a new object (1)", () => {
				var g1 = new Geometry(100, 200, 300, 400);
				var g2 = new Geometry(300, 300, 200, 300);
				var r = Geometry.add(g1, g2);
				assert.notEqual(r, g1);
				assert.notEqual(r, g2);
				assert.equal(r.getLeft(), 100);
				assert.equal(r.getTop(), 200);
				assert.equal(r.getRight(), 500);
				assert.equal(r.getBottom(), 600);
				assert.equal(r.getWidth(), 400);
				assert.equal(r.getHeight(), 400);
			});

			it("Adds two intersecting boxes and returns a new object (2)", () => {
				var g1 = new Geometry(300, 300, 200, 300);
				var g2 = new Geometry(100, 200, 300, 400);
				var r = Geometry.add(g1, g2);
				assert.notEqual(r, g1);
				assert.notEqual(r, g2);
				assert.equal(r.getLeft(), 100);
				assert.equal(r.getTop(), 200);
				assert.equal(r.getRight(), 500);
				assert.equal(r.getBottom(), 600);
				assert.equal(r.getWidth(), 400);
				assert.equal(r.getHeight(), 400);
			});

			it("Adds two overlapping boxes and returns a new object (1)", () => {
				var g1 = new Geometry(100, 200, 400, 500);
				var g2 = new Geometry(300, 300, 200, 300);
				var r = Geometry.add(g1, g2);
				assert.notEqual(r, g1);
				assert.notEqual(r, g2);
				assert.equal(r.getLeft(), 100);
				assert.equal(r.getTop(), 200);
				assert.equal(r.getRight(), 500);
				assert.equal(r.getBottom(), 700);
				assert.equal(r.getWidth(), 400);
				assert.equal(r.getHeight(), 500);
			});

			it("Adds two overlapping boxes and returns a new object (2)", () => {
				var g1 = new Geometry(300, 300, 200, 300);
				var g2 = new Geometry(100, 200, 400, 500);
				var r = Geometry.add(g1, g2);
				assert.notEqual(r, g1);
				assert.notEqual(r, g2);
				assert.equal(r.getLeft(), 100);
				assert.equal(r.getTop(), 200);
				assert.equal(r.getRight(), 500);
				assert.equal(r.getBottom(), 700);
				assert.equal(r.getWidth(), 400);
				assert.equal(r.getHeight(), 500);
			});

		});

		describe("Static addition, swapped", () => {

			it("Adds two disjunct boxes and returns a new object (1)", () => {
				var g1 = new Geometry(400, 600, -300, -400);
				var g2 = new Geometry(600, 900, -100, -200);
				var r = Geometry.add(g1, g2);
				assert.notEqual(r, g1);
				assert.notEqual(r, g2);
				assert.equal(r.getLeft(), 100);
				assert.equal(r.getTop(), 200);
				assert.equal(r.getRight(), 600);
				assert.equal(r.getBottom(), 900);
				assert.equal(r.getWidth(), 500);
				assert.equal(r.getHeight(), 700);
			});

			it("Adds two disjunct boxes and returns a new object (2)", () => {
				var g1 = new Geometry(600, 900, -100, -200);
				var g2 = new Geometry(400, 600, -300, -400);
				var r = Geometry.add(g1, g2);
				assert.notEqual(r, g1);
				assert.notEqual(r, g2);
				assert.equal(r.getLeft(), 100);
				assert.equal(r.getTop(), 200);
				assert.equal(r.getRight(), 600);
				assert.equal(r.getBottom(), 900);
				assert.equal(r.getWidth(), 500);
				assert.equal(r.getHeight(), 700);
			});

			it("Adds two intersecting boxes and returns a new object (1)", () => {
				var g1 = new Geometry(400, 600, -300, -400);
				var g2 = new Geometry(500, 600, -200, -300);
				var r = Geometry.add(g1, g2);
				assert.notEqual(r, g1);
				assert.notEqual(r, g2);
				assert.equal(r.getLeft(), 100);
				assert.equal(r.getTop(), 200);
				assert.equal(r.getRight(), 500);
				assert.equal(r.getBottom(), 600);
				assert.equal(r.getWidth(), 400);
				assert.equal(r.getHeight(), 400);
			});

			it("Adds two intersecting boxes and returns a new object (2)", () => {
				var g1 = new Geometry(500, 600, -200, -300);
				var g2 = new Geometry(400, 600, -300, -400);
				var r = Geometry.add(g1, g2);
				assert.notEqual(r, g1);
				assert.notEqual(r, g2);
				assert.equal(r.getLeft(), 100);
				assert.equal(r.getTop(), 200);
				assert.equal(r.getRight(), 500);
				assert.equal(r.getBottom(), 600);
				assert.equal(r.getWidth(), 400);
				assert.equal(r.getHeight(), 400);
			});

			it("Adds two overlapping boxes and returns a new object (1)", () => {
				var g1 = new Geometry(500, 700, -400, -500);
				var g2 = new Geometry(500, 600, -200, -300);
				var r = Geometry.add(g1, g2);
				assert.notEqual(r, g1);
				assert.notEqual(r, g2);
				assert.equal(r.getLeft(), 100);
				assert.equal(r.getTop(), 200);
				assert.equal(r.getRight(), 500);
				assert.equal(r.getBottom(), 700);
				assert.equal(r.getWidth(), 400);
				assert.equal(r.getHeight(), 500);
			});

			it("Adds two overlapping boxes and returns a new object (2)", () => {
				var g1 = new Geometry(500, 600, -200, -300);
				var g2 = new Geometry(500, 700, -400, -500);
				var r = Geometry.add(g1, g2);
				assert.notEqual(r, g1);
				assert.notEqual(r, g2);
				assert.equal(r.getLeft(), 100);
				assert.equal(r.getTop(), 200);
				assert.equal(r.getRight(), 500);
				assert.equal(r.getBottom(), 700);
				assert.equal(r.getWidth(), 400);
				assert.equal(r.getHeight(), 500);
			});

		});

		describe("Object addition", () => {

			it("Adds a disjunct box to existing box (1)", () => {
				var g1 = new Geometry(100, 200, 300, 400);
				var g2 = new Geometry(500, 700, 100, 200);
				g1.add(g2);
				assert.equal(g1.getLeft(), 100);
				assert.equal(g1.getTop(), 200);
				assert.equal(g1.getRight(), 600);
				assert.equal(g1.getBottom(), 900);
				assert.equal(g1.getWidth(), 500);
				assert.equal(g1.getHeight(), 700);
			});

			it("Adds a disjunct box to existing box (2)", () => {
				var g1 = new Geometry(500, 700, 100, 200);
				var g2 = new Geometry(100, 200, 300, 400);
				g1.add(g2);
				assert.equal(g1.getLeft(), 100);
				assert.equal(g1.getTop(), 200);
				assert.equal(g1.getRight(), 600);
				assert.equal(g1.getBottom(), 900);
				assert.equal(g1.getWidth(), 500);
				assert.equal(g1.getHeight(), 700);
			});

			it("Adds an intersecting box to existing box (1)", () => {
				var g1 = new Geometry(100, 200, 300, 400);
				var g2 = new Geometry(300, 300, 200, 300);
				g1.add(g2);
				assert.equal(g1.getLeft(), 100);
				assert.equal(g1.getTop(), 200);
				assert.equal(g1.getRight(), 500);
				assert.equal(g1.getBottom(), 600);
				assert.equal(g1.getWidth(), 400);
				assert.equal(g1.getHeight(), 400);
			});

			it("Adds an intersecting box to existing box (2)", () => {
				var g1 = new Geometry(300, 300, 200, 300);
				var g2 = new Geometry(100, 200, 300, 400);
				g1.add(g2);
				assert.equal(g1.getLeft(), 100);
				assert.equal(g1.getTop(), 200);
				assert.equal(g1.getRight(), 500);
				assert.equal(g1.getBottom(), 600);
				assert.equal(g1.getWidth(), 400);
				assert.equal(g1.getHeight(), 400);
			});

			it("Adds overlapping box to existing box (1)", () => {
				var g1 = new Geometry(100, 200, 400, 500);
				var g2 = new Geometry(300, 300, 200, 300);
				g1.add(g2);
				assert.equal(g1.getLeft(), 100);
				assert.equal(g1.getTop(), 200);
				assert.equal(g1.getRight(), 500);
				assert.equal(g1.getBottom(), 700);
				assert.equal(g1.getWidth(), 400);
				assert.equal(g1.getHeight(), 500);
			});

			it("Adds overlapping box to existing box (2)", () => {
				var g1 = new Geometry(300, 300, 200, 300);
				var g2 = new Geometry(100, 200, 400, 500);
				g1.add(g2);
				assert.equal(g1.getLeft(), 100);
				assert.equal(g1.getTop(), 200);
				assert.equal(g1.getRight(), 500);
				assert.equal(g1.getBottom(), 700);
				assert.equal(g1.getWidth(), 400);
				assert.equal(g1.getHeight(), 500);
			});

		});

		describe("Object addition, swapped (negative orientation)", () => {

			it("Adds a disjunct box to an existing box (1)", () => {
				var g1 = new Geometry(400, 600, -300, -400);
				var g2 = new Geometry(600, 900, -100, -200);
				g1.add(g2);
				assert.equal(g1.getLeft(), 600);
				assert.equal(g1.getTop(), 900);
				assert.equal(g1.getRight(), 100);
				assert.equal(g1.getBottom(), 200);
				assert.equal(g1.getWidth(), -500);
				assert.equal(g1.getHeight(), -700);
			});

			it("Adds a disjunct box to an existing box (2)", () => {
				var g1 = new Geometry(600, 900, -100, -200);
				var g2 = new Geometry(400, 600, -300, -400);
				g1.add(g2);
				assert.equal(g1.getLeft(), 600);
				assert.equal(g1.getTop(), 900);
				assert.equal(g1.getRight(), 100);
				assert.equal(g1.getBottom(), 200);
				assert.equal(g1.getWidth(), -500);
				assert.equal(g1.getHeight(), -700);
			});

			it("Adds an intersecting box to an existing box (1)", () => {
				var g1 = new Geometry(400, 600, -300, -400);
				var g2 = new Geometry(500, 600, -200, -300);
				g1.add(g2);
				assert.equal(g1.getLeft(), 500);
				assert.equal(g1.getTop(), 600);
				assert.equal(g1.getRight(), 100);
				assert.equal(g1.getBottom(), 200);
				assert.equal(g1.getWidth(), -400);
				assert.equal(g1.getHeight(), -400);
			});

			it("Adds an intersecting box to an existing box (2)", () => {
				var g1 = new Geometry(500, 600, -200, -300);
				var g2 = new Geometry(400, 600, -300, -400);
				g1.add(g2);
				assert.equal(g1.getLeft(), 500);
				assert.equal(g1.getTop(), 600);
				assert.equal(g1.getRight(), 100);
				assert.equal(g1.getBottom(), 200);
				assert.equal(g1.getWidth(), -400);
				assert.equal(g1.getHeight(), -400);
			});

			it("Adds an overlapping box to an existing box (1)", () => {
				var g1 = new Geometry(500, 700, -400, -500);
				var g2 = new Geometry(500, 600, -200, -300);
				g1.add(g2);
				assert.equal(g1.getLeft(), 500);
				assert.equal(g1.getTop(), 700);
				assert.equal(g1.getRight(), 100);
				assert.equal(g1.getBottom(), 200);
				assert.equal(g1.getWidth(), -400);
				assert.equal(g1.getHeight(), -500);
			});

			it("Adds an overlapping box to an existing box (2)", () => {
				var g1 = new Geometry(500, 600, -200, -300);
				var g2 = new Geometry(500, 700, -400, -500);
				g1.add(g2);
				assert.equal(g1.getLeft(), 500);
				assert.equal(g1.getTop(), 700);
				assert.equal(g1.getRight(), 100);
				assert.equal(g1.getBottom(), 200);
				assert.equal(g1.getWidth(), -400);
				assert.equal(g1.getHeight(), -500);
			});

		});

	});

	describe("Relative positions and alignment", () => {

		describe("Relative position functions and flags", () => {

			it("Detects position before another box", () => {
				var g1 = new Geometry(100, 150, 200, 250);
				var g2 = new Geometry(400, 500, 50, 75);
				assert.equal(g1.isBeforeX(g2), true);
				assert.equal(g1.isBeforeY(g2), true);
				assert.equal(g1.getRelativePosition(g2), Geometry.rel.BEFORE_X | Geometry.rel.BEFORE_Y);
				assert.equal(g1.getRelativeFlags(g2) & ( Geometry.rel.BEFORE_X | Geometry.rel.BEFORE_Y),
														 Geometry.rel.BEFORE_X | Geometry.rel.BEFORE_Y);
			});

			it("Detects position after another box", () => {
				var g1 = new Geometry(400, 500, 50, 75);
				var g2 = new Geometry(100, 150, 200, 250);
				assert.equal(g1.isAfterX(g2), true);
				assert.equal(g1.isAfterY(g2), true);
				assert.equal(g1.getRelativePosition(g2), Geometry.rel.AFTER_X | Geometry.rel.AFTER_Y);
				assert.equal(g1.getRelativeFlags(g2) & ( Geometry.rel.AFTER_X | Geometry.rel.AFTER_Y),
														 Geometry.rel.AFTER_X | Geometry.rel.AFTER_Y);
			});

			it("Detects position crossing the box on the top and left", () => {
				var g1 = new Geometry(100, 150, 200, 250);
				var g2 = new Geometry(280, 350, 50, 75);
				assert.equal(g1.isCrossingLeft(g2), true);
				assert.equal(g1.isCrossingTop(g2), true);
				assert.equal(g1.getRelativePosition(g2), Geometry.rel.CROSSES_L | Geometry.rel.CROSSES_T);
				assert.equal(g1.getRelativeFlags(g2) & ( Geometry.rel.CROSSES_L | Geometry.rel.CROSSES_T),
														 Geometry.rel.CROSSES_L | Geometry.rel.CROSSES_T);
			});

			it("Detects position crossing the box on the bottom and right", () => {
				var g1 = new Geometry(280, 350, 50, 75);
				var g2 = new Geometry(100, 150, 200, 250);
				assert.equal(g1.isCrossingRight(g2), true);
				assert.equal(g1.isCrossingBottom(g2), true);
				assert.equal(g1.getRelativePosition(g2), Geometry.rel.CROSSES_R | Geometry.rel.CROSSES_B);
				assert.equal(g1.getRelativeFlags(g2) & ( Geometry.rel.CROSSES_R | Geometry.rel.CROSSES_B),
														 Geometry.rel.CROSSES_R | Geometry.rel.CROSSES_B);
			});

			it("Detects that another box is included in first box", () => {
				var g1 = new Geometry(100, 200, 400, 500);
				var g2 = new Geometry(100, 300, 50, 75);
				assert.equal(g1.isIncludedX(g2), true);
				assert.equal(g1.isIncludedY(g2), true);
				assert.equal(g1.isIncluded(g2), true);
				assert.equal(g1.getRelativePosition(g2), Geometry.rel.INCLUDED_X | Geometry.rel.INCLUDED_Y);
				assert.equal(g1.getRelativeFlags(g2) & ( Geometry.rel.INCLUDED_X | Geometry.rel.INCLUDED_Y),
														 Geometry.rel.INCLUDED_X | Geometry.rel.INCLUDED_Y);
			});

			it("Detects that another box includes the first box", () => {
				var g1 = new Geometry(100, 300, 50, 75);
				var g2 = new Geometry(100, 200, 400, 500);
				assert.equal(g1.isIncludingX(g2), true);
				assert.equal(g1.isIncludingY(g2), true);
				assert.equal(g1.isIncluding(g2), true);
				assert.equal(g1.getRelativePosition(g2), Geometry.rel.INCLUDES_X | Geometry.rel.INCLUDES_Y);
				assert.equal(g1.getRelativeFlags(g2) & ( Geometry.rel.INCLUDES_X | Geometry.rel.INCLUDES_Y),
														 Geometry.rel.INCLUDES_X | Geometry.rel.INCLUDES_Y);
			});

			it("Detects that another box overlaps the first box", () => {
				var g1 = new Geometry(100, 200, 400, 500);
				var g2 = new Geometry(100, 200, 400, 500);
				assert.equal(g1.isOverlappingX(g2), true);
				assert.equal(g1.isOverlappingY(g2), true);
				assert.equal(g1.isOverlapping(g2), true);
				assert.equal(g1.getRelativePosition(g2),
					Geometry.rel.OVERLAPS_X | Geometry.rel.OVERLAPS_Y |
					Geometry.rel.INCLUDES_X | Geometry.rel.INCLUDES_Y |
					Geometry.rel.INCLUDED_X | Geometry.rel.INCLUDED_Y
				);
				assert.equal(g1.getRelativeFlags(g2) & ( Geometry.rel.OVERLAPS_X | Geometry.rel.OVERLAPS_Y),
														 Geometry.rel.OVERLAPS_X | Geometry.rel.OVERLAPS_Y);
			});


		});

		describe("Relative alignment functions and flags", () => {

			it("Detects that another box is aligned to the top and left on the outside", () => {
				var g1 = new Geometry(100, 200, 300, 400);
				var g2 = new Geometry(100, 200, -75, -50);
				assert.equal(g1.isAlignedLeftOut(g2), true);
				assert.equal(g1.isAlignedTopOut(g2), true);
				assert.equal(g1.getRelativeAlignment(g2), Geometry.align.LEFT_OUT | Geometry.align.TOP_OUT);
				assert.equal(g1.getRelativeFlags(g2)  & ( Geometry.align.LEFT_OUT | Geometry.align.TOP_OUT),
														  Geometry.align.LEFT_OUT | Geometry.align.TOP_OUT);
			});

			it("Detects that another box is aligned to the top and left on the inside", () => {
				var g1 = new Geometry(100, 200, 300, 400);
				var g2 = new Geometry(100, 200, 75, 50);
				assert.equal(g1.isAlignedLeft(g2), true);
				assert.equal(g1.isAlignedTop(g2), true);
				assert.equal(g1.getRelativeAlignment(g2), Geometry.align.LEFT | Geometry.align.TOP);
				assert.equal(g1.getRelativeFlags(g2)  & ( Geometry.align.LEFT | Geometry.align.TOP),
														  Geometry.align.LEFT | Geometry.align.TOP);
				assert.equal(g2.isAlignedLeft(g1), true);
				assert.equal(g2.isAlignedTop(g1), true);
				assert.equal(g2.getRelativeAlignment(g1), Geometry.align.LEFT | Geometry.align.TOP);
				assert.equal(g2.getRelativeFlags(g1)  & ( Geometry.align.LEFT | Geometry.align.TOP),
														  Geometry.align.LEFT | Geometry.align.TOP);
			});

			it("Detects that another box is aligned to the center and middle", () => {
				var g1 = new Geometry(100, 200, 300, 400);
				var g2 = new Geometry(150, 250, 200, 300);
				assert.equal(g1.isAlignedCenter(g2), true);
				assert.equal(g1.isAlignedMiddle(g2), true);
				assert.equal(g1.getRelativeAlignment(g2), Geometry.align.CENTER | Geometry.align.MIDDLE);
				assert.equal(g1.getRelativeFlags(g2)  & ( Geometry.align.CENTER | Geometry.align.MIDDLE),
														  Geometry.align.CENTER | Geometry.align.MIDDLE);
				assert.equal(g2.isAlignedCenter(g1), true);
				assert.equal(g2.isAlignedMiddle(g1), true);
				assert.equal(g2.getRelativeAlignment(g1), Geometry.align.CENTER | Geometry.align.MIDDLE);
				assert.equal(g2.getRelativeFlags(g1)  & ( Geometry.align.CENTER | Geometry.align.MIDDLE),
														  Geometry.align.CENTER | Geometry.align.MIDDLE);
			});

			it("Detects that another box is aligned to the bottom and right on the inside", () => {
				var g1 = new Geometry(100, 200, 300, 400);
				var g2 = new Geometry(400, 600, -75, -50);
				assert.equal(g1.isAlignedRight(g2), true);
				assert.equal(g1.isAlignedBottom(g2), true);
				assert.equal(g1.getRelativeAlignment(g2), Geometry.align.RIGHT | Geometry.align.BOTTOM);
				assert.equal(g1.getRelativeFlags(g2)  & ( Geometry.align.RIGHT | Geometry.align.BOTTOM),
														  Geometry.align.RIGHT | Geometry.align.BOTTOM);
				assert.equal(g2.isAlignedRight(g1), true);
				assert.equal(g2.isAlignedBottom(g1), true);
				assert.equal(g2.getRelativeAlignment(g1), Geometry.align.RIGHT | Geometry.align.BOTTOM);
				assert.equal(g2.getRelativeFlags(g1)  & ( Geometry.align.RIGHT | Geometry.align.BOTTOM),
														  Geometry.align.RIGHT | Geometry.align.BOTTOM);
			});

			it("Detects that another box is aligned to the bottom and right on the outside", () => {
				var g1 = new Geometry(100, 200, 300, 400);
				var g2 = new Geometry(400, 600, 75, 50);
				assert.equal(g1.isAlignedRightOut(g2), true);
				assert.equal(g1.isAlignedBottomOut(g2), true);
				assert.equal(g1.getRelativeAlignment(g2), Geometry.align.RIGHT_OUT | Geometry.align.BOTTOM_OUT);
				assert.equal(g1.getRelativeFlags(g2)  & ( Geometry.align.RIGHT_OUT | Geometry.align.BOTTOM_OUT),
														  Geometry.align.RIGHT_OUT | Geometry.align.BOTTOM_OUT);
			});

		});

	});

});
