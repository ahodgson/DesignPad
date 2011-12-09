# Filters added to this controller only apply to function structure diagrams controller.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class FunctionStructureDiagramsController < ApplicationController

  before_filter :protect

  # GET /function_structure_diagrams
  # GET /function_structure_diagrams.xml
  def index
    @function_structure_diagrams = FunctionStructureDiagram.find(:all)

    respond_to do |format|
      format.html # index.rhtml
      format.xml  { render :xml => @function_structure_diagrams.to_xml }
    end
  end

  # GET /function_structure_diagrams/1
  # GET /function_structure_diagrams/1.xml
  def show
    @function_structure_diagram = FunctionStructureDiagram.find(params[:id])

    respond_to do |format|
      format.html { render :layout => false } # show.rhtml
      format.xml  { render :xml => @function_structure_diagram.to_xml }
      format.json { render json: @function_structure_diagram }
    end
  end

  # GET /function_structure_diagrams/new
  def new
    @function_structure_diagram = FunctionStructureDiagram.new
  end

  # GET /function_structure_diagrams/1;edit
  def edit
    @function_structure_diagram = FunctionStructureDiagram.find(params[:id])
  end

  # POST /function_structure_diagrams
  # POST /function_structure_diagrams.xml
  def create
    @project_id=params[:function_structure_diagram][:project_id]
    @concept_id=params[:function_structure_diagram][:concept_id]
    @name=params[:function_structure_diagram][:name]
    if @project_id
      @project=Project.find(@project_id) if @project_id
      @function_structure_diagram=@project.function_structure_diagram
    elsif @concept_id
      @concept=Concept.find(@concept_id) if @concept_id
      @function_structure_diagram=@concept.function_structure_diagram
    end

    respond_to do |format|
      if @name.length>0 && @function_structure_diagram.update_attribute(:name, @name)
        flash[:notice] = 'Function Structure Diagram was successfully created.'
        format.html { redirect_to function_structure_diagram_url(@function_structure_diagram) }
        format.xml  { head :created, :location => function_structure_diagram_url(@function_structure_diagram) }
        format.js #instant_create.rjs
        format.json { render json: @function_structure_diagram, status: :created, location: @function_structure_diagram }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @function_structure_diagram.errors.to_xml }
        format.js do
          render :update do |page|
            page.fail_instant_create
          end
        end
        format.json { render json: @function_structure_diagram.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /function_structure_diagrams/1
  # PUT /function_structure_diagrams/1.xml
  def update
    @function_structure_diagram = FunctionStructureDiagram.find(params[:id])

    # check needed because project_id is nil when updating through the JIT SpaceTree
    if not session[:project_id].nil?
      respond_to do |format|
        if @function_structure_diagram.update_attributes(params[:function_structure_diagram])
          flash[:notice] = 'Function Structure Diagram was successfully updated.'
          format.html { redirect_to :id=>session[:project_id], :action=>"edit", :controller=>"projects", :function_structure_diagram_id=>@function_structure_diagram.id }
          format.xml  { head :ok }
          format.js #update.rjs
        else
          format.html { render :action => "edit" }
          format.xml  { render :xml => @function_structure_diagram.errors.to_xml }
          format.js do
            render :update do |page|
              page.fail_instant_update
            end
          end
        end
      end
    # for the JIT SpaceTree
    else
      respond_to do |format|
        if @function_structure_diagram.update_attributes(params[:function_structure_diagram])
          format.html { redirect_to @function_structure_diagram, notice: 'Function Structure Diagram was successfully updated.' }
        else
          format.html { render action: "edit" }
        end
      end
    end
  end

  # DELETE /function_structure_diagrams/1
  # DELETE /function_structure_diagrams/1.xml
  def destroy
    @function_structure_diagram = FunctionStructureDiagram.find(params[:id])
    @function_structure_diagram.update_attribute(:name, nil)

    respond_to do |format|
      format.html { redirect_to function_structure_diagrams_url }
      format.xml  { head :ok }
      format.js #destroy.rjs
    end
  end

  # called when list title is clicked
  def when_list_title_clicked
    @function_structure_diagram_id=params[:function_structure_diagram_id]
    @function_structure_diagram=FunctionStructureDiagram.find(@function_structure_diagram_id)
    @entity_model_name='function_structure_diagram'
    respond_to do |format|
      format.js #when_list_title_clicked.rjs
    end
  end

  # called when a diagram is being deleted, updates the picutre to null
  def delete_picture
    @function_structure_diagram_id=params[:id]
    @function_structure_diagram=FunctionStructureDiagram.find(@function_structure_diagram_id)

    respond_to do |format|
      if @function_structure_diagram.update_attribute(:picture, nil)
        flash[:notice]="Diagram has been deleted."
        format.html {redirect_to :id=>session[:project_id], :action=>"edit", :controller=>"projects", :function_structure_diagram_id=>@function_structure_diagram_id}
      else
        format.html { render :nothing => true }
      end
    end
  end

  # function to fetch the picture from database for displaying
  def get_picture
     @function_structure_diagram=FunctionStructureDiagram.find(params[:id])
     send_data(@function_structure_diagram.picture, :type=>'image/jpeg')
  end

end
