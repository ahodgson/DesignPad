// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

//Utility functions
//Author: Kexia Tang
//Co-Author: Yelnil Gabo
//Last modified: July 2011

//=============================================================================
function editFunction(){
    var functionId=singleSelectedId("function_id");
    if(functionId)
        window.location="/functions/"+functionId+"/edit"
}

function editKnownObject(){
    var knownObjectId=singleSelectedId("known_object_id");
    if(knownObjectId)
        window.location="/known_objects/"+knownObjectId+"/edit"
}

// Test if only one item is selected in a multiple list.
// return false if not a single item is selected.
// return item ID if single item is selected
function singleSelectedId(multipleListId)
{
    var itemIds=selectedIds(multipleListId);

    if(itemIds.length<=0)
        alert("Please select one item first.");
    else if(itemIds.length>1)
        alert("Please select one item only.");
    else
        return itemIds[0];

    return false;
}

function isSelected(multipleListId)
{
    var itemIds=selectedIds(multipleListId);
    if(itemIds.length<=0)
        return false;
    else
        return true;
}

function selectedIds(multipleListId)
{
    var multipleList=document.getElementById(multipleListId);
    var selectedIds=[];
    for(i=0;i<multipleList.length;i++)
    {
        if(multipleList.options[i].selected)
        {
            selectedIds.push(multipleList.options[i].value);
        }
    }
    return selectedIds;
}
//=========================IE or FirFox?=======================================
//is the browser IE?
function isIE()
{
   var i=navigator.userAgent.toLowerCase().indexOf("msie");
   return i>=0;
}

//is the brower firefox?
function isFireFox()
{
    var i=navigator.userAgent.toLowerCase().indexOf("firefox");
    return i>=0;
}

function isChrome()
{
    var i=navigator.userAgent.toLowerCase().indexOf("chrome");
    return i>=0;
}

function bodyOnLoad()
{
    if(isFireFox())
        document.getElementsByTagName("html")[0].className="firefox";
    else
        document.getElementsByTagName("html")[0].className="non_firefox";
}

//=======================Utility functions=====================================

//***********************************some string functions
//get string before a certain string
function getFront(mainStr,searchStr)
{
    var foundOffset=mainStr.indexOf(searchStr);
    if(foundOffset==-1)
       return null;
    return mainStr.substring(0,foundOffset);
}

//get string after a certain string
function getEnd(mainStr,searchStr)
{
    var foundOffset=mainStr.indexOf(searchStr);
    if(foundOffset==-1)
       return null;
    return mainStr.substring(foundOffset+searchStr.length,mainStr.length);
}
//insert a string before a certain string
function insertString(mainStr,searchStr,insertStr)
{
    var front=getFront(mainStr,searchStr);
    var end=getEnd(mainStr,searchStr);
    if(front!=null && end!=null)
       return front+insertStr+searchStr+end;
    return null;
}

//replace a substring
function replaceString(mainStr,searchStr,replaceStr)
{
    var front=getFront(mainStr,searchStr);
    var end=getEnd(mainStr,searchStr);
    if(front!=null && end!=null)
       return front+replaceStr+end;
    return null;
}
//***********************************end of string functions

function isOfClass(className,element)
{
    var temp=element.className;
    return (replaceString(temp,className,"")!=null);
}

function addClass(newClassName,element)
{
    var oldClassName=element.className;
    if(!isOfClass(newClassName, element))
    {
        if(oldClassName.length>0)
            element.className=(oldClassName+" "+newClassName);
        else
            element.className=newClassName;
    }
}

function removeClass(className,element)
{
    var oldClassName=element.className;
    var classes=oldClassName.split('_');
    if(classes.length<=1)
        element.className=replaceString(oldClassName, className, "");
    else if(classes[0]==className)
        element.className=replaceString(oldClassName, className+" ", "");
    else
        element.className=replaceString(oldClassName, " "+className, "");
}

function makeUniqueClass(className,element)
{
    var items=getElementsByClassName(className,document);
    for(var i=0;i<items.length;i++)
        removeClass(className,items[i]);

    //test if element exist (in case arrow key moves too fast)
    if(element)
        addClass(className,element);
}

