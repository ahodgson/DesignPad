# Methods added to this helper will be available to all templates in the application.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

module ApplicationHelper
  require 'string'
  
  # Return a link for use in site navigation.
  def nav_link(text, controller, action="index")
    link_to_unless_current text, :id => nil,
                                 :action => action,
                                 :controller => controller
  end

  # Customized button_to_remote function
  def button_to_remote name, options = {}
    button_to_function name, remote_function(options)
  end
  
  # Return true if some user is logged in, false otherwise.
  def logged_in?
    not session[:user_id].nil?
  end


  # create a text field tag
  def text_field_for(form, field, size=HTML_TEXT_FIELD_SIZE, maxlength=DB_STRING_MAX_LENGTH)
    label = content_tag("label", "#{field.humanize}:".html_safe, :for=>field)
    form_field = form.text_field field, :size=>size, :maxlength=>maxlength
    content_tag("div", "#{label}#{form_field}".html_safe, :class=>"form_row")
  end

  # create a text field tag
  def back_button
    if session[:previous_page]
      previous_page=session[:previous_page]
      "<button type='button' onclick='location.href=\"#{previous_page}\"'>Back</button>"
    end
  end
  
  # Return true if results should be paginated.
  def paginated?(pages)
    pages and pages.length>1
  end

  # refresh available object list
  def refresh_available_objects(function_structure_diagram, entity_model_name)
    page.replace_html :known_objects_list_content, :partial=>"known_objects/known_objects_ul", :locals=>{:function_structure_diagram=>function_structure_diagram, :entity_model_name=>entity_model_name}
  end

  # Show instant new form
  def instant_new(container_element_id, entity_model_name, size, maxlength, hidden_fields={})
    render :update do |page|
      page.replace_html container_element_id.to_sym,
                       :partial=>"shared/instant_new_form",
                       :locals=>{ :entity_model_name=>entity_model_name,
                                  :hidden_fields=>hidden_fields,
                                  :size=>size,
                                  :maxlength=>maxlength },
						:authenticity_token => form_authenticity_token
    end
  end

  # instant create effect
  def instant_create(entity, entity_model_name, other_arguments={})
    arguments=other_arguments.merge({entity_model_name.to_sym=>entity})
    
    folder_name=entity_model_name.pluralize
    page.replace :instant_li, :partial=>folder_name+"/"+entity_model_name+"_li", :locals=>arguments

    page.visual_effect :pulsate, entity.id.to_s+"_"+entity_model_name+"_list_title"

    unless entity_model_name=='known_object'
      page<<"addExpansionMarksForUL($('#{entity.id.to_s}_"+entity_model_name+"_li').parentNode.parentNode.parentNode)"
    end

    page.delay() do
      page<<"click($('#{entity.id.to_s}_"+entity_model_name+"_list_title'))"
      page<<"instantInputFlag=true;"
    end

  end

  # graceful failure for instant create
  def fail_instant_create(message="This name has been taken.")
    page.alert(message)
    page<<"instantInputFlag=true;"
  end

  # Show instant edit form
  def instant_edit(entity_model_name, entity, size, maxlength, hidden_fields={})
    render :update do |page|
      page.hide entity.id.to_s+'_'+entity_model_name+'_list_title'
      page.insert_html :after, entity.id.to_s+'_'+entity_model_name+'_list_title',
                       :partial=>"shared/instant_edit_form",
                       :locals=>{ :entity_model_name=>entity_model_name,
                                  :entity=>entity,
                                  :hidden_fields=>hidden_fields,
                                  :size=>size,
                                  :maxlength=>maxlength }
    end
  end

  # instant update effect
  def instant_update(entity, entity_model_name, orther_arguments={})
    arguments=orther_arguments.merge({entity_model_name.to_sym=>entity})    
    page.replace entity.id.to_s+'_'+entity_model_name+'_li', :partial=>entity_model_name.pluralize+"/"+entity_model_name+'_li', :locals=>arguments
    page.visual_effect :pulsate, entity.id.to_s+'_'+entity_model_name+'_list_title'

    unless entity_model_name=='known_object'
      page<<"addExpansionMarksForUL($('#{entity.id.to_s}_"+entity_model_name+"_li').parentNode.parentNode.parentNode)"
    end
    
    page.delay() do
      page<<"click($('#{entity.id.to_s}_"+entity_model_name+"_list_title'))"
      page<<"instantInputFlag=true;"
    end
  end

  # graceful failure for instant create
  def fail_instant_update(message="Update failed.")
    page.alert(message)
    page<<"instantInputFlag=true;"
  end

  def image_for(entity, entity_model_name)
    image_tag url_for(:controller=>entity_model_name.pluralize,
                      :action=>"get_picture",
                      :id=>entity.id),
                      :alt=>"No Image"
  end
  
  def image_for_concept(entity, entity_model_name)
	if entity.avatar_file_name
		image_tag entity.avatar.url
	else
		image_tag "/images/none.jpg"
	end
  end


  # the image link to comments
  def comment_link
    link_to_function "<img alt='' src='/images/comment.png' />", "toggleComments()", :id=>"comment_link"
  end

  # construct the pop menu
  def pop_menu(entity_model_name, entity, size, maxlength, hidden_fields={})
    html='<ul>'
    html+=  '<li>'
    html+=    '<a>Insert</a>'
    html+=    '<ul>'
    html+=      '<li>'
    html+=        link_to_function("Sibling", "projectEditWhenEnterPressed(getProjectTreeSelectedListTitle(), getProjectTreeHoveredListTitle())", :class=>"pop_link", :authenticity_token => form_authenticity_token )
    html+=      '</li>'
    html+=      '<li>'
    html+=        link_to_function("Child", "projectEditWhenTabPressed(getProjectTreeSelectedListTitle())", :class=>"pop_link", :authenticity_token => form_authenticity_token)
    html+=      '</li>'
    html+=    '</ul>'
    html+=  '</li>'
    html+=  '<li>'
    html+=    link_to_function("Edit", instant_edit(entity_model_name, entity, size, maxlength, hidden_fields), :class=>"pop_link", :authenticity_token => form_authenticity_token)
    html+=  '</li>'
    html+=  '<li>'
    html+=    link_to_remote("Delete",  :url=>{:controller=>entity_model_name.pluralize,
                                              :action=>:destroy,
                                              :id=>entity.id},
                                        :method=>:delete,
                                        :confirm=>'Are you sure to delete?',
                                        :class=>"pop_link")
    html+=  '</li>'
    html+='</ul>'

    render :update do |page|
      page.replace_html :pop_menu, html
    end
  end

  # construct the object pop menu
  def object_pop_menu(known_object, size, maxlength, hidden_fields={})
    html='<ul>'
    if hidden_fields[:entity_model_name]=='concept'
      concept= FunctionStructureDiagram.find(hidden_fields[:function_structure_diagram_id]).concept
      if concept.has_object?(known_object)
        html+=  '<li>'
        if known_object.function_structure_diagrams.length!=1 #known_object.concepts.length!=1 || known_object.is_project_object?
          html+=    link_to_remote('Detach', :url=>{:controller=>:known_objects, :action=>:detach, :id=>known_object.id, :concept_id=>concept.id})
        else
          html+=    link_to_remote('Detach', :url=>{:controller=>:known_objects, :action=>:detach, :id=>known_object.id, :concept_id=>concept.id}, :confirm=>"This object is only attached to this concept. do you want to delete it?")
        end
        html+=  '</li>'
      else
        html+=  '<li>'
        html+=    link_to_remote('Attach', :url=>{:controller=>:known_objects, :action=>:attach, :id=>known_object.id, :concept_id=>concept.id})
        html+=  '</li>'
      end
    end
    html+=  '<li>'
    html+=    link_to_function("Edit", instant_edit("known_object",known_object, size, maxlength, hidden_fields), :class=>"pop_link")
    html+=  '</li>'
    html+=  '<li>'
    html+=    link_to_remote("Delete",  :url=>{:controller=>:known_objects,
                                              :action=>:destroy,
                                              :id=>known_object.id},
                                        :method=>:delete,
                                        :confirm=>'Are you sure to delete?',
                                        :class=>"pop_link")
    html+=  '</li>'
    html+='</ul>'

    render :update do |page|
      page.replace_html :object_pop_menu, html
    end
  end

  # the destroy effect 
  def visual_destroy(element_li_id, transfer_list_title_id=nil)
    if transfer_list_title_id
      page<<"click($('#{transfer_list_title_id}'))"
    end
    page.visual_effect :Squish, element_li_id  #Puff, Fold, Squish, SwitchOff

    page.delay(1) do
      page.remove element_li_id
      if transfer_list_title_id
        page<<"addExpansionMarksForUL($('#{transfer_list_title_id}').parentNode.parentNode);"
      end
    end
  end
  
   def errors_for(object, message=nil)
    html = ""
    unless object.errors.blank?
      html << "<div class='fieldWithErrors #{object.class.name.humanize.downcase}Errors'>\n"
      if message.blank?
        if object.new_record?
          html << "\t\t<h5>There was a problem creating the #{object.class.name.humanize.downcase}</h5>\n"
        else
          html << "\t\t<h5>There was a problem updating the #{object.class.name.humanize.downcase}</h5>\n"
        end    
      else
        html << "<h5>#{message}</h5>"
      end  
      html << "\t\t<ul>\n"
      object.errors.full_messages.each do |error|
        html << "\t\t\t<li>#{error}</li>\n"
      end
      html << "\t\t</ul>\n"
      html << "\t</div>\n"
    end
    html.html_safe
  end  
  
  # PROTOTYPE LEGACY HELPER
  # Yelnil Gabo
  # June 2011
  
  # Creates a button with an onclick event which calls a remote action
  # via XMLHttpRequest
  # The options for specifying the target with :url
  # and defining callbacks is the same as link_to_remote.
  def button_to_remote(name, options = {}, html_options = {})
    button_to_function(name, remote_function(options), html_options)
  end

  # Returns a button input tag with the element name of +name+ and a value (i.e., display text) of +value+
  # that will submit form using XMLHttpRequest in the background instead of a regular POST request that
  # reloads the page.
  #
  #  # Create a button that submits to the create action
  #  #
  #  # Generates: <input name="create_btn" onclick="new Ajax.Request('/testing/create',
  #  #     {asynchronous:true, evalScripts:true, parameters:Form.serialize(this.form)});
  #  #     return false;" type="button" value="Create" />
  #  <%= submit_to_remote 'create_btn', 'Create', :url => { :action => 'create' } %>
  #
  #  # Submit to the remote action update and update the DIV succeed or fail based
  #  # on the success or failure of the request
  #  #
  #  # Generates: <input name="update_btn" onclick="new Ajax.Updater({success:'succeed',failure:'fail'},
  #  #      '/testing/update', {asynchronous:true, evalScripts:true, parameters:Form.serialize(this.form)});
  #  #      return false;" type="button" value="Update" />
  #  <%= submit_to_remote 'update_btn', 'Update', :url => { :action => 'update' },
  #     :update => { :success => "succeed", :failure => "fail" }
  #
  # <tt>options</tt> argument is the same as in form_remote_tag.
  def submit_to_remote(name, value, options = {})
    options[:with] ||= 'Form.serialize(this.form)'

    html_options = options.delete(:html) || {}
    html_options[:name] = name

    button_to_remote(value, options, html_options)
  end

  # Returns a link to a remote action defined by <tt>options[:url]</tt>
  # (using the url_for format) that's called in the background using
  # XMLHttpRequest. The result of that request can then be inserted into a
  # DOM object whose id can be specified with <tt>options[:update]</tt>.
  # Usually, the result would be a partial prepared by the controller with
  # render :partial.
  #
  # Examples:
  #   # Generates: <a href="#" onclick="new Ajax.Updater('posts', '/blog/destroy/3', {asynchronous:true, evalScripts:true});
  #   #            return false;">Delete this post</a>
  #   link_to_remote "Delete this post", :update => "posts",
  #     :url => { :action => "destroy", :id => post.id }
  #
  #   # Generates: <a href="#" onclick="new Ajax.Updater('emails', '/mail/list_emails', {asynchronous:true, evalScripts:true});
  #   #            return false;"><img alt="Refresh" src="/images/refresh.png?" /></a>
  #   link_to_remote(image_tag("refresh"), :update => "emails",
  #     :url => { :action => "list_emails" })
  #
  # You can override the generated HTML options by specifying a hash in
  # <tt>options[:html]</tt>.
  #
  #   link_to_remote "Delete this post", :update => "posts",
  #     :url  => post_url(@post), :method => :delete,
  #     :html => { :class  => "destructive" }
  #
  # You can also specify a hash for <tt>options[:update]</tt> to allow for
  # easy redirection of output to an other DOM element if a server-side
  # error occurs:
  #
  # Example:
  #   # Generates: <a href="#" onclick="new Ajax.Updater({success:'posts',failure:'error'}, '/blog/destroy/5',
  #   #            {asynchronous:true, evalScripts:true}); return false;">Delete this post</a>
  #   link_to_remote "Delete this post",
  #     :url => { :action => "destroy", :id => post.id },
  #     :update => { :success => "posts", :failure => "error" }
  #
  # Optionally, you can use the <tt>options[:position]</tt> parameter to
  # influence how the target DOM element is updated. It must be one of
  # <tt>:before</tt>, <tt>:top</tt>, <tt>:bottom</tt>, or <tt>:after</tt>.
  #
  # The method used is by default POST. You can also specify GET or you
  # can simulate PUT or DELETE over POST. All specified with <tt>options[:method]</tt>
  #
  # Example:
  #   # Generates: <a href="#" onclick="new Ajax.Request('/person/4', {asynchronous:true, evalScripts:true, method:'delete'});
  #   #            return false;">Destroy</a>
  #   link_to_remote "Destroy", :url => person_url(:id => person), :method => :delete
  #
  # By default, these remote requests are processed asynchronous during
  # which various JavaScript callbacks can be triggered (for progress
  # indicators and the likes). All callbacks get access to the
  # <tt>request</tt> object, which holds the underlying XMLHttpRequest.
  #
  # To access the server response, use <tt>request.responseText</tt>, to
  # find out the HTTP status, use <tt>request.status</tt>.
  #
  # Example:
  #   # Generates: <a href="#" onclick="new Ajax.Request('/words/undo?n=33', {asynchronous:true, evalScripts:true,
  #   #            onComplete:function(request){undoRequestCompleted(request)}}); return false;">hello</a>
  #   word = 'hello'
  #   link_to_remote word,
  #     :url => { :action => "undo", :n => word_counter },
  #     :complete => "undoRequestCompleted(request)"
  #
  # The callbacks that may be specified are (in order):
  #
  # <tt>:loading</tt>::       Called when the remote document is being
  #                           loaded with data by the browser.
  # <tt>:loaded</tt>::        Called when the browser has finished loading
  #                           the remote document.
  # <tt>:interactive</tt>::   Called when the user can interact with the
  #                           remote document, even though it has not
  #                           finished loading.
  # <tt>:success</tt>::       Called when the XMLHttpRequest is completed,
  #                           and the HTTP status code is in the 2XX range.
  # <tt>:failure</tt>::       Called when the XMLHttpRequest is completed,
  #                           and the HTTP status code is not in the 2XX
  #                           range.
  # <tt>:complete</tt>::      Called when the XMLHttpRequest is complete
  #                           (fires after success/failure if they are
  #                           present).
  #
  # You can further refine <tt>:success</tt> and <tt>:failure</tt> by
  # adding additional callbacks for specific status codes.
  #
  # Example:
  #   # Generates: <a href="#" onclick="new Ajax.Request('/testing/action', {asynchronous:true, evalScripts:true,
  #   #            on404:function(request){alert('Not found...? Wrong URL...?')},
  #   #            onFailure:function(request){alert('HTTP Error ' + request.status + '!')}}); return false;">hello</a>
  #   link_to_remote word,
  #     :url => { :action => "action" },
  #     404 => "alert('Not found...? Wrong URL...?')",
  #     :failure => "alert('HTTP Error ' + request.status + '!')"
  #
  # A status code callback overrides the success/failure handlers if
  # present.
  #
  # If you for some reason or another need synchronous processing (that'll
  # block the browser while the request is happening), you can specify
  # <tt>options[:type] = :synchronous</tt>.
  #
  # You can customize further browser side call logic by passing in
  # JavaScript code snippets via some optional parameters. In their order
  # of use these are:
  #
  # <tt>:confirm</tt>::      Adds confirmation dialog.
  # <tt>:condition</tt>::    Perform remote request conditionally
  #                          by this expression. Use this to
  #                          describe browser-side conditions when
  #                          request should not be initiated.
  # <tt>:before</tt>::       Called before request is initiated.
  # <tt>:after</tt>::        Called immediately after request was
  #                          initiated and before <tt>:loading</tt>.
  # <tt>:submit</tt>::       Specifies the DOM element ID that's used
  #                          as the parent of the form elements. By
  #                          default this is the current form, but
  #                          it could just as well be the ID of a
  #                          table row or any other DOM element.
  # <tt>:with</tt>::         A JavaScript expression specifying
  #                          the parameters for the XMLHttpRequest.
  #                          Any expressions should return a valid
  #                          URL query string.
  #
  #                          Example:
  #
  #                            :with => "'name=' + $('name').value"
  #
  # You can generate a link that uses AJAX in the general case, while
  # degrading gracefully to plain link behavior in the absence of
  # JavaScript by setting <tt>html_options[:href]</tt> to an alternate URL.
  # Note the extra curly braces around the <tt>options</tt> hash separate
  # it as the second parameter from <tt>html_options</tt>, the third.
  #
  # Example:
  #   link_to_remote "Delete this post",
  #     { :update => "posts", :url => { :action => "destroy", :id => post.id } },
  #     :href => url_for(:action => "destroy", :id => post.id)
  def link_to_remote(name, options = {}, html_options = nil)
    link_to_function(name, remote_function(options), html_options || options.delete(:html))
  end

  # Returns a form tag that will submit using XMLHttpRequest in the
  # background instead of the regular reloading POST arrangement. Even
  # though it's using JavaScript to serialize the form elements, the form
  # submission will work just like a regular submission as viewed by the
  # receiving side (all elements available in <tt>params</tt>). The options for
  # specifying the target with <tt>:url</tt> and defining callbacks is the same as
  # +link_to_remote+.
  #
  # A "fall-through" target for browsers that doesn't do JavaScript can be
  # specified with the <tt>:action</tt>/<tt>:method</tt> options on <tt>:html</tt>.
  #
  # Example:
  #   # Generates:
  #   #      <form action="/some/place" method="post" onsubmit="new Ajax.Request('',
  #   #      {asynchronous:true, evalScripts:true, parameters:Form.serialize(this)}); return false;">
  #   form_remote_tag :html => { :action =>
  #     url_for(:controller => "some", :action => "place") }
  #
  # The Hash passed to the <tt>:html</tt> key is equivalent to the options (2nd)
  # argument in the FormTagHelper.form_tag method.
  #
  # By default the fall-through action is the same as the one specified in
  # the <tt>:url</tt> (and the default method is <tt>:post</tt>).
  #
  # form_remote_tag also takes a block, like form_tag:
  #   # Generates:
  #   #     <form action="/" method="post" onsubmit="new Ajax.Request('/',
  #   #     {asynchronous:true, evalScripts:true, parameters:Form.serialize(this)});
  #   #     return false;"> <div><input name="commit" type="submit" value="Save" /></div>
  #   #     </form>
  #   <% form_remote_tag :url => '/posts' do -%>
  #     <div><%= submit_tag 'Save' %></div>
  #   <% end -%>
  def form_remote_tag(options = {}, &block)
    options[:form] = true

    options[:html] ||= {}
    options[:html][:onsubmit] =
      (options[:html][:onsubmit] ? options[:html][:onsubmit] + "; " : "") +
      "#{remote_function(options)}; return false;"

    form_tag(options[:html].delete(:action) || url_for(options[:url]), options[:html], &block)
  end

  # Creates a form that will submit using XMLHttpRequest in the background
  # instead of the regular reloading POST arrangement and a scope around a
  # specific resource that is used as a base for questioning about
  # values for the fields.
  #
  # === Resource
  #
  # Example:
  #   <% remote_form_for(@post) do |f| %>
  #     ...
  #   <% end %>
  #
  # This will expand to be the same as:
  #
  #   <% remote_form_for :post, @post, :url => post_path(@post), :html => { :method => :put, :class => "edit_post", :id => "edit_post_45" } do |f| %>
  #     ...
  #   <% end %>
  #
  # === Nested Resource
  #
  # Example:
  #   <% remote_form_for([@post, @comment]) do |f| %>
  #     ...
  #   <% end %>
  #
  # This will expand to be the same as:
  #
  #   <% remote_form_for :comment, @comment, :url => post_comment_path(@post, @comment), :html => { :method => :put, :class => "edit_comment", :id => "edit_comment_45" } do |f| %>
  #     ...
  #   <% end %>
  #
  # If you don't need to attach a form to a resource, then check out form_remote_tag.
  #
  # See FormHelper#form_for for additional semantics.
  def remote_form_for(record_or_name_or_array, *args, &proc)
    options = args.extract_options!

    case record_or_name_or_array
    when String, Symbol
      object_name = record_or_name_or_array
    when Array
      object = record_or_name_or_array.last
      object_name = ActiveModel::Naming.singular(object)
      apply_form_for_options!(record_or_name_or_array, options)
      args.unshift object
    else
      object      = record_or_name_or_array
      object_name = ActiveModel::Naming.singular(record_or_name_or_array)
      apply_form_for_options!(object, options)
      args.unshift object
    end

    form_remote_tag options do
      fields_for object_name, *(args << options), &proc
    end
  end
  alias_method :form_remote_for, :remote_form_for

  # Returns '<tt>eval(request.responseText)</tt>' which is the JavaScript function
  # that +form_remote_tag+ can call in <tt>:complete</tt> to evaluate a multiple
  # update return document using +update_element_function+ calls.
  def evaluate_remote_response
    "eval(request.responseText)"
  end

  # Observes the field with the DOM ID specified by +field_id+ and calls a
  # callback when its contents have changed. The default callback is an
  # Ajax call. By default the value of the observed field is sent as a
  # parameter with the Ajax call.
  #
  # Example:
  #  # Generates: new Form.Element.Observer('suggest', 0.25, function(element, value) {new Ajax.Updater('suggest',
  #  #         '/testing/find_suggestion', {asynchronous:true, evalScripts:true, parameters:'q=' + value})})
  #  <%= observe_field :suggest, :url => { :action => :find_suggestion },
  #       :frequency => 0.25,
  #       :update => :suggest,
  #       :with => 'q'
  #       %>
  #
  # Required +options+ are either of:
  # <tt>:url</tt>::       +url_for+-style options for the action to call
  #                       when the field has changed.
  # <tt>:function</tt>::  Instead of making a remote call to a URL, you
  #                       can specify javascript code to be called instead.
  #                       Note that the value of this option is used as the
  #                       *body* of the javascript function, a function definition
  #                       with parameters named element and value will be generated for you
  #                       for example:
  #                         observe_field("glass", :frequency => 1, :function => "alert('Element changed')")
  #                       will generate:
  #                         new Form.Element.Observer('glass', 1, function(element, value) {alert('Element changed')})
  #                       The element parameter is the DOM element being observed, and the value is its value at the
  #                       time the observer is triggered.
  #
  # Additional options are:
  # <tt>:frequency</tt>:: The frequency (in seconds) at which changes to
  #                       this field will be detected. Not setting this
  #                       option at all or to a value equal to or less than
  #                       zero will use event based observation instead of
  #                       time based observation.
  # <tt>:update</tt>::    Specifies the DOM ID of the element whose
  #                       innerHTML should be updated with the
  #                       XMLHttpRequest response text.
  # <tt>:with</tt>::      A JavaScript expression specifying the parameters
  #                       for the XMLHttpRequest. The default is to send the
  #                       key and value of the observed field. Any custom
  #                       expressions should return a valid URL query string.
  #                       The value of the field is stored in the JavaScript
  #                       variable +value+.
  #
  #                       Examples
  #
  #                         :with => "'my_custom_key=' + value"
  #                         :with => "'person[name]=' + prompt('New name')"
  #                         :with => "Form.Element.serialize('other-field')"
  #
  #                       Finally
  #                         :with => 'name'
  #                       is shorthand for
  #                         :with => "'name=' + value"
  #                       This essentially just changes the key of the parameter.
  #
  # Additionally, you may specify any of the options documented in the
  # <em>Common options</em> section at the top of this document.
  #
  # Example:
  #
  #   # Sends params: {:title => 'Title of the book'} when the book_title input
  #   # field is changed.
  #   observe_field 'book_title',
  #     :url => 'http://example.com/books/edit/1',
  #     :with => 'title'
  #
  #
  def observe_field(field_id, options = {})
    if options[:frequency] && options[:frequency] > 0
      build_observer('Form.Element.Observer', field_id, options)
    else
      build_observer('Form.Element.EventObserver', field_id, options)
    end
  end

  # Observes the form with the DOM ID specified by +form_id+ and calls a
  # callback when its contents have changed. The default callback is an
  # Ajax call. By default all fields of the observed field are sent as
  # parameters with the Ajax call.
  #
  # The +options+ for +observe_form+ are the same as the options for
  # +observe_field+. The JavaScript variable +value+ available to the
  # <tt>:with</tt> option is set to the serialized form by default.
  def observe_form(form_id, options = {})
    if options[:frequency]
      build_observer('Form.Observer', form_id, options)
    else
      build_observer('Form.EventObserver', form_id, options)
    end
  end

  # Periodically calls the specified url (<tt>options[:url]</tt>) every
  # <tt>options[:frequency]</tt> seconds (default is 10). Usually used to
  # update a specified div (<tt>options[:update]</tt>) with the results
  # of the remote call. The options for specifying the target with <tt>:url</tt>
  # and defining callbacks is the same as link_to_remote.
  # Examples:
  #  # Call get_averages and put its results in 'avg' every 10 seconds
  #  # Generates:
  #  #      new PeriodicalExecuter(function() {new Ajax.Updater('avg', '/grades/get_averages',
  #  #      {asynchronous:true, evalScripts:true})}, 10)
  #  periodically_call_remote(:url => { :action => 'get_averages' }, :update => 'avg')
  #
  #  # Call invoice every 10 seconds with the id of the customer
  #  # If it succeeds, update the invoice DIV; if it fails, update the error DIV
  #  # Generates:
  #  #      new PeriodicalExecuter(function() {new Ajax.Updater({success:'invoice',failure:'error'},
  #  #      '/testing/invoice/16', {asynchronous:true, evalScripts:true})}, 10)
  #  periodically_call_remote(:url => { :action => 'invoice', :id => customer.id },
  #     :update => { :success => "invoice", :failure => "error" }
  #
  #  # Call update every 20 seconds and update the new_block DIV
  #  # Generates:
  #  # new PeriodicalExecuter(function() {new Ajax.Updater('news_block', 'update', {asynchronous:true, evalScripts:true})}, 20)
  #  periodically_call_remote(:url => 'update', :frequency => '20', :update => 'news_block')
  #
  def periodically_call_remote(options = {})
     frequency = options[:frequency] || 10 # every ten seconds by default
     code = "new PeriodicalExecuter(function() {#{remote_function(options)}}, #{frequency})"
     javascript_tag(code)
  end

  protected
    def build_observer(klass, name, options = {})
      if options[:with] && (options[:with] !~ /[\{=(.]/)
        options[:with] = "'#{options[:with]}=' + encodeURIComponent(value)"
      else
        options[:with] ||= 'value' unless options[:function]
      end

      callback = options[:function] || remote_function(options)
      javascript  = "new #{klass}('#{name}', "
      javascript << "#{options[:frequency]}, " if options[:frequency]
      javascript << "function(element, value) {"
      javascript << "#{callback}}"
      javascript << ")"
      javascript_tag(javascript)
    end


  
end
