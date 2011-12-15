/*
 * JavaScript to render a JIT SpaceTree for the project tree
 *
 * Author: Nicolas Garcia Belmonte
 * Co-Author: Carrie Lai
 */


/*
 * Notes
 *
 * "ID" refers to the ID of the object in the database; "JSON ID" refers to the ID of the object rendered in JSON, which is specified in its corresponding Rails controller. Essentially, the JSON ID is the ID plus an ending substring consisting of an underscore and 3 characters describing the object's resource. A JSON ID is necessary because each node rendered by JIT must have a unique node ID (which is not possible with a simple database ID). Hence, a JSON ID is equivalent to a "node ID".
 */


/*
 * Global Variables
 */

// the SpaceTree instance
var st;
// global variables for the "undo" and "redo" functions: the last CRUD action ("create", "update", or "delete"); the last node; the last node's parent node; the node's original name; the name the user entered for the created node
var lastAction, lastNode, lastParentNode, lastName, newName;
// whether or not a node is currently in editing mode, for editing a node's name
var inEditing = false;
// the last action and last node used in an undo
var undoneAction = null, undoneNode = null;
// whether or not the redo action can be done (i.e. the last done action was undo, not redo)
var canRedo = false;
// whether or not the Ctrl key is pressed down
var ctrlDown = false;
// whether or not the Shift key is pressed down
var shiftDown = false;
// the max length of each node's name (specified in the models)
var NAME_MAX_LENGTH = 100;

var labelType, useGradients, nativeTextSupport, animate;


/*
 * Functions
 *
 * Split into the following categories:
 *
 * PROJECT TREE AREA UPDATING
   - for the projects/edit page
   - updates project tree area as SpaceTree updates
 * LINK CLICK HANDLER
   - for the fullscreen FSD (function_structure_diagrams/show) page
   - uses ACTIONS ON CLICKED NODE
 * KEY PRESS HANDLER
   - uses ACTIONS ON CLICKED NODE
 * ACTIONS ON CLICKED NODE
   - uses REST FUNCTIONS
 * REST FUNCTIONS
 * HELPER FUNCTIONS FOR REST AND SPACETREE
 * SPACETREE
 */

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

/* PROJECT TREE AREA UPDATING */

// "when_list_title_clicked" click handler for list titles added by the SpaceTree to the project tree area - using a "new_list_title" class to prevent conflict with Prototype
jQuery(".new_list_title").live( "click", function() {
  // the node's list_title dom ID in the project tree area
  var id_full = jQuery(this).attr("id");

  // the numeric and resource part of the dom ID; gets by removing the last 11 characters ("_list_title") of the dom ID to take only these two significant parts
  var id_significant = id_full.slice(0,-11);
  // the resource part of the dom ID - returned in an array where each word of the resource (split by "_" in the dom ID) is a value
  var id_resource = id_significant.match(/[a-z]+/g);
  // the node's resource (pluralized form of id_resource)
  var resource;
  if( id_resource.length > 1 ) {  // if more than one value in the array (for function_structure_diagram and concept_category)
    // joins words (array values) into a string with an underscore between them
    id_resource = id_resource.join("_");

    // pluralizes the resource; note concept_category in plural ends in "ies" instead of "s"
    if( id_resource === "concept_category" ) {
      resource = id_resource.slice(0,-1) + "ies";
    }
    else {
      resource = id_resource + "s";
    }
  }
  else {  // for (function and concept)
    // takes the only value in the array
    id_resource = id_resource[0];

    // pluralizes the resource
    resource = id_resource + "s";
  }

  // the numeric part of the dom ID, which is the node's database ID - returned in an array [as the only value with key 0]
  var id_numeric = id_full.match(/[0-9]+/g);

  // call on when_list_title_clicked function
  jQuery.ajax( {
    type: "POST",
    url: "/"+resource+"/when_list_title_clicked?"+id_resource+"_id="+id_numeric[0]
  });

  // de-select all list titles in the project tree area
  jQuery(".list_title").removeClass("selected_list_title");
  // select clicked list title in the project tree area
  jQuery(this).addClass("selected_list_title");
});

// "toggleList" click handler for expansion images added by the SpaceTree to the project tree area - using a "new_expansion_img" class to prevent conflict with Prototype
jQuery(".new_expansion_img").live( "click", function() {
  // the node's parent's parent's li dom ID in the project tree area
  var id_full = jQuery(this).parent().parent().attr("id");

  // the numeric part of the dom ID, which is the node's database ID - returned in an array [as the only value with key 0]
  var id_numeric = id_full.match(/[0-9]+/g);

  // the resource part of the dom ID, which is the node's database ID - returned in an array [as the only value with key 0]
  var id_resource = id_full.match(/[a-z_]+/g);

  // toggle the expansion (function in application.js)
  toggleList( id_numeric[0] + id_resource[0] );
});

/* LINK CLICK HANDLER */

jQuery("#create_child").live( "click", function() {
  create_child();
});
jQuery("#create_sibling").live( "click", function() {
  // only allow adding of a node if another node is not in editing mode
  if( !inEditing ) {
    create_sibling();
  }
});
jQuery("#update_name").live( "click", function() {
  update_name();
});
jQuery("#delete_node").live( "click", function() {
  delete_node();
});
jQuery("#undo_action").live( "click", function() {
  undoLastAction();
});
jQuery("#redo_action").live( "click", function() {
  redoLastAction();
});
jQuery("#collapse_node").live( "click", function() {
  collapse_node();
});
jQuery("#expand_node").live( "click", function() {
  expand_node();
});

/* KEY PRESS HANDLER */