// unified getElementsByClassName for both IE and firefox
function getElementsByClassName(className, parentElement)
{
    var elements = (parentElement||document.body).getElementsByTagName("*");
    var result=[];
    for (i=0; j=elements[i]; i++)
    {
        if ((" "+j.className+" ").indexOf(" "+className+" ")!=-1)
        {
            result.push(j);
        }
    }
    return result;
}

//add event listener to an element
function addEventById(elementId, event, func, bool)
{
    if(isIE())
        $(elementId).attachEvent("on"+event, func, bool);
    else if(isFireFox() || isChrome() )
        $(elementId).addEventListener(event, func, bool);
}
function addEventByClassName(elementClassName, parentElement, event, func, bool)
{
    var elements=getElementsByClassName(elementClassName, parentElement)
    for(var i=0;i<elements.length;i++)
    {
        if(isIE())
            elements[i].attachEvent("on"+event, func, bool);
        else if(isFireFox()  || isChrome() )
            elements[i].addEventListener(event, func, bool);
    }
}

//remove event listener to an element
function removeEventById(elementId, event, func, bool)
{
    if(isIE())
        $(elementId).detachEvent("on"+event, func, bool);
    else if(isFireFox()  || isChrome() )
        $(elementId).removeEventListener(event, func, bool);
}

function removeEventByClassName(elementClassName, parentElement, event, func, bool)
{
    var elements=getElementsByClassName(elementClassName, parentElement)
    for(var i=0;i<elements.length;i++)
    {
        if(isIE())
            elements[i].detachEvent("on"+event, func, bool);
        else if(isFireFox()  || isChrome() )
            elements[i].removeEventListener(event, func, bool);
    }
}

function click(element)
{
    //IE
    //if(document.all)
    if(isIE())
    {
        element.click();
    }
    //firefox
    else if(isFireFox()  || isChrome() )
    {
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, true);
        element.dispatchEvent(evt);
    }
}
/* commented out to disable keypress in project tree area
function simulateKeyDown(keyCode)
{
    // Create new event
    var e = document.createEvent('KeyboardEvent');
    // Init key event
    //e.initKeyEvent(type, bubbles, cancelable, viewArg, ctrlKeyArg, altKeyArg, shiftKeyArg, metaKeyArg, keyCodeArg, charCodeArg)
    e.initKeyEvent('keydown', true, true, window, false, false, false, false, keyCode, 0);
    // Dispatch event into document
    document.dispatchEvent(e);
}
*/
function getUnifiedEvent(event)
{
    var evt = event ? event : window.event;
    return evt;
}
function getUnifiedTarget(event)
{
    var evt=getUnifiedEvent(event);
    var targ;
    if (evt.target)
        targ = evt.target
    else if (evt.srcElement)
        targ = evt.srcElement
    if (targ.nodeType == 3) // defeat Safari bug
        targ = targ.parentNode

    return targ;
}

//========================Clipboard manipulation ============================
function copyToClipBoard(element_id)
  {
    var div = document.getElementById(element_id);
    div.contentEditable = 'true';
    var controlRange;
    if(document.body.createControlRange)
    {
      controlRange = document.body.createControlRange();
      controlRange.addElement(div);
      controlRange.execCommand('Copy');
    }
    div.contentEditable = 'false';
  }

  function pasteToClipBoard(element_id)
  {
    var div = document.getElementById(element_id);
    div.contentEditable = 'true';
    var controlRange;
    if(document.body.createControlRange)
    {
      controlRange = document.body.createControlRange();
      controlRange.addElement(div);
      controlRange.execCommand('Paste');
    }
    div.contentEditable = 'false';
  }



//======================Adding expanion marks to list==========================
var unexpandedImagePath='/images/unexpanded.gif';
var expandedImagePath='/images/expanded.gif';

// add expansion mark for a list
function addExpansionMarksForUL(ul_element)
{
    var listItems = ul_element.getElementsByTagName('li');
    for (var i=0; i<listItems.length; i++)
    {
        if(getElementsByClassName('expansion_mark', listItems[i]).length>0)
            getElementsByClassName('expansion_mark', listItems[i])[0].innerHTML=expansionMark(listItems[i]);
    }
}

//the expansion mark
function expansionMark(li_element)
{
    var expansionMark="";

    if(li_element.getElementsByTagName('li').length>0)
    {
        if(li_element.getElementsByTagName('ul')[0].style.display=="none")
            expansionMark="<img src="+unexpandedImagePath+" onclick='toggleList(\""+li_element.id+"\");'/>";
        else
            expansionMark="<img src="+expandedImagePath+" onclick='toggleList(\""+li_element.id+"\");'/>";
    }
    return expansionMark;
}

