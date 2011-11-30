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
// whether or not the undo action was done
var unDone = false;
// whether or not the Ctrl key is pressed down
var ctrlDown = false;

var labelType, useGradients, nativeTextSupport, animate;


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

var Log = {
  elem: false,
  write: function(text) {
    if (!this.elem)
      this.elem = document.getElementById('log');
    this.elem.innerHTML = text;
    this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
  }
};


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
    else if( info === "child resource" ) {
      return "functions";
    }
    else if( info === "child resource name" ) {
      return "Function";
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
    else if( info === "child resource" ) {
      return "concept_categories";
    }
    else if( info === "child resource name" ) {
      return "Concept Category";
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
    else if( info === "child resource" ) {
      return "concepts";
    }
    else if( info === "child resource name" ) {
      return "Concept";
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
    else if( info === "child resource" ) {
      return "function_structure_diagrams";
    }
    else if( info === "child resource name" ) {
      return "Function Structure Diagram";
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
                Log.write( "adding node..." );
                st.addSubtree( newNode, "replot", {
                  hideLabels: false,
                  onComplete: function() {
                    Log.write( "node added" );
                  }
                });

                // selects the new node (highlights and centers the tree), as if it were clicked
                st.onClick( child_JSONid );

                if( doing !== "redo" ) {  // if the child node is not created in a redo; no need to enable editing if redo
                  // changes text to an input field with a value of the node's name
                  jQuery("#"+child_JSONid).html('<input type="text" value="'+newNodeName+'" />');
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
            Log.write( "adding node..." );
            st.addSubtree( newNode, "replot", {
              hideLabels: false,
              onComplete: function() {
                Log.write( "node added" );
              }
            });

            // selects the new node (highlights and centers the tree), as if it were clicked
            st.onClick( newNodeJSON.id );

            if( doing !== "redo" ) {  // if the child node is not created in a redo; no need to enable editing if redo
              // changes text to an input field with a value of the node's name
              jQuery("#"+newNodeJSON.id).html('<input type="text" value="'+newNodeName+'" />');
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
// NOTE: in DesignPad, ensure it's not slow to reload the ST

// NOTE: need Log.write?
            //load json data
            st.loadJSON(treeJSON);
            //compute node positions and layout
            st.compute();

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
      Log.write( "adding node..." );
      st.addSubtree( newNode, "replot", {
        hideLabels: false,
        onComplete: function() {
          Log.write( "node added" );
        }
      });

      // selects the new node (highlights and centers the tree), as if it were clicked
      st.onClick( newNodeJSON.id );

      // changes text to an input field with a value of the node's current name
      jQuery("#"+newNodeJSON.id).html('<input type="text" value="'+newNodeName+'" />');
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
      jQuery("#"+currNodeJSON.id).html('<input type="text" value="'+currNodeJSON.name+'" />');
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

  // soft-deletes node in database
  jQuery.ajax( {
    type: deleteType,
    url: "/"+resource+"/"+resource_id,
    data: deleteData,
    success: function() {

      // removes the node (and its children if it has them)
      Log.write( "removing subtree..." );
      st.removeSubtree( node.id, true, "animate", { // "replot" doesn't work for an unknown reason, but duration is already set to 0 to disable animations
        hideLabels: false,
        onComplete: function() {
          Log.write( "subtree removed" );
        }
      });

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

// undoes last action
function undoLastAction() {
  if( !unDone ) { // if the last action isn't "undo"
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
    // done undo; disable successive undo
    unDone = true;
  }
};

// redoes last action, if it was undone
function redoLastAction() {
  if( unDone ) {  // if the last action is "undo"
    if( lastAction === "create" ) {
      createChildNode( lastParentNode, "redo" );
    }
    else if( lastAction === "update" ) {
      updateNode( lastNode, newName, "redo" );
    }
    else if( lastAction === "delete" ) {  // deliberately not asking confirmation, since it's unnecessary
      deleteNode( lastNode, "soft" );
    }
    // done redo (not undo); enable successive undo
    unDone = false;
  }
};

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
      // only allow adding of a node if another node is not in editing mode
      if( !inEditing ) {
        // creates child node to the current (last clicked) node
        createChildNode( st.clickedNode );
      }
      break;

    // adding sibling node with Enter, or updating entered node name
    case 13: // Enter key
      // adding sibling node with Enter
      // only allow adding of a node if another node is not in editing mode
      if( !inEditing ) {
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
      // updating entered node name
      else {
        // updates the current (last clicked) node's name
        updateNode( st.clickedNode, jQuery("input").val() );
      }
      break;

    // enabling editing node name with F2
    case 113: // F2 key
      // only allow editing of a node if it's not already in editing mode
      if( !inEditing ) {
        enableUpdateNode( st.clickedNode );
      }
      break;

    // deleting node (and its children if it has them) with Backspace or Delete
    case 8: // Backspace key
    case 46:  // Delete key
      // only allow deleting of a node if another node is not in editing mode
      if( !inEditing ) {
        // prevent default action of the event from happening only if a node is not in editing mode (i.e. prevent Backspace from going back a page when a node's not in editing mode, but still allow Backspace and Delete when typing new node name in its editing mode since it's an input field)
        event.preventDefault();

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
      break;

    // navigating left, to parent node, with Arrow Left
    case 37:  // Arrow Left key
    // only allow navigation if a node's not in editing mode
      if( !inEditing ) {
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
        if( st.clickedNode.anySubnode("exist") ) {  // if it has any children
          // selects first child
          st.onClick( st.clickedNode.getSubnodes()[1].id );
        }
      }
      break;

    // navigating up depth with Arrow Up
    case 38:  // Arrow Up key
    // only allow navigation if a node's not in editing mode
      if( !inEditing ) {
        if( st.clickedNode.id !== st.root ) { // if it's not the root node
          // the current (last clicked) node's parent
          var parentNode = getParentNode( st.clickedNode );

          // stores current (last clicked) node's parent's direct children nodes into an array
          var directChildren = new Array();
          parentNode.eachSubnode( function(n) {
            directChildren.push(n);
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
        if( st.clickedNode.id !== st.root ) { // if it's not the root node
          // the current (last clicked) node's parent
          var parentNode = getParentNode( st.clickedNode );

          // counts current (last clicked) node's parent's direct children nodes (count is 1-based "indexing"), and stores the direct children nodes into an array
          var count = 0;
          var directChildren = new Array();
          parentNode.eachSubnode( function(n) {
            count++;
            directChildren.push(n);
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
      // only allow undoing if the Ctrl key is down and if a node's not already in editing mode
      if( ctrlDown && !inEditing ) {
        undoLastAction();
      }
      break;

    // redoing last action
    case 89:  // Y key
      // only allow redoing if the Ctrl key is down and if a node's not already in editing mode
      if( ctrlDown && !inEditing ) {
        redoLastAction();
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

  }
});

// renders the SpaceTree with the JSON representation as a parameter
//init data
function initST( fsdJSON ) {

  // assign a variable, with the value of the JSON representation, to be used when rendering the SpaceTree
  var treeJSON = fsdJSON;

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
    levelDistance: 50,
    //enable panning
    Navigation: {
      enable:true,
      panning:true
    },
    //set node and edge styles
    //set overridable=true for styling individual
    //nodes or edges
    Node: {
      height: 20,
      width: 60,
      type: 'rectangle',
      color: '#aaa',
      overridable: true
    },
    Edge: {
      type: 'bezier',
      overridable: true
    },
    onBeforeCompute: function(node) {
      Log.write("loading " + node.name);
    },
    onAfterCompute: function() {
      Log.write("done");
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
      style.width = 60 + 'px';
      style.height = 17 + 'px';
      style.cursor = 'pointer';
      style.color = '#333';
      style.fontSize = '0.8em';
      style.textAlign= 'center';
      style.paddingTop = '1px';
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
          node.data.$color = "#f77";  // red
        }
        else {
          node.data.$color = "#ff7";
        }
      }
      else {
        delete node.data.$color;
        //if the node belongs to the last plotted level
        if(!node.anySubnode("exist")) {
          //count children number
          var count = 0;
          node.eachSubnode(function(n) { count++; });
          //assign a node color based on
          //how many children it has
          node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];
        }
      }
    },
    //This method is called right before plotting
    //an edge. It's useful for changing an individual edge
    //style properties before plotting it.
    //Edge data proprties prefixed with a dollar sign will
    //override the Edge global style properties.
    onBeforePlotLine: function(adj) {
      if (adj.nodeFrom.selected && adj.nodeTo.selected) {
        adj.data.$color = "#eed";
        adj.data.$lineWidth = 3;
      }
      else {
        delete adj.data.$color;
        delete adj.data.$lineWidth;
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
      // handles click that saves node name, for if the user edits a node's name but clicks elsewhere instead of pressing Enter to save
      onClick: function( node, eventInfo, e ) {
        if( inEditing ) { // if a node is in editing mode
          if( node.id !== st.clickedNode.id ) {  // if user clicks anywhere except for the current (last clicked) node
            // updates the current (last clicked) node's name
            updateNode( st.clickedNode, jQuery("input").val() );
          }
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