// handles key presses
jQuery(document).keydown( function( event ) {
  if( window.event ) {  // for IE compatibility
    var keyCode = window.event.keyCode;
  }
  else {
    var keyCode = event.which;
  }
  switch( keyCode ) {

    // adding child node with Tab or Insert
    case 9: // Tab key
    case 45:  // Insert key
      // prevent default action of the event from happening (i.e. prevent Tab from moving focus)
      event.preventDefault();
      create_child();
      break;

    // adding sibling node with Enter, or updating entered node name
    case 13: // Enter key
      // adding sibling node with Enter
      // only allow adding of a node if another node is not in editing mode
      if( !inEditing ) {
        create_sibling();
      }
      // updating entered node name
      else {
        // updates the current (last clicked) node's name
        updateNode( st.clickedNode, jQuery("input").val() );
      }
      break;

    // enabling editing node name with F2
    case 113: // F2 key
      update_name();
      break;

    // deleting node (and its children if it has them) with Backspace or Delete
    case 8: // Backspace key
    case 46:  // Delete key
      // only allow deleting of a node if another node is not in editing mode
      if( !inEditing ) {
        // prevent default action of the event from happening only if a node is not in editing mode (i.e. prevent Backspace from going back a page when a node's not in editing mode, but still allow Backspace and Delete when typing new node name in its editing mode since it's an input field)
        event.preventDefault();
        delete_node();
      }
      break;

    // navigating left, to parent node, with Arrow Left
    case 37:  // Arrow Left key
      // only allow navigation if a node's not in editing mode
      if( !inEditing ) {
        // prevent default action of the event from happening only if a node is not in editing mode (i.e. prevent scrolling the page left, but still allow Arrow Left when typing new node name in its editing mode since it's an input field)
        event.preventDefault();

        if( st.clickedNode.id !== st.root ) { // if it's not the root node
          // the current (last clicked) node's parent's JSON ID
          var parent_JSONid = getParentNode( st.clickedNode ).id;

          // selects parent
          st.onClick( parent_JSONid );
        }
      }
      break;

    // navigating right, to first child node, with Arrow Right
    case 39:  // Arrow Right key
      // only allow navigation if a node's not in editing mode
      if( !inEditing ) {
        // prevent default action of the event from happening only if a node is not in editing mode (i.e. prevent scrolling the page right, but still allow Arrow Right when typing new node name in its editing mode since it's an input field)
        event.preventDefault();

        if( st.clickedNode.anySubnode("exist") ) {  // if it has any children
          // expand node if it's collapsed
          if( st.clickedNode.collapsed ) {  // if the node is collapsed
            customExpand( st.clickedNode );
          }

          // selects first child
          st.onClick( st.clickedNode.getSubnodes()[1].id );
        }
      }
      break;

    // navigating up depth with Arrow Up
    case 38:  // Arrow Up key
      // only allow navigation if a node's not in editing mode
      if( !inEditing ) {
        // prevent default action of the event from happening only if a node is not in editing mode (i.e. prevent scrolling the page up, but still allow Arrow Up when typing new node name in its editing mode since it's an input field)
        event.preventDefault();

        if( st.clickedNode.id !== st.root ) { // if it's not the root node
          // the current (last clicked) node's parent
          var parentNode = getParentNode( st.clickedNode );

          // stores current (last clicked) node's parent's direct children nodes into an array
          var directChildren = new Array();
          parentNode.eachSubnode( function( n ) {
            directChildren.push( n );
          });

          // iterates through current (last clicked) node's parent's direct children
          jQuery.each( directChildren, function( i, v ) {
            if( v.id === st.clickedNode.id ) {  // if the child's node ID matches the current (last clicked) node's node ID
              if( i > 0 ) { // ensure the child isn't the first one (i is 0-based indexing)
                // selects the current (last clicked) node's previous sibling, which is its parent's (i-1)-th child (current node is (i)-th child)
                st.onClick( directChildren[i-1].id );
                return; // break out of each() loop early
              }
              else {
                // don't do anything if it's already the first child
                return; // break out of each() loop early
              }
            }
          });
        }
      }
      break;

    // navigating down depth with Arrow Down
    case 40:  // Arrow Down key
      // only allow navigation if a node's not in editing mode
      if( !inEditing ) {
        // prevent default action of the event from happening only if a node is not in editing mode (i.e. prevent scrolling the page down, but still allow Arrow Down when typing new node name in its editing mode since it's an input field)
        event.preventDefault();

        if( st.clickedNode.id !== st.root ) { // if it's not the root node
          // the current (last clicked) node's parent
          var parentNode = getParentNode( st.clickedNode );

          // counts current (last clicked) node's parent's direct children nodes (count is 1-based "indexing"), and stores the direct children nodes into an array
          var count = 0;
          var directChildren = new Array();
          parentNode.eachSubnode( function( n ) {
            count++;
            directChildren.push( n );
          });
          // whether or not the child node is the next sibling; needed because directChildren[i+1] is not truly defined
          var isNextSibling = false;

          // iterates through current (last clicked) node's parent's direct children
          jQuery.each( directChildren, function( i, v ) {
            if( v.id === st.clickedNode.id ) {  // if the child's node ID matches the current (last clicked) node's node ID
              if( i < count ) { // ensure the child isn't the last one (i is 0-based indexing)
                isNextSibling = true;
                return true;  // return true to skip to next iteration
              }
              else {
                // don't do anything if it's already the last child
                return; // break out of each() loop early
              }
            }
            if( isNextSibling ) { // if the child node is the next sibling
              // selects the current (last clicked) node's next sibling
              st.onClick( directChildren[i].id );
              return; // break out of each() loop early
            }
          });
        }
      }
      break;

    // ensuring the Ctrl key is down with the Z or Y keys to allow undo or redo
    case 17:  // Ctrl key
      ctrlDown = true;
      break;

    // undoing last action
    case 90:  // Z key
      // only allow undoing if the Ctrl key is down
      if( ctrlDown ) {
        undoLastAction();
      }
      break;

    // redoing last action
    case 89:  // Y key
      // only allow redoing if the Ctrl key is down
      if( ctrlDown ) {
        redoLastAction();
      }
      break;

    // ensuring the Shift key is down with the Equal key to allow expand
    case 16:  // Shift key
      shiftDown = true;
      break;

    // collapsing node
    case 109: // Subtract key
    case 189: // Minus key
      collapse_node();
      break;

    // expanding node
    case 107: // Add key
      expand_node();
      break;
    case 187: // Equal key
      // only allow expanding with the Equal key if the Shift key is down
      if( shiftDown ) {
        expand_node();
      }
      break;

  }
}).keyup( function( event ) {
  if( window.event ) {  // for IE compatibility
    var keyCode = window.event.keyCode;
  }
  else {
    var keyCode = event.which;
  }
  switch( keyCode ) {

    // ensuring the Ctrl key is down with the Z or Y keys to allow undo or redo - when the Ctrl key is released, then the Ctrl key isn't down anymore
    case 17:  // Ctrl key
      ctrlDown = false;
      break;

    // ensuring the Shift key is down with the Equal key to allow expand - when the Shift key is released, then the Shift key isn't down anymore
    case 16:  // Shift key
      shiftDown = false;
      break;

  }
});