// toggle a list item
function toggleList(li_id)
{
    if($(li_id).getElementsByTagName('ul').length>0)
    {
        var ul_element=$(li_id).getElementsByTagName('ul')[0];

        if(ul_element.style.display=="none")
            unfold($(li_id));
        else
            fold($(li_id));
    }
}

// fold or unfold a whole list
function foldAll(ul_element)
{
    var listItems=ul_element.getElementsByTagName('li');
    for(var i=0;i<listItems.length;i++)
        fold(listItems[i]);
}
function unfoldAll(ul_element)
{
    var listItems=ul_element.getElementsByTagName('li');
    for(var i=0;i<listItems.length;i++)
        unfold(listItems[i]);
}

// fold & unfold a list item.
function fold(li_element)
{
    if(li_element.getElementsByTagName('ul').length>0)
    {
        var ul_element=li_element.getElementsByTagName('ul')[0];
        ul_element.style.display="none";
        if(getElementsByClassName('expansion_mark', li_element)[0].getElementsByTagName('img').length>0)
            getElementsByClassName('expansion_mark', li_element)[0].getElementsByTagName('img')[0].src=unexpandedImagePath;

        if(getElementsByClassName('hovered_list_title').length>0)
        {
            var hoveredListTitile=getElementsByClassName('hovered_list_title')[0];
            var listTitle=getElementsByClassName('list_title', li_element)[0];
            if(!isVisible(hoveredListTitile.parentNode))
                makeUniqueClass('hovered_list_title', listTitle);
        }
    }
}
function unfold(li_element)
{
    if(li_element.getElementsByTagName('ul').length>0)
    {
        var ul_element=li_element.getElementsByTagName('ul')[0];
        ul_element.style.display="";
        if(getElementsByClassName('expansion_mark', li_element)[0].getElementsByTagName('img').length>0)
            getElementsByClassName('expansion_mark', li_element)[0].getElementsByTagName('img')[0].src=expandedImagePath;
    }
}

function isFolded(li_element)
{
    if(li_element.getElementsByTagName('li').length<=0 || li_element.getElementsByTagName('ul').length<=0)
        return undefined;
    else if(li_element.getElementsByTagName('ul')[0].style.display=='none')
        return true;
    else
        return false;
}

function isVisible(li_element)
{
    while(li_element.tagName=='LI')
    {
        if(li_element.parentNode.style.display=='none')
            return false;
        li_element=li_element.parentNode.parentNode;
    }
    return true;
}


//===============================Drag and Drops================================

// These functions are not using because it fails to make new draggables when part
// of the page is renewed by drag&drop
function makeConceptDraggables(project_ul)
{
    var conceptListTitles = getElementsByClassName('concept_list_title', project_ul);
    for(var i=0; i<conceptListTitles.length; i++)
    {
        new Draggable(conceptListTitles[i].id, {ghosting:false, revert:true, scroll:$('project_tree_content')});
        //conceptListTitles[i].style.position='';
    }
}
function makeConceptCategoryDroppables(project_ul)
{
    var conceptCategoryLis = getElementsByClassName('concept_category_li', project_ul);
    for(var i=0; i<conceptCategoryLis.length; i++)
    {
        Droppables.add(conceptCategoryLis[i].id,
        {
            accept:'concept_list_title',
            hoverclass:'hoverConceptCategory',
            onDrop:function(draggable, droppable)
            {
                new Ajax.Request('/concept_categories/receive_concept',
                {
                    asynchronous:true,
                    evalScripts:true,
                    parameters:'element_to_move_id='+draggable.parentNode.id
                        +'&post_concept_category_id='+droppable.id.split('_').first()
                })
            }
        })
        //conceptCategoryLIs[i].style.position='';
    }
}

//===========================instant insertion================================
function resetProjectEditPage()
{
    hideComments();
    cancelHighlightedSynergy();
    //resetInstantCreateGlobalVariables();
    $('project_view_content').innerHTML="";
    $('project_view_operations').innerHTML="";
    $('project_view_clue').innerHTML="";
    $('known_objects_list_content').innerHTML="";
    $('known_objects_list_operations').innerHTML="";
}
function clearOperationBar()
{
    $('project_view_operations').innerHTML="";
    $('known_objects_list_operations').innerHTML="";
}
function clearViewClue()
{
    $('project_view_clue').innerHTML="";
}

