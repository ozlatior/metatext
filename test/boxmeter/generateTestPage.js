const BoxMeter = require("../../src/boxmeter.js");

const boxmeter = new BoxMeter();

var metrics = {
    wat15: 7.5,
    wsb15: 0.5,
    wsa15: 0.5,
    hat15: 17,
    hsb15: 1.2,
    hsa15: 1.2,
    en15: -1,
    ew15: 1,
    enb15: 0,
    ewb15: -0.4,
    ena15: 0,
    ewa15: 0.4
};

function testGlyphBox() {
	console.log(BoxMeter.getGlyphBoundingBox(metrics, 10, 0));
	console.log(BoxMeter.getGlyphBoundingBox(metrics, 15, 0));
	console.log(BoxMeter.getGlyphBoundingBox(metrics, 20, 0));

	console.log(BoxMeter.getGlyphBoundingBox(metrics, 10, -1));
	console.log(BoxMeter.getGlyphBoundingBox(metrics, 15, -1));
	console.log(BoxMeter.getGlyphBoundingBox(metrics, 20, -1));

	console.log(BoxMeter.getGlyphBoundingBox(metrics, 10, -2));
	console.log(BoxMeter.getGlyphBoundingBox(metrics, 15, -2));
	console.log(BoxMeter.getGlyphBoundingBox(metrics, 20, -2));

	console.log(BoxMeter.getGlyphBoundingBox(metrics, 10, 0));
	console.log(BoxMeter.getGlyphBoundingBox(metrics, 15, 0));
	console.log(BoxMeter.getGlyphBoundingBox(metrics, 20, 0));

	console.log(BoxMeter.getGlyphBoundingBox(metrics, 10, 1));
	console.log(BoxMeter.getGlyphBoundingBox(metrics, 15, 1));
	console.log(BoxMeter.getGlyphBoundingBox(metrics, 20, 1));

	console.log(BoxMeter.getGlyphBoundingBox(metrics, 10, 2));
	console.log(BoxMeter.getGlyphBoundingBox(metrics, 15, 2));
	console.log(BoxMeter.getGlyphBoundingBox(metrics, 20, 2));
}

function testTextBox() {
	var str = "The quick brown fox jumped over the lazy dog";
	console.log(boxmeter.getTextBoundingBox("Times New Roman", false, false, "15px", "0px", str));
}

function getAllOptions(fonts, bold, italic, size, spacing, str) {
	var ret = [];
	for (var i=0; i<fonts.length; i++)
		for (var j=0; j<bold.length; j++)
			for (var k=0; k<italic.length; k++)
				for (var l=0; l<size.length; l++)
					for (var m=0; m<spacing.length; m++)
						for (var n=0; n<str.length; n++)
							ret.push({
								font: fonts[i],
								bold: bold[j],
								italic: italic[k],
								size: size[l],
								spacing: spacing[m],
								str: str[n]
							});
	return ret;
}

function getStyleString(options) {
	var ret = [];
	ret.push("font-family: \"" + options.font + "\"");
	ret.push("font-weight: " + (options.bold === true ? "bold" : "normal"));
	ret.push("font-style: " + (options.italic === true ? "italic" : "normal"));
	ret.push("font-size: " + options.size);
	ret.push("letter-spacing: " + options.spacing);
	return ret.join("; ");
}

function getTestBox(options) {
	var boundingBox = boxmeter.getTextBoundingBox(
		options.font, options.bold, options.italic, options.size, options.spacing, options.str);
	var styleString = getStyleString(options);
	var ret = [];
	ret.push("\t\t<div name='testBox' class='testBox'>");
	ret.push("\t\t\t<div name='details' class='details'>" + styleString + "</div>");
	ret.push("\t\t\t<div name='expected'><span class='value' name='width'>" + boundingBox[0] +
		"</span><span class='value' name='height'>" + boundingBox[1] +
		"</span><span class='value' name='result'>PENDING</span></div>");
	ret.push("\t\t\t<div><p name='sample' class='sample' style='" + styleString + "'>" + options.str + "</p></div>");
	ret.push("\t\t</div>");
	return ret.join("\n");
}

