# Filters added to this controller only apply to known objects controller.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class KnownObjectsController < ApplicationController

  before_filter :protect

  # GET /known_objects
  # GET /known_objects.xml
  def index
    @known_objects = KnownObject.all

    respond_to do |format|
      format.html # index.rhtml
      format.xml  { render :xml => @known_objects.to_xml }
    end
  end

  # GET /known_objects/1
  # GET /known_objects/1.xml
  def show
    @known_object = KnownObject.find(:id)

    respond_to do |format|
      format.html # show.rhtml
      format.xml  { render :xml => @known_object.to_xml }
    end
  end

  # GET /known_objects/new
  def new
    @known_object = KnownObject.new
    @title="New Object"
  end

  # GET /known_objects/1;edit
  def edit
    @known_object = KnownObject.find(params[:id])
  end

  # POST /known_objects
  # POST /known_objects.xml
  def create
    @known_object = KnownObject.new(params[:known_object])
    @known_object.project_id=session[:project_id]
    
    if params[:concept_id]
      @concept=Concept.find(params[:concept_id])
    end
    @project=Project.find(session[:project_id])

    if @concept
      @function_structure_diagram=@concept.function_structure_diagram
      @entity_model_name="concept"
    else
      @function_structure_diagram=@project.function_structure_diagram
      @entity_model_name="project"
    end

    respond_to do |format|
      if KnownObject.create_with_ownership(@known_object, @function_structure_diagram)
        flash[:notice] = 'KnownObject was successfully created.'
        format.html { redirect_to project_url(session[:project_id]) }
        format.xml  { head :created, :location => known_object_url(@known_object) }
        format.js #create.rjs
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @known_object.errors.to_xml }
        format.js do
          render :update do |page|
            page.fail_instant_create
          end
        end
      end
    end
  end

  # PUT /known_objects/1
  # PUT /known_objects/1.xml
  def update
    @known_object = KnownObject.find(params[:id])
    #@function_structure_diagram=FunctionStructureDiagram.find(:function_structure_diagram_id)
    #@entity_model_name=params[:entity_model_name]

    respond_to do |format|
      if @known_object.update_attributes(params[:known_object])
        flash[:notice] = 'KnownObject was successfully updated.'
        format.html { redirect_to project_url(session[:project_id]) }
        format.xml  { head :ok }
        format.js #update.rjs
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @known_object.errors.to_xml }
        format.js do
          render :update do |page|
            page.fail_instant_update
          end
        end
      end
    end
  end

  # DELETE /known_objects/1
  # DELETE /known_objects/1.xml
  def destroy
    @known_object = KnownObject.find(params[:id])
    @known_object.destroy
    

    respond_to do |format|
      format.html { redirect_to known_objects_url }
      format.xml  { head :ok }
      format.js #destroy.rjs
    end
  end

  # called when a known object is attached to a concept
  def attach
    @concept=Concept.find(params[:concept_id])
    @known_object=KnownObject.find(params[:id])
    @function_structure_diagram=FunctionStructureDiagram.find(@concept.function_structure_diagram.id)
    @entity_model_name="concept"

    @condition="available_object"
    if not @known_object.is_available_to?(@concept)
      @condition="unavailable_object"
    end  

    ObjectOwnership.create(:function_structure_diagram_id=>@concept.function_structure_diagram.id, :known_object_id=>@known_object.id)
    

    respond_to do |format|
      format.js #attach.rjs
    end
  end

  # called when a known object is detached from a concept
  def detach
    @concept=Concept.find(params[:concept_id])
    @known_object=KnownObject.find(params[:id])
    @function_structure_diagram=FunctionStructureDiagram.find(@concept.function_structure_diagram.id)
    @entity_model_name="concept"

    object_ownership=ObjectOwnership.find_by_function_structure_diagram_id_and_known_object_id(@concept.function_structure_diagram.id, @known_object.id)
    object_ownership.destroy

    
    if @known_object.is_available_to?(@concept)
      @condition="shared_available_object"
    else
      @condition="shared_unavailable_object"
    end
    
    if @known_object.object_ownerships.length==0
      @known_object.destroy
      @condition="unshared_object"
    end

    respond_to do |format|
      format.js #detach.rjs
    end
  end


  # Destroy multiple objects
  def destroy_multiple
    selected_ids=params[:selected_ids].split(",")
    selected_ids.each{|selected_id| KnownObject.find(selected_id).destroy}
    @function_structure_diagram=FunctionStructureDiagram.find(params[:function_structure_diagram_id])
    @known_objects=@function_structure_diagram.known_objects

    respond_to do |format|
      format.js  #destroy_multiple.rjs
    end
    
  end
end