function resetInstantCreateGlobalVariables()
{
    sibSize='';
    sibMaxLength='';
    sibDefaultText='';
    sibModel='';
    sibSubmitUrl='';
    superIdName='';
    superIdValue='';

    subSize='';
    subMaxLength='';
    subDefaultText='';
    subModel='';
    subSubmitUrl='';
    selfIdName='';
    selfIdValue='';
}

function removeInstantInput()
{
    //if($('instant_ul'))
        //Element.remove($('instant_ul'));
    if($('instant_li'))
    {
        if(getElementsByClassName('list_title', $('instant_li').parentNode).length==0)
            Element.remove($('instant_li').parentNode);
        if($('instant_li'))
            Element.remove($('instant_li'));
    }

    //remove instant edit form
    if($('instant_edit_form'))
    {
        if(getElementsByClassName('list_title', $('instant_edit_form').parentNode).length>0)
        {
            var listTitle=getElementsByClassName('list_title', $('instant_edit_form').parentNode)[0];
            Element.show(listTitle);
            Element.remove($('instant_edit_form'));
        }
    }
}

function InstantLiHtml(type)
{
    var instantLiHtml='';
    var submitUrl='';
    var model='';
    var defaultText='';
    var size='';
    var maxLength='';
    var parentIdName='';
    var parentIdValue='';

    switch(type)
    {
        case 'sib':
            submitUrl=sibSubmitUrl;
            model=sibModel;
            defaultText=sibDefaultText;
            size=sibSize;
            maxLength=sibMaxLength;
            parentIdName=superIdName;
            parentIdValue=superIdValue;
            break;
        case 'sub':
            submitUrl=subSubmitUrl;
            model=subModel;
            defaultText=subDefaultText;
            size=subSize;
            maxLength=subMaxLength;
            parentIdName=selfIdName;
            parentIdValue=selfIdValue;
            break;
        default:
            break;
    }
    instantLiHtml+="<li id='instant_li'>"
    instantLiHtml+="    <form action='"+submitUrl+"' method='post' \n\
                            onsubmit='if($(instant_textfield).value.length<=0)return false; \n\
                            if(instantInputFlag==false) return false; instantInputFlag=false;\n\
                            new Ajax.Request(\""+submitUrl+"\", {asynchronous:true, evalScripts:true, parameters:Form.serialize(this)}); return false;'>"
    instantLiHtml+="        <input id='instant_textfield' name='"+model+"[name]' type='text' value='"+defaultText+"' size='"+size+"' maxlength='"+maxLength+"' />"
    instantLiHtml+="        <input id='instant_hidden_field' name='"+model+"["+parentIdName+"]' type='hidden' value='"+parentIdValue+"' />"
    instantLiHtml+="    </form>"
    instantLiHtml+="</li>"

    return instantLiHtml;
}

function instantUlHtml()
{
    //var instantUlHtml="<ul id='instant_ul'></ul>"
    var instantUlHtml="<ul class='"+sibModel+"_ul' id='"+selfIdValue+"_"+sibModel+"_ul'></ul>"
    return instantUlHtml;
}

function pictureClue(bool)
{
    if(bool)
        $('project_view_clue').innerHTML='Showing image, please wait...';
    // else
        // $('project_view_clue').innerHTML='No image found.';
}

function getSelectedListTitle()
{
    if(getElementsByClassName('selected_list_title', $('project_tree_content')).length>0)
        return getElementsByClassName('selected_list_title', $('project_tree_content'))[0];
    else
        return undefined;
}
function getHoveredListTitle()
{
    var selectedListTitle=getSelectedListTitle();
    if(selectedListTitle)
    {
        var hoveredListTitle;
        if(getElementsByClassName('hovered_list_title', $('project_tree_content')).length<=0)
            hoveredListTitle=selectedListTitle;
        else
            hoveredListTitle=getElementsByClassName('hovered_list_title', $('project_tree_content'))[0];
        return hoveredListTitle;
    }
    else
        return undefined;
}

