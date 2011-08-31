float bx;
float by;
int rh;
int rw;
boolean bover = false;
boolean locked = false;
float bdifx = 0.0;
float bdify = 0.0;
ArrayList node;
int num;
color c1 = color(228,88,255);
color c2 = color(0,237,177);
spacing=10;
plusRadius=12;
controlDistance=20;
Node selectedNode;
canvasClicked = false;
 
void setup(){
  size(800, 400);
  bx = width/2.0;
  by = height/2.0;
  rh=20;
  rw=40;
  num = 12;
  frameRate(24);
  nodes = new ArrayList();
  int hsize = 10;
  // parent node
  nodes.add(new Node(width/2, height/2, 40, c1, null));
  for(int i=1; i<6) {
      nodes.add(new Node(width/2+100, height/2+(i-3)*25, 60, c1, nodes.get(0)));
    } else {
      nodes.add(new Node(width/2-100, height/2+(i-8)*25, 60, c2, nodes.get(0))); 
    }
  }
}
 
void draw() {
  background(255);
  for(int i=0; i<=nodes.size()-1; i++) {
    nodes.get(i).update();
    nodes.get(i).display();
  }
}
 
// Draw the box
void drawRootNode(int bx, int by, int bs, int bs){
  strokeWeight(3);
  stroke(50,50,50);
  // Test if the cursor is over the box
  if (mouseX > bx-bs && mouseX < bx+bs &&
      mouseY > by-bs && mouseY < by+bs) {
    bover = true;
   if(!locked) {
      fill(181,213,255);
    }
  } else {
    fill(255);
      bover = false;
  }
  fill(192);
  stroke(64);
  roundRect(bx, by,80,30,10,10);
  // put in text
  if (!isRight) {
    text("Mind Map", x-size+5, y-5);
  }
  else {
    text("Mind Map", x+5, y-5);     
  }
}
 
void mouseReleased() {
  for(int i=0; i<=nodes.size()-1; i++) {
    nodes.get(i).release();
  }
}
 
void deselectAll() {
  for(int i=0; i<=nodes.size()-1; i++) {
    nodes.get(i).isSelected=false;
  }
}
 
 
class Node {
  int x, y;
  int oldX, oldY;
  int relX,relY;
  int boxx, boxy;
  int size;
  int lineWeight;
  color myColor;
  boolean isOver;
  boolean isOverPlus;
   
  boolean isPressed=false;
  boolean isPressedPlus=false;
   
  boolean locked = false;
  boolean otherslocked = false;
   
  boolean isSelected = false;
   
  boolean isEditing = false;
  boolean isRight;
  ArrayList children;
  Node parent;
  string Data;
 
  Node(int ix, int iy, int is, color icolor, Node iparent){
    x = ix;
    y = iy;
    oldX = ix;
    oldY = iy;
    relX = null;
    relY = null;
    size = is;
    myColor = icolor;
    parent = iparent;
    children = new ArrayList();
    lineWeight=5;
    if (iparent !=null) {
      if (parent.parent==null) {
        if (x>parent.x) {
          isRight=true;
        } else {
            isRight=false;
        }
      } else {
        isRight = parent.isRight;
      }
    } else {
      isRight= null;
    }
  }
 