/* ACTIONS ON CLICKED NODE: for links and key presses */

// adding child node
function create_child() {
  // only allow adding of a node if another node is not in editing mode
  if( !inEditing ) {
    if( st.clickedNode.anySubnode("exist") ) {  // if it has any children
      // expand node if it's collapsed
      if( st.clickedNode.collapsed ) {  // if the node is collapsed
        customExpand( st.clickedNode );
      }
    }

    // creates child node to the current (last clicked) node
    createChildNode( st.clickedNode );
  }
}

// adding sibling node
function create_sibling() {
  // only allow the sibling node to be added if the current (last clicked) node is not a FSD node
  if( (st.clickedNode.id !== st.root) && (st.clickedNode._depth % 4 !== 0) ) {  // if the node is not at node depth 0 (root), 4, and 8, etc.
    // creates sibling node to the current (last clicked) node
    createSiblingNode( st.clickedNode );
  }
  // warns the user that s/he cannot add another base FSD node
  else {
    alert( "You may only have one base function structure diagram!" );
  }
}

// enabling editing node name
function update_name() {
  // only allow editing of a node if it's not already in editing mode
  if( !inEditing ) {
    enableUpdateNode( st.clickedNode );
  }
}

// deleting node (and its children if it has them)
function delete_node() {
  // only allow deleting of a node if another node is not in editing mode
  if( !inEditing ) {
    // only allow the current (last clicked) node (and its children if it has them) to be deleted if it's not the base FSD node, which is the root node
    if( st.clickedNode.id !== st.root ) {
      if( st.clickedNode.anySubnode("exist") ) {  // if the current (last clicked) node has any children (Note: Not soft-deleting children because they won't be rendered in the tree without a parent in it)
        if( confirm("Are you sure you would like to delete \""+st.clickedNode.name+"\" and its sub-node(s)?") ) { // confirms if the user wants to delete the current (last clicked) node
          // soft-deletes the current (last clicked) node
          deleteNode( st.clickedNode, "soft" );
        }
      }
      else {
        // soft-deletes the current (last clicked) node
        deleteNode( st.clickedNode, "soft" );
      }
    }
    // warns the user that s/he cannot delete the base FSD node
    else {
      alert( "You may not delete the base function structure diagram!" );
    }
  }
}

// see undoLastAction() for undoing last action

// see redoLastAction() for redoing last action

// collapsing node
function collapse_node() {
  // only allow collapsing if a node's not in editing mode
  if( !inEditing ) {
    if( !st.clickedNode.collapsed ) {
      st.op.contract( st.clickedNode ); // collapse it; node is set to collapsed
      st.onClick( st.clickedNode.id );
    }
  }
}

// expanding node
function expand_node() {
  // only allow expanding if a node's not in editing mode
  if( !inEditing ) {
    if( st.clickedNode.collapsed ) {
      customExpand( st.clickedNode );
      st.onClick( st.clickedNode.id );
    }
  }
}

/* REST FUNCTIONS */