function projectEditOnLoad()
{
    instantInputFlag=true;
    inputFocus=false;
    /* commented out to disable keypress in project tree area
    document.onclick=projectEditOnClick;
    document.onkeydown=projectEditOnKeyDown;
    document.onkeypress=projectEditOnKeyPress;
    document.onkeyup=projectEditOnKeyUp;
  */
}
function projectEditOnClick(event)
{
    //hide context menu
    var evt = getUnifiedEvent(event);
    if(evt.button!=2)
    {
        var popMenus=getElementsByClassName('pop_menu', document);
        if(popMenus.length>0)
        {
            for(var i=0; i<popMenus.length; i++)
                popMenus[i].style.display='none';
        }
    }

    var targ=getUnifiedTarget(event);
    //var tname=targ.tagName

    if(targ.id=='instant_textfield' || targ.className=='pop_link' || instantInputFlag==false)
        return;

    removeInstantInput();
}
/* commented out to disable keypress in project tree area
function projectEditOnKeyDown(event)
{
    var evt = getUnifiedEvent(event)
    var hoveredListTitle;

    //input condition validation
    if(evt.keyCode==27)
        removeInstantInput();
    if($('instant_li')||$('instant_edit_form')||inputFocus==true)
        return true;

    //assign title variables
    if(getSelectedListTitle()==undefined)
        return true;
    else
        hoveredListTitle=getHoveredListTitle();

    switch(evt.keyCode)
    {
        case 37:
        case 38:
            setHover(previousListTitle(hoveredListTitle));
            if(hoveredListTitle.getBoundingClientRect().top < $('project_tree_content').getBoundingClientRect().top)
                $('project_tree_content').scrollTop-=20;
            break;

        case 39:
        case 40:
            setHover(nextListTitle(hoveredListTitle));
            if(hoveredListTitle.getBoundingClientRect().bottom > $('project_tree_content').getBoundingClientRect().bottom)
                $('project_tree_content').scrollTop+=20;
            break;

        default:
            break;
    }

    // disable default onkeydown when not typing
    // This must be checked at last when the above functions are performed.
    if(!$('instant_textfield'))
    {
        if(evt.keyCode==9||evt.keyCode==37||evt.keyCode==38||evt.keyCode==39||evt.keyCode==40)
            return false;
    }

    return true;
}

function projectEditOnKeyUp(event)
{
    var evt = getUnifiedEvent(event);
    var selectedListTitle;
    var hoveredListTitle;

    //input condition validation
    if(evt.keyCode==27)
        removeInstantInput();
    if($('instant_li')||$('instant_edit_form')||inputFocus==true)
        return;

    //assign title variables
    if(getSelectedListTitle()==undefined)
        return;
    else
    {
        selectedListTitle=getSelectedListTitle();
        hoveredListTitle=getHoveredListTitle();
    }

    switch(evt.keyCode)
    {
        //press return
        case 13:
            projectEditWhenEnterPressed(selectedListTitle, hoveredListTitle);
            break;

        //press tab
        case 9:
            projectEditWhenTabPressed(selectedListTitle);
            break;

        //ctrl+v
        case 86:
            if(evt.ctrlKey)
            {
                if(isOfClass('hovered_content', $('project_view_content')))
                    pasteToClipBoard('project_view_content');
            }
            break;

        default:
            break;
    }

    //select and focus to input field
    if($('instant_textfield'))
    {
        $('instant_textfield').select();
        $('instant_textfield').focus();
    }
}

//currently not using
function projectEditOnKeyPress(event)
{
    var evt = getUnifiedEvent(event);
    switch(evt.keyCode)
    {
        default:
            break;
    }
}
*/
function projectEditWhenEnterPressed(selectedListTitle, hoveredListTitle)
{
    //select the hovered list title, if any
    if(getElementsByClassName('hovered_list_title').length>0)
    {
        click(hoveredListTitle);
        removeClass('hovered_list_title', hoveredListTitle);
        return;
    }
    if(instantInputFlag==false)
        return;
    if(selfIdName=='project_id')
    {
        alert("To create new project, please go to user hub.");
        return;
    }
    if(selfIdName=='function_structure_diagram_id')
    {
        alert("It can only have one FSD.");
        return;
    }
    fold(selectedListTitle.parentNode);
    new Insertion.After(selectedListTitle.parentNode, InstantLiHtml('sib'));
}

