/* BUTTONS TO SHOW APPROPRIATE VIEWS IN SKETCH BOX */

jQuery(".upload_concept_button").live( "click", function() {
  jQuery("#upload_image").siblings().hide();
  jQuery("#upload_image").show();
});

jQuery(".edit_concept_button").live( "click", function() {
  jQuery("#edit_image").siblings().hide();
  jQuery("#edit_image").show();

  initCanvas();
});

jQuery(".delete_concept_button").live( "click", function() {
  if( confirm("Are you sure you would like to delete this sketch?") ) {
    var resource_id = jQuery(this).attr("id").slice(0,-14);

    jQuery.ajax( {
      type: "POST",
      url: "/concepts/delete_avatar/"+resource_id,
      success: function() {
        jQuery("#concept_image").attr("src", "/images/none.jpg");
      }
    });
  }
});

jQuery(".cancel_concept_button").live( "click", function() {
  jQuery("#concept_image").siblings().hide();
  jQuery("#concept_image").show();
});

jQuery(".reset_concept_button").live( "click", function() {
  initCanvas();
});

/* SKETCH BOX: EDIT IMAGE: CANVAS */

function initCanvas() {

  var bMouseIsDown = false;

  var oCanvas = document.getElementById("concept_canvas");
  var oCtx = oCanvas.getContext("2d");

  var origImg = document.getElementById("concept_image");
  var iWidth = origImg.width;
  var iHeight = origImg.height;

  // define canvas width and height because they are 300px and 150px, respectively, by default
  oCanvas.width = iWidth;
  oCanvas.height = iHeight;

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
    oImg.id = "concept_canvas";

    oCanvas.parentNode.replaceChild(oImg, oCanvas);

    document.getElementById("concept_image_data").value = document.getElementById("concept_canvas").src;
    document.getElementById("real_save").click();
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

  jQuery("#convert_png_button").live( "click", function() {
    convertCanvas("PNG");
  });

  jQuery("#cancel_edit").live( "click", function() {
    oCtx.clearRect(0, 0, oCanvas.width, oCanvas.height);
    oCtx.beginPath();
  });

}
