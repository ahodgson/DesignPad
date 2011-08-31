function SVGRenderer() 
{
	this.svgRoot = null;
}

SVGRenderer.svgNamespace = 'http://www.w3.org/2000/svg';

SVGRenderer.prototype.init = function(elem) 
{
	  this.container = elem;

	  this.container.style.MozUserSelect = 'none';

	  var container_all = document.getElementsByTagName("svg");
	 
		if (container_all.length !=0)
		{

			this.svgRoot = container_all[0];
		}	    
		else
		{
		   this.svgRoot = this.container.ownerDocument.createElementNS(SVGRenderer.svgNamespace, "svg");
		   
		   this.svgRoot.style.position = 'absolute';
		  
		   this.container.appendChild(this.svgRoot);
		}

	  

}


SVGRenderer.prototype.addArrowColor = function(color)
	{
		var elem = this.container.ownerDocument.getElementById(color);

		if(elem)
			{
				return;
			}

		var defs = this.container.ownerDocument.createElementNS(SVGRenderer.svgNamespace, "defs");
		this.svgRoot.appendChild(defs);
		var marker = this.container.ownerDocument.createElementNS(SVGRenderer.svgNamespace, "marker");
	
		marker.setAttributeNS(null, 'id', color);
		marker.setAttributeNS(null, 'viewBox', '0 0 30 30');
		marker.setAttributeNS(null, 'refX', 0);
		marker.setAttributeNS(null, 'refY', "15px");
		marker.setAttributeNS(null, 'markerUnits', 'strokeWidth');
		marker.setAttributeNS(null, 'markerWidth', "9px");
		marker.setAttributeNS(null, 'markerHeight', "30px");
		marker.setAttributeNS(null, 'orient',"auto");

		defs.appendChild(marker);

		var path = this.container.ownerDocument.createElementNS(SVGRenderer.svgNamespace, "path");
		path.setAttributeNS(null, 'd',"M 0 0 L 30 15 L 0 30 Z");
		path.setAttributeNS(null, 'fill',color);
		path.setAttributeNS(null, 'stroke',color);
		path.setAttributeNS(null, 'stroke-width',"1px");
		marker.appendChild(path);
	}



SVGRenderer.prototype.drawArrow = function(left, top, left1, top1,color)
{
		top +=9;

		this.addArrowColor(color);
		var svg;	
		svg = this.container.ownerDocument.createElementNS(SVGRenderer.svgNamespace, 'line');

		svg.style.position = 'absolute';

		svg.setAttributeNS(null, 'x1', left + "px");
		svg.setAttributeNS(null, 'y1', top + "px");
		svg.setAttributeNS(null, 'x2', left1 + "px");
		svg.setAttributeNS(null, 'y2', top1 + "px");

		svg.setAttributeNS(null, 'stroke', color);
		svg.setAttributeNS(null, 'stroke-width', "1px");
		svg.setAttributeNS(null, 'fill', color);
		svg.setAttributeNS(null, 'marker-end', "url(#"+color+")");
		this.svgRoot.appendChild(svg);

		return svg;  

	}


SVGRenderer.prototype.remove = function(shape) 
	{
		shape.parentNode.removeChild(shape);
	}


SVGRenderer.prototype.move = function(shape, left, top) 
	{
		if (shape.tagName == 'line') 
			{
				var deltaX = shape.getBBox().width;
				var deltaY = shape.getBBox().height;
				shape.style.position = 'absolute';
				shape.setAttributeNS(null, 'x1', left);
				shape.setAttributeNS(null, 'y1', top);
				shape.setAttributeNS(null, 'x2', left + deltaX);
				shape.setAttributeNS(null, 'y2', top + deltaY);
			}
	}



function VMLRenderer() 
	{
	
	}


VMLRenderer.prototype.init = function(elem) 
	{
	  this.container = elem;
	  
	  this.container.style.overflow = 'hidden';
	  
		// Add VML includes and namespace
	  elem.ownerDocument.namespaces.add("v", "urn:schemas-microsoft-com:vml");

		var style = elem.ownerDocument.createStyleSheet();
		style.addRule('v\\:*', "behavior: url(#default#VML);");
	}



VMLRenderer.prototype.drawArrow = function(left,top,left1,top1,color)
	{
		var line = this.container.ownerDocument.createElement('v:line');

		line.style.position = 'absolute';
		line.setAttribute('from', left + 'px,' + top + 'px');
		line.setAttribute('to', left1 + 'px,' + top1 + 'px');
		line.setAttribute('strokecolor',color);

		var arrow = this.container.ownerDocument.createElement('v:stroke');
		arrow.setAttribute('Endarrow', "Classic");
		line.appendChild(arrow);    
		this.container.appendChild(line);

	return line; 
}
VMLRenderer.prototype.remove = function(shape) 
	{
		shape.removeNode(true);
	}


VMLRenderer.prototype.move = function(shape, left, top) 
	{
		  if (shape.tagName == 'line') 
			{
				shape.style.marginLeft = left;
				shape.style.marginTop = top;
			}
		 else 
			{
				shape.style.left = left;
				shape.style.top = top;
			}
	}




VMLRenderer.prototype.resize = function(shape, fromX, fromY, toX, toY) 
	{
	  var deltaX = toX - fromX;
	  var deltaY = toY - fromY;

  if (shape.tagName == 'line') 
	  {
			shape.setAttribute('to', toX + 'px,' + toY + 'px');
	   }
  else 
	  {
			if (deltaX < 0)
			{
			   shape.style.left = toX + 'px';
			   shape.style.width = -deltaX + 'px';
			}
			else 
			{
				shape.style.width = deltaX + 'px';
			}
  
			if (deltaY < 0) 
			{
				  shape.style.top = toY + 'px';
				  shape.style.height = -deltaY + 'px';
			}
			else 
			{
				shape.style.height = deltaY + 'px';
			}
	}
}

function FlowGraphic(elem)
{
		if(!elem)
			{
				elem = document.body;
			}
		ie = navigator.appVersion.match(/MSIE (\d\.\d)/);
		opera = (navigator.userAgent.toLowerCase().indexOf("opera") != -1);

		if ((!ie) || (opera)) 
			{
				this.render = new SVGRenderer();
			}
		else 
			{
				this.render = new VMLRenderer();
			}
	  this.render.init(elem);	
	  this.container = elem;
	  
}

FlowGraphic.prototype.drawArrow = function(x1,y1,x2,y2,color)
	{
		color = color||"black";
		return this.render.drawArrow(x1,y1,x2,y2,color);
	}
FlowGraphic.prototype.drawExceptionLine = function(x1,y1,x2,y2)
	{
		return this.drawArrow(x1,y1,x2,y2,"red");
	}
FlowGraphic.prototype.drawLine = function(x1,y1,x2,y2)
	{
		return this.drawArrow(x1,y1,x2,y2);
	}