function getHeader() {
	var ret = [];

	ret.push("<html>");
	ret.push("<head>");
	ret.push("\t<style>");
	ret.push("\t\tp {");
	ret.push("\t\t\tdisplay: inline-block;");
	ret.push("\t\t\tbackground-color: #FFFF99;");
	ret.push("\t\t\tmargin: 10px;");
	ret.push("\t\t\tpadding: 0px;");
	ret.push("\t\t}");
	ret.push("");

	ret.push("\t\tdiv {");
	ret.push("\t\t\tmargin: 10px;");
	ret.push("\t\t\tfont-family: sans-serif;");
	ret.push("\t\t\tfont-size: 12px;");
	ret.push("\t\t}");

	ret.push("\t\tdiv.testBox {");
	ret.push("\t\t\tborder: 1px solid black;");
	ret.push("\t\t\tpadding: 5px;");
	ret.push("\t\t\tbackground-color: #CCCCCC;");
	ret.push("\t\t}");

	ret.push("\t\tdiv.details {");
	ret.push("\t\t\tfont-size: 14px;");
	ret.push("\t\t}");

	ret.push("\t\tspan.value {");
	ret.push("\t\t\tmargin: 5px;");
	ret.push("\t\t}");

	ret.push("\t\tspan.pass {");
	ret.push("\t\t\tcolor: #009900;");
	ret.push("\t\t}");

	ret.push("\t\tspan.fail {");
	ret.push("\t\t\tcolor: #990000;");
	ret.push("\t\t}");

	ret.push("\t</style>");
	ret.push("</head>");

	ret.push("<body>");
	ret.push("\t<div id='summary'>");
	ret.push("\t</div>");
	ret.push("\t<div id='content'>");

	return ret.join("\n");
}

var runTests = function() {
	var toleranceW = 0.05;
	var toleranceH = 0.05;
	var container = document.getElementById("content");
	var boxes = container.getElementsByClassName("testBox");
	var results = {
		total: 0,
		passed: 0,
		failed: 0
	};
	var res;
	for (var i=0; i<boxes.length; i++) {
		var spans = boxes[i].getElementsByClassName("value");
		var expectedW = parseFloat(spans[0].innerHTML);
		var expectedH = parseFloat(spans[1].innerHTML);
		var output = spans[2];
		var sampleBox = boxes[i].getElementsByClassName("sample")[0];
		var actualW = sampleBox.clientWidth;
		var actualH = sampleBox.clientHeight;
		var err = [];
		var tolW = actualW * toleranceW;
		if (tolW < 5)
			tolW = 5;
		var tolH = actualH * toleranceH;
		if (tolH < 5)
			tolH = 5;
		if (Math.abs(expectedW - actualW) > tolW)
			err.push("Expected width " + expectedW + ", found " + actualW);
		if (Math.abs(expectedH - actualH) > tolH)
			err.push("Expected height " + expectedH + ", found " + actualH);
		if (err.length > 0) {
			res = "<span class='fail'><b>FAILED:</b> " + err.join(", ") + "</span>";
			results.failed++;
		}
		else {
			res = "<span class='pass'><b>PASSED</b></span>";
			results.passed++;
		}
		results.total++;
		output.innerHTML = res;
	}

	res = "Total tests: " + results.total + ", passed: " + results.passed + ", failed: " + results.failed;

	document.getElementById("summary").innerHTML = res;
};

function getFooter() {
	var ret = [];

	ret.push("\t</div>");
	ret.push("<script type='text/javascript'>");
	ret.push("var runTests = " + runTests.toString());
	ret.push("runTests();");
	ret.push("</script>");
	ret.push("</body>");
	ret.push("</html>");

	return ret.join("\n");
}

function generateTestPage() {
	var fonts = [ "Times New Roman", "Verdana", "Tahoma", "Courier New", "Arial" ];
	var bold = [ false, true ];
	var italic = [ false, true ];
	var size = [ "5px", "10px", "15px", "20px", "30px" ];
	var spacing = [ "-2px", "0px", "2px" ];
	var str = [
		"The quick brown fox jumped over the lazy dog.",
		"1 + 3 = 4 - this is because 1 + 1 = 2 and 3 = 1 + 2!",
		"aaaaaaaaa mmmmmmm zzzzzzz lllllll xxxxxxxx"
	];
	var options = getAllOptions(fonts, bold, italic, size, spacing, str);

	console.log(getHeader());
	
	for (var i=0; i<options.length; i++) {
		console.log(getTestBox(options[i]));
	}

	console.log(getFooter());
}

generateTestPage();