// REST: creates child node in the database and, on success, in the SpaceTree
function createChildNode( node, doing ) {
  if( doing !== "undo" ) {  // if the child node is not created in an undo
    // only allow an FSD to be added to the SpaceTree if the node is a Concept without a child nocde (i.e. without an FSD node)
    if( !( (node._depth % 4 === 3) && (node.anySubnode("exist")) ) ) {  // if the node is not the following: at node depth 3, 7, or 11, etc. and has any children

      // the node's child's resource
      var child_resource = getNodeInfo( node, "child resource" );
      // the created node's name
      var newNodeName;
      if( doing !== "redo" ) {  // if the child node is not created in a redo
        // the node's child's resource name
        newNodeName = "New " + getNodeInfo( node, "child resource name" );
      }
      else {
        // the name the user entered for the created node before undoing and then redoing
        newNodeName = newName;
      }
      // the data to be set when creating a child node to the node; since the resource key cannot be a variable because it's taken literally, the entire AJAX data is set; set created node's name
      var postData = getNodeInfo( node, "post child data", newNodeName );

      // creates child node (FSD) for a Concept, but actually updates its name instead of creating a new FSD (because a FSD is automatically created with a Concept, but it isn't rendered in the SpaceTree if it doesn't have a name); for other nodes, its appropriate child is created in the SpaceTree and database
      if( node._depth % 4 === 3 ) {  // if the node is at node depth 3, 7, or 11, etc.
        // the node's resource
        var resource = getNodeInfo( node, "resource" );
        // the node's database ID; gets by removing the last 4 characters ("_[resource]") of its JSON ID to take only the numeric part
        var resource_id = node.id.slice(0,-4);

        // gets node's data - i.e. its FSD ID
        jQuery.ajax( {
          type: "GET",
          url: "/"+resource+"/"+resource_id+".json",  // need JSON to retrieve node's data - i.e. its ID and name
          success: function( conceptNodeJSON ) {

            // the node's child's JSON ID
            var child_JSONid = conceptNodeJSON.fsd_id;
            // the node's child's database ID; gets by removing the last 4 characters ("_[resource]") of its JSON ID to take only the numeric part
            var child_id = child_JSONid.slice(0,-4);

            // updates name in database
            jQuery.ajax( {
              type: "PUT",
              url: "/"+child_resource+"/"+child_id,
              data: postData,
              success: function() {

                // the new child node that's added
                var newNode = {
                  id: node.id, // parent of new node (i.e. node being added to)
                  children: [{
                    id: child_JSONid,
                    name: newNodeName,
                    data: {},
                    children: []
                  }]
                };
                // adds a child node to the node
                st.addSubtree( newNode, "replot", {
                  hideLabels: false
                });

                // the current node's dom name in the project tree area
                var resource_dom = getNodeInfo( node, "resource dom" );
                // the child's dom name in the project tree area
                var child_dom = getNodeInfo( node, "child resource dom" );
                // updates project tree area with added node
                jQuery("#"+resource_id+"_"+resource_dom+"_ul").append("<li class='"+child_dom+"_li' id='"+child_id+"_"+child_dom+"_li'>  <span class='expansion_mark' id='"+child_id+"_"+child_dom+"_expansion_mark'></span>  <span class='"+child_dom+"_icon icon' id='"+child_id+"_"+child_dom+"_icon'><img src='/images/"+child_dom+".jpg'></span>  <span class='"+child_dom+"_list_title list_title new_list_title' id='"+child_id+"_"+child_dom+"_list_title'>"+newNodeName+"</span>  <a style='display:none'>"+newNodeName+"</a>  <ul class='"+child_dom+"_ul' id='"+child_id+"_"+child_dom+"_ul'></ul>  </li>");

                // if the current node is new and doesn't have an expansion image because it's children-less until now, add an expansion image
                if( jQuery("#"+resource_id+"_"+resource_dom+"_ul").prevAll("#"+resource_id+"_"+resource_dom+"_expansion_mark").children().length === 0 ) {  // if no expansion image
                  jQuery("#"+resource_id+"_"+resource_dom+"_expansion_mark").append("<img src='/images/expanded.gif' class='new_expansion_img'>");
                }

                // selects the new node (highlights and centers the tree), as if it were clicked
                st.onClick( child_JSONid );

                if( doing !== "redo" ) {  // if the child node is not created in a redo; no need to enable editing if redo
                  // changes text to an input field with a value of the node's name
                  jQuery("#"+child_JSONid).html('<input type="text" value="'+newNodeName+'" maxlength="'+NAME_MAX_LENGTH+'" size="9" style="background-color:transparent; outline: none; border: none;" />');
                  // highlights text in input field
                  jQuery("input").select();

                  // node is now in editing mode
                  inEditing = true;
                }

                // variables needed to undo the creation of this child node
                lastAction = "create";
                lastNode = st.graph.getNode( child_JSONid );
                lastParentNode = node;

              }
            });

          }
        });
      }

      else {
        // creates entry in database
        jQuery.ajax( {
          type: "POST",
          url: "/"+child_resource+".json",  // need JSON to retrieve created node's data - i.e. its ID
          data: postData,
          success: function( newNodeJSON ) {

            // the new child node that's added
            var newNode = {
              id: node.id, // parent of new node (i.e. node being added to)
              children: [{
                id: newNodeJSON.id,
                name: newNodeName,
                data: {},
                children: []
              }]
            };
            // adds a child node to the node
            st.addSubtree( newNode, "replot", {
              hideLabels: false
            });

            // the current node's database ID; gets by removing the last 4 characters ("_[resource]") of its JSON ID to take only the numeric part
            var resource_id = node.id.slice(0,-4);
            // the current node's dom name in the project tree area
            var resource_dom = getNodeInfo( node, "resource dom" );
            // the child's dom name in the project tree area
            var child_dom = getNodeInfo( node, "child resource dom" );
            // the child's database ID; gets by removing the last 4 characters ("_[resource]") of its JSON ID to take only the numeric part
            var child_id = newNodeJSON.id.slice(0,-4);
            // updates project tree area with added node
            jQuery("#"+resource_id+"_"+resource_dom+"_ul").append("<li class='"+child_dom+"_li' id='"+child_id+"_"+child_dom+"_li'>  <span class='expansion_mark' id='"+child_id+"_"+child_dom+"_expansion_mark'></span>  <span class='"+child_dom+"_icon icon' id='"+child_id+"_"+child_dom+"_icon'><img src='/images/"+child_dom+".jpg'></span>  <span class='"+child_dom+"_list_title list_title new_list_title' id='"+child_id+"_"+child_dom+"_list_title'>"+newNodeName+"</span>  <a style='display:none'>"+newNodeName+"</a>  <ul class='"+child_dom+"_ul' id='"+child_id+"_"+child_dom+"_ul'></ul>  </li>");

            // if the current node is new and doesn't have an expansion image because it's children-less until now, add an expansion image
            if( jQuery("#"+resource_id+"_"+resource_dom+"_ul").prevAll("#"+resource_id+"_"+resource_dom+"_expansion_mark").children().length === 0 ) {  // if no expansion image
              jQuery("#"+resource_id+"_"+resource_dom+"_expansion_mark").append("<img src='/images/expanded.gif' class='new_expansion_img'>");
            }

            // selects the new node (highlights and centers the tree), as if it were clicked
            st.onClick( newNodeJSON.id );

            if( doing !== "redo" ) {  // if the child node is not created in a redo; no need to enable editing if redo
              // changes text to an input field with a value of the node's name
              jQuery("#"+newNodeJSON.id).html('<input type="text" value="'+newNodeName+'" maxlength="'+NAME_MAX_LENGTH+'" size="9" style="background-color:transparent; outline: none; border: none;" />');
              // highlights text in input field
              jQuery("input").select();

              // node is now in editing mode
              inEditing = true;
            }

            // variables needed to undo the creation of this child node
            lastAction = "create";
            lastNode = st.graph.getNode( newNodeJSON.id );
            lastParentNode = node;

          }
        });
      }

    }
    else {
      alert( "You may only have one base function structure diagram!" );
    }
  }

  // undoing a soft-delete: not actually creating a new child node; just restoring
  else {
    // the deleted node's resource
    var resource = getNodeInfo( lastNode, "resource" );
    // the deleted node's database ID; gets by removing the last 4 characters ("_[resource]") of its JSON ID to take only the numeric part
    var resource_id = lastNode.id.slice(0,-4);
    // the data to be set when updating the deleted node; since the resource key cannot be a variable because it's taken literally, the entire data is set; set "deleted" to false
    var undoDeleteData = getNodeInfo( lastNode, "delete data", false );

    // un-soft-deletes node in database by setting the "deleted" column in the resource's table to false
    jQuery.ajax( {
      type: "PUT",
      url: "/"+resource+"/"+resource_id,
      data: undoDeleteData,
      success: function() {

        // can't simply add the node back with JIT's addSubtree method; because it will get added to the bottom of its original level, not its original position in the level
        // also can't remove the deleted node's parent's children with JIT's removeSubtree method and then add them all back right after with JIT's addSubtree method; because if you click another node and then undo the delete, the function breaks and none of the parent's children get rendered.
        // last solution: reload the entire SpaceTree

        // the root node
        var rootNode = st.graph.getNode( st.root );
        // the root node's resource
        var rootResource = getNodeInfo( rootNode, "resource" );
        // the root node's database ID
        var rootResource_id = st.root.slice(0,-4);

        // gets root node's whole data
        jQuery.ajax( {
          type: "GET",
          url: "/"+rootResource+"/"+rootResource_id+".json",  // need JSON to retrieve restored node's parent's data - i.e. its children
          success: function( treeJSON ) {

            //load json data
            st.loadJSON(treeJSON);
            //compute node positions and layout
            st.compute();

            // the node's dom name in the project tree area
            var resource_dom = getNodeInfo( lastNode, "resource dom" );
            // updates project tree area with restored node(s) - shows (un-hides) them
            jQuery("#"+resource_id+"_"+resource_dom+"_li").show();

            // selects the restored node
            st.onClick( lastNode.id );

          }
        });

      }
    });
  }
};

