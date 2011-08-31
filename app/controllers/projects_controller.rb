# Filters added to this controller only apply to projects controller.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class ProjectsController < ApplicationController
  
  before_filter :protect

  # GET /projects
  # GET /projects.xml
  def index
    redirect_to hub_url
  end

  # GET /projects/1
  # GET /projects/1.xml
  def show
    make_project_vars    
	
    respond_to do |format|
      format.html # show.rhtml
      format.xml  { render :xml => @project.to_xml }
    end
  end

  # GET /projects/new
  def new
    @project = Project.new
    respond_to do |format|
      format.js #new.rjs
    end
  end

  # GET /projects/1;edit
  def edit
    make_project_vars
    @project_id=@project.id
    @function_structure_diagram_id=params[:function_structure_diagram_id]
    @function_id=params[:function_id]
    @concept_category_id=params[:concept_category_id]
    @concept_id=params[:concept_id]
  end

  # POST /projects
  # POST /projects.xml
  def create
    @user=User.find(session[:user_id])
    @name=params[:project][:name]
    @description=params[:project][:description]
    @project=Project.create_with_default_function_structure_diagram(@user.id, @name, @description)
    @projects=@user.team.projects

    respond_to do |format|
      if @project
        flash[:notice] = 'Project was successfully created.'
        format.html { redirect_to hub_url }
        format.js # create.rjs
      else
        format.html { redirect_to hub_url }
        format.js { render :nothing => true }
      end
    end
  end

  # PUT /projects/1
  # PUT /projects/1.xml
  def update
    @project = Project.find(params[:id])

    respond_to do |format|
      if @project.update_attributes(params[:project])
        flash[:notice] = 'Project was successfully updated.'
        format.html { redirect_to project_url(@project) }
        format.xml  { head :ok }
        format.js #update.rjs
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @project.errors.to_xml }
        format.js do
          render :update do |page|
            page.fail_instant_update
          end
        end
      end
    end
  end

  # DELETE /projects/1
  # DELETE /projects/1.xml
  def destroy
    @project = Project.find(params[:id])
    @project.destroy

    @project.function_structure_diagram.destroy
    
    respond_to do |format|
      format.html { redirect_to hub_url }
      format.xml  { head :ok }
      format.js do
        render :update do |page|
          page.redirect_to hub_url
        end
      end
    end
  end

  # validates name range
  def test_name
    respond_to do |format|
      format.js #test_name.rjs
    end
  end

  # validates description range
  def test_description
    respond_to do |format|
      format.js #test_description.rjs
    end
  end

  # called when list titile is clicked
  def when_list_title_clicked
    @project_id=params[:project_id]
    @project=Project.find(@project_id)
 
    @function_structure_diagram=@project.function_structure_diagram
    @entity_model_name='project'

    respond_to do |format|
      format.js #when_list_title_clicked.rjs
    end
  end

  # refresh the project tree
  def refresh
    @project_id=params[:id]
    @project=Project.find(@project_id)

    respond_to do |format|
      format.js #refresh.rjs
    end
  end

  # assignment for variables
  def make_project_vars
    @user=User.find(session[:user_id])
    @project = Project.find(params[:id])

    @function_structure_diagram = @project.function_structure_diagram
    @known_objects=@function_structure_diagram.known_objects
    @functions=@function_structure_diagram.functions
    @title = "#{@project.name}"
	
    session[:project_id] = @project.id
  end

end
