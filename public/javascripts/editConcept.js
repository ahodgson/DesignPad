
// setup our test canvas
// and a simple drawing function
window.onload = function() {

	var bMouseIsDown = false;
	
	var oCanvas = document.getElementById("thecanvas");
	var oCtx = oCanvas.getContext("2d");

	var iWidth = oCanvas.width;
	var iHeight = oCanvas.height;

	// import the current concept
	var img = new Image();
	img.src = document.getElementById("concept_image").src;
	oCtx.drawImage(img,0,0,iWidth,iHeight);
	oCtx.fillStyle = "rgb(255,255,255)";

	oCtx.beginPath();
	oCtx.strokeStyle = "rgb(0,0,0)";
	oCtx.strokeWidth = "4px";

	oCanvas.onmousedown = function(e) {
		bMouseIsDown = true;
		iLastX = e.clientX - oCanvas.offsetLeft + (window.pageXOffset||document.body.scrollLeft||document.documentElement.scrollLeft);
		iLastY = e.clientY - oCanvas.offsetTop + (window.pageYOffset||document.body.scrollTop||document.documentElement.scrollTop);
	}
	oCanvas.onmouseup = function() {
		bMouseIsDown = false;
		iLastX = -1;
		iLastY = -1;
	}
	oCanvas.onmousemove = function(e) {
		if (bMouseIsDown) {
			var iX = e.clientX - oCanvas.offsetLeft + (window.pageXOffset||document.body.scrollLeft||document.documentElement.scrollLeft);
			var iY = e.clientY - oCanvas.offsetTop + (window.pageYOffset||document.body.scrollTop||document.documentElement.scrollTop);
			oCtx.moveTo(iLastX, iLastY);
			oCtx.lineTo(iX, iY);
			oCtx.stroke();
			iLastX = iX;
			iLastY = iY;
		}
	}

	function showDownloadText() {
	
		document.getElementById("concept_image_data").value = document.getElementById("thecanvas").src;
		document.getElementById("auto_save").click();
	}

	function hideDownloadText() {
		document.getElementById("buttoncontainer").style.display = "block";
		document.getElementById("textdownload").style.display = "none";
	}

	function convertCanvas(strType) {
		if (strType == "PNG")
			var oImg = Canvas2Image.saveAsPNG(oCanvas, true);
		if (strType == "BMP")
			var oImg = Canvas2Image.saveAsBMP(oCanvas, true);
		if (strType == "JPEG")
			var oImg = Canvas2Image.saveAsJPEG(oCanvas, true);

		if (!oImg) {
			alert("Sorry, this browser is not capable of saving " + strType + " files!");
			return false;
		}	
		oImg.id = "thecanvas";

		oImg.style.border = oCanvas.style.border;
		oCanvas.parentNode.replaceChild(oImg, oCanvas);
		
		showDownloadText();
	}

	function saveCanvas(pCanvas, strType) {
		var bRes = false;
		if (strType == "PNG")
			bRes = Canvas2Image.saveAsPNG(oCanvas);
		if (strType == "BMP")
			bRes = Canvas2Image.saveAsBMP(oCanvas);
		if (strType == "JPEG")
			bRes = Canvas2Image.saveAsJPEG(oCanvas);

		if (!bRes) {
			alert("Sorry, this browser is not capable of saving " + strType + " files!");
			return false;
		}
	}

	document.getElementById("convertpngbtn").onclick = function() {
		convertCanvas("PNG");
	}

	document.getElementById("resetbtn").onclick = function() {
		var oImg = document.getElementById("thecanvas");
		oImg.parentNode.replaceChild(oCanvas, oImg);

		hideDownloadText();
	}
	
	document.getElementById("editcanvas").onclick = function() {
		document.getElementById("edit_concept_canvas").style.display = "block";
	}
	
	document.getElementById("hidecanvas").onclick = function() {
		document.getElementById("edit_concept_canvas").style.display = "none";
	}
	
	document.getElementById("upload").onclick = function() {
		document.getElementById("edit_concept_upload").style.display = "block";
	}
	
	document.getElementById("hideupload").onclick = function() {
		document.getElementById("edit_concept_upload").style.display = "none";
	}

}