// REST: creates sibling node in the database and, on success, in the SpaceTree
function createSiblingNode( node ) {
  // the node's parent's JSON ID
  var parent_JSONid = getParentNode( node ).id;
  // the node's sibling's resource, which is the same as the node's
  var sibling_resource = getNodeInfo( node, "resource" );
  // the data to be set when creating a sibling node to the node; since the resource key cannot be a variable because it's taken literally, the entire AJAX data is set; set parent ID
  var postData = getNodeInfo( node, "post sibling data", parent_JSONid.slice(0,-4) );

  // creates entry in database
  jQuery.ajax( {
    type: "POST",
    url: "/"+sibling_resource+".json",  // need JSON to retrieve created node's data - i.e. its ID
    data: postData,
    success: function( newNodeJSON ) {

      // the node's sibling's resource name, which is the same as the node's
      var newNodeName = "New " + getNodeInfo( node, "resource name" );

      // the new child node that's added
      var newNode = {
        id: parent_JSONid, // parent of new node (i.e. node being added to)
        children: [{
          id: newNodeJSON.id,
          name: newNodeName,
          data: {},
          children: []
        }]
      };
      // adds a child node to the node's parent
      st.addSubtree( newNode, "replot", {
        hideLabels: false
      });

      // the current node's parent's database ID; gets by removing the last 4 characters ("_[resource]") of its JSON ID to take only the numeric part
      var parent_id = parent_JSONid.slice(0,-4);
      // the current node's parent's dom name in the project tree area
      var parent_dom = getNodeInfo( getParentNode( node ), "resource dom" );
      // the sibling's dom name in the project tree area, which is the same as the node's
      var sibling_dom = getNodeInfo( node, "resource dom" );
      // the sibling's database ID; gets by removing the last 4 characters ("_[resource]") of its JSON ID to take only the numeric part
      var sibling_id = newNodeJSON.id.slice(0,-4);
      // updates project tree area with added node
      jQuery("#"+parent_id+"_"+parent_dom+"_ul").append("<li class='"+sibling_dom+"_li' id='"+sibling_id+"_"+sibling_dom+"_li'>  <span class='expansion_mark' id='"+sibling_id+"_"+sibling_dom+"_expansion_mark'></span>  <span class='"+sibling_dom+"_icon icon' id='"+sibling_id+"_"+sibling_dom+"_icon'><img src='/images/"+sibling_dom+".jpg'></span>  <span class='"+sibling_dom+"_list_title list_title new_list_title' id='"+sibling_id+"_"+sibling_dom+"_list_title'>"+newNodeName+"</span>  <a style='display:none'>"+newNodeName+"</a>  <ul class='"+sibling_dom+"_ul' id='"+sibling_id+"_"+sibling_dom+"_ul'></ul>  </li>");

      // selects the new node (highlights and centers the tree), as if it were clicked
      st.onClick( newNodeJSON.id );

      // changes text to an input field with a value of the node's current name
      jQuery("#"+newNodeJSON.id).html('<input type="text" value="'+newNodeName+'" maxlength="'+NAME_MAX_LENGTH+'" size="9" style="background-color:transparent; outline: none; border: none;" />');
      // highlights text in input field
      jQuery("input").select();

      // node is now in editing mode
      inEditing = true;

      // variables needed to undo the creation of this sibling node
      lastAction = "create";
      lastNode = st.graph.getNode( newNodeJSON.id );
      lastParentNode = getParentNode( node );

    }
  });
};