  void update() {
    for(int i=0; i 0 || mouseY-relY > 0){
        x=mouseX-relX;
        y=mouseY-relY;
        for (int i = 0;i <= children.size()-1; i++) {
          children.get(i).move(mouseX-oldX-relX,mouseY-oldY-relY);
        }
        // see if tree needs to be flipped
        if (parent.parent == null){
        if (isRight && mouseX < width/2) {
           relX=0-relX;
          changeDirection();
         }
        if (!isRight && mouseX > width/2) {
          relX=0-relX;
          changeDirection();
        }
      }
      }
      isPressedPlus=false;
    }
    if (isPressedPlus) {
        deselectAll();
        bezierBranch(x,y, mouseX,mouseY,myColor,size);
    }
  }
 
  void changeDirection() {
    if(isRight){
      isRight=false;
      for (int i = 0;i <= children.size()-1; i++) {
        children.get(i).x = x;
        //children.get(i).oldX = width/2-(children.get(i).oldX-width/2);
        children.get(i).changeDirection();
      }
    } else {
      isRight=true;
      for (int i = 0;i <= children.size()-1; i++) {
        children.get(i).x = x;
        //children.get(i).oldX = x+2*(width/2-x);
        children.get(i).changeDirection();
      }
    }
  }
 
  void move(int deltaX, int deltaY){
    x=oldX+deltaX;
    y=oldY+deltaY;
    for (int i = 0;i <= children.size()-1; i++) {
      children.get(i).move(deltaX,deltaY);
    }
  }
 
  void over() {
    if (!isRight){
      if(overRect(x-size, y-10, size, 10)) {
        isOver = true;
        isOverPlus = false;
      } else if(overCircle(x-size-10, y-5, 10, 10)){
        isOver = false;
        isOverPlus = true;
      } else {
        isOver = false;
        isOverPlus = false;             
      }
    }
    else {
      if(overRect(x, y-10, size, 10)) {
        isOver = true;
        isOverPlus = false;
      } else if (overCircle(x+size+5, y-5, 10, 10)) {
          isOver = false;
          isOverPlus = true;
      } else {
          isOver = false;
          isOverPlus = false;             
      }
    }
  }
 
  void press() {
    if(isOver && mousePressed || locked) {
      isPressed = true;
      isPressedPlus=false;
      deselectAll();
      doSelect();
      locked = true;
    } else {
      isPressed = false;
      isPressedPlus=false;
    }
    if(isOverPlus && mousePressed || locked) {
      isPressedPlus = true;
      locked = true;
    } else {
      isPressedPlus = false;
    }
  }
 
  void doSelect() {
    isSelected=true;
    for (int i = 0;i <= children.size()-1; i++) {
      children.get(i).doSelect();
    }
  }
 
  void doEdit() {
    isEditable=true;
    drawAsEditing();
  }
 
  void release() {
    if (parent !=null) {
      locked = false;
      if (isPressedPlus) {
        newNode=new Node(mouseX,mouseY,60, myColor, this);
        children.add(newNode);
        nodes.add(newNode);
        newNode.doEdit();
      }
      isPressedPlus=false;
      oldX=x;
      oldY=y;
      relX = null;
      relY = null;
    }
  }
 
  void drawAsSelected() {
    rectMode(CORNER);
    fill(181,213,255);
    strokeWeight(1);
    stroke(181,213,255);
    if (!isRight) {
      roundRect(x-size, y-15-lineWeight/2, size, 15,5,5);
    }
    else {
      roundRect(x, y-15-lineWeight/2, size, 15, 5,5);   
    }
    drawData();
  }
 
  void drawAsEditing() {
    stroke(181,213,255);
    rectMode(CORNER);
    fill(255,255,255);
    if (!isRight) {
      rect(x-size-5, y-20-lineWeight/2, size+10, 20);
    }
    else {
      rect(x-5, y-20-lineWeight/2, size+10, 20);   
    }
    drawData();
  }
 
  void drawData() {
    fill(0,0,0);
    if (!isRight) {
      text("New Node", x-size+5, y-5);
    }
    else {
      text("New Node", x+5, y-5);
    } 
  }
 
  void drawRootNode() {
    fill(255);
    stroke(64);
    roundRect(bx-40, by-15,80,30,10,10);
    fill(0);
    stroke(0);
    text("Mind Map", x-size+5, y);
  }
 
  void bezierBranch(int x, int y, int x2, int y2, color branchColor, int mySize) {
    noFill();
    strokeWeight(3);
    stroke(branchColor);
    myDistance=controlDistance;
 
    if(!isRight) {
      bezier(x-mySize,y, x-mySize-myDistance, y, x2+controlDistance, y2, x2,y2);
      line(x2,y2, x2-size,y2);
    } else {
      bezier(x+mySize, y, x + mySize + myDistance, y, x2-controlDistance, y2, x2,y2);
      line(x2,y2, x2+size,y2);
    }
  }
 
  void display() {
    if (parent != null) {
      bezierBranch(parent.x,parent.y, x,y, myColor,parent.size);
      drawData();
      if(isOver || isPressed || isOverPlus || isPressedPlus) {
        drawPlus();
      }     
      //if(isPressed) {
      //  drawAsSelected();
      //}
      if(isSelected) {
        drawAsSelected();
      }
    } else {
        drawRootNode();
    }
  }
             
  void drawPlus () {
    strokeWeight(1);
    fill(255);
    stroke(128,128,128);
    if (!isRight) {
      ellipse(x-size-spacing,y,plusRadius,plusRadius);
      line(x-size-spacing-plusRadius/2+2, y, x-size-spacing+plusRadius/2-2, y);
      line(x-size-spacing, y-plusRadius/2+2, x-size-spacing, y+plusRadius/2-2);
    }
    else {
      ellipse(x+size+spacing,y,plusRadius,plusRadius);
      line(x+size+spacing-plusRadius/2+2, y, x+size+spacing+plusRadius/2-2, y);
      line(x+size+spacing, y-plusRadius/2+2, x+size+spacing, y+plusRadius/2-2);
    }
  }
}
 
boolean overRect(int x, int y, int width, int height) {
  if (mouseX >= x && mouseX <= x+width &&
      mouseY <= y+height && mouseY >= y-height) {
    return true;
  } else {
    return false;
  }
}
 
boolean overCircle(int x, int y, int width, int height) {
  if (mouseX >= x && mouseX <= x+width &&
      mouseY <= y+height && mouseY >= y-height) {
    return true;
  } else {
    return false;
  }
}
 
int lock(int val, int minv, int maxv) {
  return  min(max(val, minv), maxv);
}
 
void roundRect(float x, float y, float w, float h, float xr, float yr) {
  arc(x+w-xr, y+yr, 2*xr, 2*yr, TWO_PI-PI/2, TWO_PI);
  arc(x+w-xr, y+h-yr, 2*xr, 2*yr, 0,PI/2);
  arc(x+xr, y+h-yr, 2*xr, 2*yr, PI/2, PI);
  arc(x+xr, y+yr, 2*xr, 2*yr, PI, TWO_PI-PI/2);
  line(x+xr,y,x+w-xr,y);
  line(x+xr,y+h,x+w-xr,y+h);
  line(x,y+yr,x,y+h-2*yr);
  line(x+w,y+yr,x+w,y+h-2*yr);
  noStroke();
  rect(x+xr, y, w-2*xr, h);
  rect(x,y+yr,xr,h-2*yr);
  rect(x+w-xr,y+yr,xr,h-2*yr);
}