function projectEditWhenTabPressed(selectedListTitle)
{
    if(instantInputFlag==false)
        return;
    if(selfIdName=='project_id'||selfIdName=='concept_id')
    {
        if(getElementsByClassName('function_structure_diagram_li', selectedListTitle.parentNode).length>0)
        {
            alert("It can only have one FSD.");
            return;
        }
    }
    unfold(selectedListTitle.parentNode);
    if(selectedListTitle.parentNode.getElementsByTagName('ul').length<=0)
        new Insertion.After(selectedListTitle, instantUlHtml());
    new Insertion.Top(selectedListTitle.parentNode.getElementsByTagName('ul')[0], InstantLiHtml('sub'));
}

function getProjectTreeSelectedListTitle()
{
    if(getElementsByClassName('selected_list_title', $('project_tree_content')).length>0)
        return getElementsByClassName('selected_list_title', $('project_tree_content'))[0];
    else
        return undefined;
}

function getProjectTreeHoveredListTitle()
{
    if(getElementsByClassName('hovered_list_title', $('project_tree_content')).length>0)
        return getElementsByClassName('hovered_list_title', $('project_tree_content'))[0];
    else
        return undefined;
}

//===========================context menu=====================================
function getIdNumber(list_title_id)
{
    return list_title_id.split("_").first();
}

function showContextMenu(element, event, menu_element)
{
    var targ=getUnifiedTarget(event);
    var idNumber=element.id.split("_").first();

    //var popMenu = document.getElementById('pop_menu');
    menu_element.style.top = event.clientY+document.documentElement.scrollTop+'px';
    menu_element.style.left = event.clientX+document.documentElement.scrollLeft+'px';
    menu_element.style.display = "inline";
}




//============================arrow key movement==============================

function setHover(list_title)
{
    makeUniqueClass('hovered_list_title', list_title);
}
function removeHover()
{
    if(getProjectTreeHoveredListTitle())
        removeClass('hovered_list_title', getProjectTreeHoveredListTitle())
}

function previousLi(li_element)
{
    var previousListItem = li_element.previousSibling;
    if(previousListItem)
    {
        while(previousListItem.nodeType!='1')
        {
            previousListItem = previousListItem.previousSibling;
            if(previousListItem==null)
                return false;
        }
        if(previousListItem.tagName=='LI')
            return previousListItem;
        else
            return false;
    }
    else
        return false;


/*
    var previousListItem;
    if(isFireFox())
        previousListItem=li_element.previousSibling.previousSibling;
    else
        previousListItem=li_element.previousSibling;

    if(previousListItem)
    {
        if(previousListItem.tagName=='LI')
            return previousListItem;
        else
            return false;
    }
    else
        return false;*/
}
function previousListTitle(listTitle)
{
    var listItem=listTitle.parentNode;
    var previousListItem=previousLi(listItem);
    var list=listItem.parentNode;

    // case when its the first sibling
    if(!previousListItem)
    {
        //case it still has parent list
        if(list.parentNode.tagName=='LI')
        {
            if(getElementsByClassName('list_title', list.parentNode).length>0)
                return getElementsByClassName('list_title', list.parentNode)[0];
            else
                return listTitle;
        }
        //case it's at the top of the whole tree
        else
            return listTitle;
    }
    //case when it's not the first sibling and previous sibling has sub tree
    else if(previousListItem.getElementsByTagName('li').length>0)
    {
        var lastIndex=previousListItem.getElementsByTagName('li').length-1;
        // the previous list item w.r.t. position of html
        var lastPreviousListItem=previousListItem.getElementsByTagName('li')[lastIndex];

        //test if this item is invisible
        for(var i=0; i<previousListItem.getElementsByTagName('ul').length; i++)
        {
            var previousList=previousListItem.getElementsByTagName('ul')[i];
            //if this item is contained in a invisible list, return the invisible list title
            if(previousList.style.display=='none')
            {
                for(var j=0; j<previousList.getElementsByTagName('li').length; j++)
                {
                    if(previousList.getElementsByTagName('li')[j].id==lastPreviousListItem.id)
                        return getElementsByClassName('list_title', previousList.parentNode)[0];
                }
            }
        }
        //regular return
        return getElementsByClassName('list_title', lastPreviousListItem)[0];
    }
    // case when it's previous sibling doesn't have sub tree
    else
        return getElementsByClassName('list_title', previousListItem)[0];
}