// enables updating node name: creates an input field for the user to enter the desired name
function enableUpdateNode( node ) {
  // the node's resource
  var resource = getNodeInfo( node, "resource" );
  // the node's database ID; gets by removing the last 4 characters ("_[resource]") of its JSON ID to take only the numeric part
  var resource_id = node.id.slice(0,-4);

  // gets node's data - i.e. its ID and name
  jQuery.ajax( {
    type: "GET",
    url: "/"+resource+"/"+resource_id+".json",  // need JSON to retrieve node's data - i.e. its ID and name
    success: function( currNodeJSON ) {

      // changes text to an input field with a value of the node's current name - need to get it from database because names aren't actually saved in the SpaceTree ("text" just replaces it)
      jQuery("#"+currNodeJSON.id).html('<input type="text" value="'+currNodeJSON.name+'" maxlength="'+NAME_MAX_LENGTH+'" size="9" style="background-color:transparent; outline: none; border: none;" />');
      // highlights text in input field
      jQuery("input").select();

      // node is now in editing mode
      inEditing = true;

      // variables needed to undo the renaming of this node; set here instead of in the "updateNode" function because all the needed information is here (i.e. the node's retrieved data) and also because "updateNode" is called when a user enters a name after node creation
      lastAction = "update";
      lastNode = node;
      lastName = currNodeJSON.name;

    }
  });
}

// REST: updates node name in the database and, on success, in the SpaceTree
function updateNode( node, nodeName, doing ) {
  // the node's resource
  var resource = getNodeInfo( node, "resource" );
  // the node's database ID; gets by removing the last 4 characters ("_[resource]") of its JSON ID to take only the numeric part
  var resource_id = node.id.slice(0,-4);
  // the data to be set when updating the node; since the resource key cannot be a variable because it's taken literally, the entire AJAX data is set; set new node name
  var putData = getNodeInfo( node, "put data", nodeName );

  // updates name in database
  jQuery.ajax( {
    type: "PUT",
    url: "/"+resource+"/"+resource_id,
    data: putData,
    success: function() {

      if( doing !== "undo" ) {  // if the node name is not updated in an undo
        // variable needed to redo user's name in the input
        newName = nodeName;
      }

      // changes node's current name to the new name, which is the value of the input field in the node; the text replaces the input field
      jQuery("#"+node.id).text(nodeName);

      // the node's dom name in the project tree area
      var resource_dom = getNodeInfo( node, "resource dom" );
      // updates project tree area with new name
      jQuery("#"+resource_id+"_"+resource_dom+"_list_title").text(nodeName);

      if( (doing !== "undo") && (doing !== "redo") ) {  // if the node name is not updated in an undo or redo
        // done editing
        inEditing = false;
      }

    }
  });
};

// REST: deletes node in the database and, on success, in the SpaceTree.
// Condition is either "soft" or "hard": soft-delete updates the "deleted" flag in the database from false to true, while hard-delete deletes the entry in the database
function deleteNode( node, condition, doing ) {
  // the node's resource
  var resource = getNodeInfo( node, "resource" );
  // the node's database ID; gets by removing the last 4 characters ("_[resource]") of its JSON ID to take only the numeric part
  var resource_id = node.id.slice(0,-4);
  // the type of delete: soft does an update, while hard does a delete
  var deleteType;
  // the data to be set when updating the node; since the resource key cannot be a variable because it's taken literally, the entire AJAX data is set; set "deleted" to true
  var deleteData;
  if( condition === "soft" ) {
    deleteType = "PUT";
    deleteData = getNodeInfo( node, "delete data", true );
  }
  else if( condition === "hard" ) {
    deleteType = "DELETE";
    // no data has to be set for a hard-delete
    deleteData = null;
  }

  // deletes node in database
  jQuery.ajax( {
    type: deleteType,
    url: "/"+resource+"/"+resource_id,
    data: deleteData,
    success: function() {

      // removes the node (and its children if it has them)
      st.removeSubtree( node.id, true, "animate", { // "replot" doesn't work for an unknown reason, but duration is already set to 0 to disable animations
        hideLabels: false
      });

      // the node's dom name in the project tree area
      var resource_dom = getNodeInfo( node, "resource dom" );
      // updates project tree area with deleted node(s) - hides instead of removes in case user undoes
      jQuery("#"+resource_id+"_"+resource_dom+"_li").hide();

      // the node's parent's JSON ID
      var parent_JSONid = getParentNode( node ).id;
      // selects the deleted node's parent (highlights and centers the tree), as if it were clicked
      st.onClick( parent_JSONid );

      if( doing !== "undo" ) {
        // variables needed to undo the soft-deletion of this node
        lastAction = "delete";
        lastNode = node;
        lastParentNode = getParentNode( node );
      }

    }
  });
};

// undoes last action, if it wasn't already the same undo
function undoLastAction() {
  // only allow undoing if another node is not in editing mode
  if( !inEditing ) {
    if( (lastAction !== undoneAction) || (lastNode !== undoneNode) ) {  // if the same action and node were not undone (can't simply test if the last ation was not an undo because the last action can either be an undo or redo; and need this condition otherwise graph reloads on this node)
      if( lastAction === "create" ) {
        // ensures a non-base FSD is not hard-deleted, as it was automatically created with a concept
        if( lastNode._depth % 4 === 0 ) {  // if the node is at node depth 4, 8, or 12, etc.
          deleteNode( lastNode, "soft", "undo" );
        }
        else {
          // hard-deletes the created node; reasoning is that the table shouldn't be cluttered with soft-deleted entries that have no children, since "undo" is only valid for one action without a page refresh
          deleteNode( lastNode, "hard", "undo" );
        }
      }
      else if( lastAction === "update" ) {
        updateNode( lastNode, lastName, "undo" );
      }
      else if( lastAction === "delete" ) {
        createChildNode( lastParentNode, "undo" );
      }
      // disable successive undo for the same action and node
      undoneAction = lastAction;
      undoneNode = lastNode;
      // enable redo next
      canRedo = true;
    }
  }
};

// redoes last action, if it was an undo
function redoLastAction() {
  // only allow redoing if another node is not in editing mode
  if( !inEditing ) {
    if( canRedo ) {  // if the last action is "undo"
      if( lastAction === "create" ) {
        createChildNode( lastParentNode, "redo" );
      }
      else if( lastAction === "update" ) {
        updateNode( lastNode, newName, "redo" );
      }
      else if( lastAction === "delete" ) {  // deliberately not asking confirmation, since it's unnecessary
        deleteNode( lastNode, "soft" );
      }
      // enable undo for this redo next (set to null because both the undo and redo actions use the same lastAction and lastNode)
      undoneAction = null;
      undoneNode = null;
      // disable successive redo
      canRedo = false;
    }
  }
};

