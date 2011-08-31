# Filters added to this controller only apply to functions controller.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class FunctionsController < ApplicationController

  before_filter :protect

  # GET /functions
  # GET /functions.xml
  def index
    @functions = Function.all
 
    respond_to do |format|
      format.html # index.rhtml
      format.xml  { render :xml => @functions.to_xml }
    end
  end

  # GET /functions/1
  # GET /functions/1.xml
  def show
    @function = Function.find(params[:id])

    respond_to do |format|
      format.html # show.rhtml
      format.xml  { render :xml => @function.to_xml }
    end
  end

  # GET /functions/new
  def new
    @function = Function.new
  end

  # GET /functions/1;edit
  def edit
    make_function_vars
  end

  # POST /functions
  # POST /functions.xml
  def create
    @function = Function.new(params[:function])
    @project= Project.find(session[:project_id])
    @function_structure_diagram_id=@project.function_structure_diagram.id

    if params[:function][:function_structure_diagram_id]
      @function_structure_diagram_id=params[:function][:function_structure_diagram_id]
    end
    
    @name=params[:function][:name]
    @function=Function.create_with_default_category(@function_structure_diagram_id, @name)

    respond_to do |format|
      if not @function.nil? #@function_structure_diagram.functions<<@function
        flash[:notice] = 'Function was successfully created.'
        format.html { redirect_to project_url(@project) }
        format.xml  { head :created, :location => function_url(@function) }
        format.js #create.rjs
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @function.errors.to_xml }
        format.js do
          render :update do |page|
            page.fail_instant_create
          end
        end
      end
    end
  end

  def instant_create
    

  end


  # PUT /functions/1
  # PUT /functions/1.xml
  def update
    make_function_vars
    @attribute=params[:attribute]

    respond_to do |format|
      if @function.update_attributes(params[:function])
        flash[:notice] = 'Function was successfully updated.'
        format.html { redirect_to project_url(@project) }
        format.xml  { head :ok }
        format.js #update.rjs
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @function.errors.to_xml }
        format.js do
          render :update do |page|
            page.fail_instant_update
          end
        end
      end
    end
  end

  # DELETE /functions/1
  # DELETE /functions/1.xml
  def destroy
    @function = Function.find(params[:id])
    @function.destroy

    respond_to do |format|
      format.html { redirect_to functions_url }
      format.xml  { head :ok }
      format.js #destroy.rjs
    end
  end

  # When clicked
  def when_list_title_clicked
    @function_id=params[:function_id]
    @function=Function.find(@function_id)

    @function_structure_diagram=@function.function_structure_diagram
    @entity_model_name='function'

    @known_objects=@function.function_structure_diagram.known_objects
    
    respond_to do |format|
      format.js #when_list_title_clicked.rjs
    end
  end

  # destroy multiple functions
  def destroy_multiple
    selected_ids=params[:selected_ids].split(",")
    selected_ids.each{|selected_id| Function.find(selected_id).destroy}
    @function_structure_diagram=FunctionStructureDiagram.find(params[:function_structure_diagram_id])
    @functions=@function_structure_diagram.functions

    respond_to do |format|
      format.js  #delete.rjs
    end

  end

  private

  # assign some useful variables for other functions
  def make_function_vars
    @function = Function.find(params[:id])
    @function_structure_diagram=@function.function_structure_diagram
    @project = Project.find(session[:project_id])
    @known_objects=@function_structure_diagram.known_objects
    @concept_categories=@function.concept_categories #<<ConceptCategory.new({:name=>"Unclassified"})
    @title="Edit Function #{@function.name}"
  end
  
end