function nextLi(li_element)
{
    var nextListItem = li_element.nextSibling;
    if(nextListItem)
    {
        while(nextListItem.nodeType!='1')
        {
            nextListItem = nextListItem.nextSibling;
            if(nextListItem==null)
                return false;
        }
        if(nextListItem.tagName=='LI')
            return nextListItem;
        else
            return false;
    }
    return false;
}
function nextListTitle(listTitle)
{
    var listItem=listTitle.parentNode;
    var list=listItem.parentNode;

    // case when it has sub tree and its visible
    if(listItem.getElementsByTagName('li').length>0 && !isFolded(listItem))
    {
        return getElementsByClassName('list_title', listItem.getElementsByTagName('li')[0])[0];
    }
    //case when it doesn't have subtree or its subtree is invisible, and it has next sibling
    else if(nextLi(listItem))
    {
        return getElementsByClassName('list_title', nextLi(listItem))[0];
    }
    //case when it doesn't have subtree or its subtree is invisible, and it's the last sibling
    else
    {
        while(true)
        {
            if(nextLi(list.parentNode))
                return getElementsByClassName('list_title', nextLi(list.parentNode))[0];

            if(list.parentNode.tagName=='LI')
                list=list.parentNode.parentNode
            else
                break;
        }
        return listTitle;
    }
}


//============================project view part===============================
//****************************************************************************
function hideComments()
{
    jQuery('#comments_area').hide('slow');
    // $('project_view_fieldset').style.height='500px';
}
function showComments()
{
    // $('project_view_fieldset').style.height='770px';
    jQuery('#comments_area').show('slow');
}

function toggleComments()
{
    $('comment_link').blur();
    if($('comments_area').style.display=='none')
        showComments();
    else
        hideComments();
}



//===========================object list part=================================
//****************************************************************************
function highlightSynergy(concept_ids_array)
{
    if(concept_ids_array.length>0)
    {
        for(var i=0; i<concept_ids_array.length; i++)
        {
            addClass('synergy', $(concept_ids_array[i]+'_concept_list_title'))
        }
    }
}
function cancelHighlightedSynergy()
{
    var synergies=getElementsByClassName('synergy', $('project_tree_content'));
    if(synergies.length>0)
    {
        for(var i=0; i<synergies.length; i++)
            removeClass('synergy', synergies[i])
    }
}

function getSelectedObject()
{
    if(getElementsByClassName('selected_object', $('known_objects_list_content')).length>0)
        return getElementsByClassName('selected_object', $('known_objects_list'))[0]
    else
        return undefined;
}

// adds background colour when user hovers over the list title
jQuery(".list_title").live( "mouseover", function() {
  jQuery(this).addClass("hovered_list_title");
});
jQuery(".list_title").live( "mouseleave", function() {
  jQuery(this).removeClass("hovered_list_title");
});

// indicates in the project view area's legend that the selected partial is loading, and hides JIT's bug of the label at page bottom when it's not a FSD that's clicked
jQuery(".project_list_title").live( "click", function() {
  jQuery("#project_view_legend").text("Loading project content, please wait...");
  jQuery(".jit-autoadjust-label").hide();
});
jQuery(".function_structure_diagram_list_title").live( "click", function() {
  jQuery("#project_view_legend").text("Loading function structure diagram content, please wait...");
  jQuery(".jit-autoadjust-label").show();
});
jQuery(".function_list_title").live( "click", function() {
  jQuery("#project_view_legend").text("Loading function content, please wait...");
  jQuery(".jit-autoadjust-label").hide();
});
jQuery(".concept_category_list_title").live( "click", function() {
  jQuery("#project_view_legend").text("Loading concept category content, please wait...");
  jQuery(".jit-autoadjust-label").hide();
});
jQuery(".concept_list_title").live( "click", function() {
  jQuery("#project_view_legend").text("Loading concept content, please wait...");
  jQuery(".jit-autoadjust-label").hide();
});

// hides JIT's bug of the label at page bottom when it's a known object that's clicked
jQuery(".project_known_object_list_title").live( "click", function() {
  jQuery(".jit-autoadjust-label").hide();
});
jQuery(".unavailable_known_object_list_title").live( "click", function() {
  jQuery(".jit-autoadjust-label").hide();
});