/* HELPER FUNCTIONS FOR REST AND SPACETREE */

// returns the requested information of a node (with an optional 3rd parameter of a value that needs to be set), depending on the node's depth
function getNodeInfo( node, info, value ) {
  // the node is a Function Structure Diagram
  if( (node.id === st.root) || (node._depth % 4 === 0) ) {  // if the node is at node depth 0 (root), 4, or 8, etc.
    if( info === "resource" ) {
      return "function_structure_diagrams";
    }
    else if( info === "resource name" ) {
      return "Function Structure Diagram";
    }
    else if( info === "resource dom" ) {
      return "function_structure_diagram";
    }
    else if( info === "child resource" ) {
      return "functions";
    }
    else if( info === "child resource name" ) {
      return "Function";
    }
    else if( info === "child resource dom" ) {
      return "function";
    }
    else if( info === "post child data" ) {
      return { "function":{ "name":value, "function_structure_diagram_id":node.id.slice(0,-4) } };
    }
    // no "else if( info === "post sibling data" )"
    else if( info === "put data" ) {
      return { "function_structure_diagram":{ "name":value } };
    }
    else if( info === "delete data" ) {
      return { "function_structure_diagram":{ "deleted":value } };
    }
  }

  // the node is a Function
  else if( node._depth % 4 === 1 ) {  // if the node is at node depth 1, 5, or 9, etc.
    if( info === "resource" ) {
      return "functions";
    }
    else if( info === "resource name" ) {
      return "Function";
    }
    else if( info === "resource dom" ) {
      return "function";
    }
    else if( info === "child resource" ) {
      return "concept_categories";
    }
    else if( info === "child resource name" ) {
      return "Concept Category";
    }
    else if( info === "child resource dom" ) {
      return "concept_category";
    }
    else if( info === "post child data" ) {
      return { "concept_category":{ "name":value, "function_id":node.id.slice(0,-4) } };
    }
    else if( info === "post sibling data" ) {
      return { "function":{ "name":"New Function", "function_structure_diagram_id":value } };
    }
    else if( info === "put data" ) {
      return { "function":{ "name":value } };
    }
    else if( info === "delete data" ) {
      return { "function":{ "deleted":value } };
    }
  }

  // the node is a Concept Category
  else if( node._depth % 4 === 2 ) {  // if the node is at node depth 2, 6, or 10, etc.
    if( info === "resource" ) {
      return "concept_categories";
    }
    else if( info === "resource name" ) {
      return "Concept Category";
    }
    else if( info === "resource dom" ) {
      return "concept_category";
    }
    else if( info === "child resource" ) {
      return "concepts";
    }
    else if( info === "child resource name" ) {
      return "Concept";
    }
    else if( info === "child resource dom" ) {
      return "concept";
    }
    else if( info === "post child data" ) {
      return { "concept":{ "name":value, "concept_category_id":node.id.slice(0,-4) } };
    }
    else if( info === "post sibling data" ) {
      return { "concept_category":{ "name":"New Concept Category", "function_id":value } };
    }
    else if( info === "put data" ) {
      return { "concept_category":{ "name":value } };
    }
    else if( info === "delete data" ) {
      return { "concept_category":{ "deleted":value } };
    }
  }

  // the node is a Concept
  else if( node._depth % 4 === 3 ) {  // if the node is at node depth 3, 7, or 11, etc.
    if( info === "resource" ) {
      return "concepts";
    }
    else if( info === "resource name" ) {
      return "Concept";
    }
    else if( info === "resource dom" ) {
      return "concept";
    }
    else if( info === "child resource" ) {
      return "function_structure_diagrams";
    }
    else if( info === "child resource name" ) {
      return "Function Structure Diagram";
    }
    else if( info === "child resource dom" ) {
      return "function_structure_diagram";
    }
    else if( info === "post child data" ) { // actually "put child data" to update name
      return { "function_structure_diagram":{ "name":value, "deleted":false } }; // no parent ID needed; must set deleted to false in case it was soft-deleted before
    }
    else if( info === "post sibling data" ) {
      return { "concept":{ "name":"New Concept", "concept_category_id":value } };
    }
    else if( info === "put data" ) {
      return { "concept":{ "name":value } };
    }
    else if( info === "delete data" ) {
      return { "concept":{ "deleted":value } };
    }
  }
};

// returns a node's parent node
function getParentNode( node ) {
  if( node.id !== st.root ) { // if the node isn't the root node
    // an array of the node's parent nodes
    var parents = node.getParents();
    // the number of parent nodes the node has
    var numParents = parents.length;
    // returns the node's parent node, which is the last one in the array
    return parents[numParents-1];
  }
};

// custom function to expand node, needed because it may have collapsed children nodes
function customExpand( node ) {
  // stores the current node's collapsed children nodes into an array
  var collapsedChildren = new Array();
  jQuery.each( node.getSubnodes(1), function( i, v ) {  // starting from its first child, not itself (as getSubnodes() would do)
    if( v.collapsed ) {
      collapsedChildren.push( v );
      v.collapsed = false;
    }
  });

  st.op.expand( node ); // expand node; node is set to not collapsed

  // if there were collapsed children nodes, re-collapse the children that were previously set to collapse, as expanding the current node had expanded all its children too
  if( collapsedChildren.length ) {
    jQuery.each( collapsedChildren, function( i, v ) {
      st.op.contract( v );
    });
  }
}

/* SPACETREE */

// renders the SpaceTree with the JSON representation as a parameter
//init data
function initST( fsdJSON ) {

  // assign a variable, with the value of the JSON representation, to be used when rendering the SpaceTree
  var treeJSON = fsdJSON;

  // Render the node with rounded corners and a border
  $jit.ST.Plot.NodeTypes.implement({
    'round-stroke-rect': {
      'render': function( node, canvas ) {
        var width = node.getData('width'), height = node.getData('height');
        var pos = node.pos.getc(true);
        var algnPos = this.getAlignedPos(pos, width, height);
        var ctx = canvas.getCtx(), ort = this.config.orientation;
        ctx.beginPath();

        var r = 6;  // corner radius
        var x = algnPos.x;
        var y = algnPos.y;
        var h = height;
        var w = width;

        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.fill();
        ctx.stroke(); // border
      }
    }
  });

  //init Spacetree
  //Create a new ST instance
  st = new $jit.ST({
    //id of viz container element
    injectInto: 'infovis',
    //set duration for the animation
    duration: 0,  // 0 to disable animations
    //set animation transition type
    transition: $jit.Trans.Quart.easeInOut,
    //set distance between node and its children
    levelDistance: 30,
    //enable panning
    Navigation: {
      enable:true,
      panning:true
    },
    //set node and edge styles
    //set overridable=true for styling individual
    //nodes or edges
    Node: {
      height: 30,
      width: 90,
      autoHeight: true,
      // autoWidth: true,
      type: 'round-stroke-rect',
      // canvas specific styles
      CanvasStyles: {
        strokeStyle: '#808080', // grey border, not used, but still needs to be specified here or border won't render
        lineWidth: 1  // border width
      },
      overridable: true
    },
    Edge: {
      type: 'bezier',
      overridable: true
    },
    //This method is called on DOM label creation.
    //Use this method to add event handlers and styles to
    //your node.
    onCreateLabel: function(label, node) {
      label.id = node.id;
      label.innerHTML = node.name;
      label.onclick = function() {
        st.onClick(node.id);
      };
      //set label styles
      var style = label.style;
      style.width = 90 + 'px';
      // style.height = 30 + 'px';
      style.cursor = 'pointer';
      style.color = '#000';
      style.fontSize = '12px';
      style.textAlign= 'center';
      style.paddingTop = '3px';
      style.paddingBottom = '3px';
      style.wordWrap = 'break-word';
    },
    //This method is called right before plotting
    //a node. It's useful for changing an individual node
    //style properties before plotting it.
    //The data properties prefixed with a dollar
    //sign will override the global node style properties.
    onBeforePlotNode: function(node) {
      //add some color to the nodes in the path between the
      //root node and the selected node.
      if (node.selected) {
        if( node.id === st.clickedNode.id ) { // if it's the current (last clicked) node (= last node in path)
          node.data.$color = "#FF7F00";  // medium orange
        }
        else {
          node.data.$color = "#FF9F40"; // light orange
        }

        node.setCanvasStyle('strokeStyle', '#A65200');  // orange border if selected node
      }
      else {
        if( (node.id === st.root) || (node._depth % 4 === 0) ) {  // if the node is a Function Structure Diagram
          node.data.$color = "#206676"; // darkest blue
        }
        else if( node._depth % 4 === 1 ) {  // if the node is a Function
          node.data.$color = "#04819E";
        }
        else if( node._depth % 4 === 2 ) {  // if the node is a Concept Category
          node.data.$color = "#38B2CE";
        }
        else if( node._depth % 4 === 3 ) {  // if the node is a Concept
          node.data.$color = "#60B9CE";  // lightest blue
        }

        node.setCanvasStyle('strokeStyle', '#015367');  // blue border if not selected node
      }

      // indicate that a node is collapsed (purposely, by the user) with a white font colour
      if( node.collapsed ) {
        jQuery("#"+node.id).css('color', '#FFF');
      }
      else {
        jQuery("#"+node.id).css('color', '#000');
      }
    },
    //This method is called right before plotting
    //an edge. It's useful for changing an individual edge
    //style properties before plotting it.
    //Edge data proprties prefixed with a dollar sign will
    //override the Edge global style properties.
    onBeforePlotLine: function(adj) {
      if (adj.nodeFrom.selected && adj.nodeTo.selected) {
        adj.data.$color = "#A65200";  // orange connector
        adj.data.$lineWidth = 3;
      }
      else {
        delete adj.data.$color;
        delete adj.data.$lineWidth;
        adj.data.$color = "#015367";  // blue connector
      }
    },
    Events: {
      enable: true,
      // handles right click that enables editing a node name
      onRightClick: function( node, eventInfo, e ) {
        // only allow editing of a node if it's not already in editing mode
        if( !inEditing ) {
          if( node ) {  // if a node, and not empty space, is right clicked
            if( node.id === st.clickedNode.id ) {  // if the node is the current (last clicked) node (i.e. the one that is going to be edited)
              enableUpdateNode( node );
            }
          }
        }
      },
      // handles click that saves node name, for if the user edits a node's name but clicks elsewhere instead of pressing Enter to save; also handles expansion/contraction of a node
      onClick: function( node, eventInfo, e ) {
        if( inEditing ) { // if a node is in editing mode
          if( node.id !== st.clickedNode.id ) {  // if user clicks anywhere except for the current (last clicked) node
            // updates the current (last clicked) node's name
            updateNode( st.clickedNode, jQuery("input").val() );
          }
        }
        else {
          if( node.id === st.clickedNode.id ) { // if user clicks the current (last clicked) node
            if( node.collapsed ) {  // if the node is collapsed
              customExpand( node );
            }
            else {  // if the node is not collapsed
              st.op.contract( node ); // collapse node; node is set to collapsed
            }
          }
          // Note: uncomment else statement below if you want to automatically expand, upon a click, a non-current node that was set to collapsed before
          // else {
            // if( node.collapsed ) {  // if the node is collapsed
              // customExpand( node );
            // }
          // }
        }
      }
    }
  });

  //load json data
  st.loadJSON(treeJSON);
  //compute node positions and layout
  st.compute();
  //optional: make a translation of the tree
  st.geom.translate(new $jit.Complex(-200, 0), "current");
  //emulate a click on the root node.
  st.onClick(st.root);

  //handle spacetree orientation
  var normal = $jit.id('s-normal');

}
