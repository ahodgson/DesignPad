# Filters added to this controller only apply to concepts controller.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class ConceptsController < ApplicationController

  before_filter :protect

  # GET /concepts
  # GET /concepts.xml
  def index
    @concepts = Concept.find(:all)

    respond_to do |format|
      format.html # index.rhtml
      format.xml  { render :xml => @concepts.to_xml }
    end
  end

  # GET /concepts/1
  # GET /concepts/1.xml
  def show
    @concept = Concept.find(params[:id])

    respond_to do |format|
      format.html # show.rhtml
      format.xml  { render :xml => @concept.to_xml }
    end
  end

  # GET /concepts/new
  def new
    @concept = Concept.new
  end

  # GET /concepts/1;edit
  def edit
    @concept = Concept.find(params[:id])
  end

  # POST /concepts
  # POST /concepts.xml
  def create
    @concept_category_id=params[:concept][:concept_category_id]
    @name=params[:concept][:name]
    @concept=Concept.create_with_default_function_structure_diagram(session[:user_id], @concept_category_id, @name)

    respond_to do |format|
      if not @concept.nil?
        flash[:notice] = 'Concept was successfully created.'
        format.html { redirect_to concept_url(@concept) }
        format.xml  { head :created, :location => concept_url(@concept) }        
        format.js #instant_create.rjs
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @concept.errors.to_xml }
        format.js do
          render :update do |page|
            page.fail_instant_create
          end
        end
      end
    end

  end

  # PUT /concepts/1
  # PUT /concepts/1.xml
  def update
    @concept = Concept.find(params[:id])

    respond_to do |format|
      if @concept.update_attributes(params[:concept])
        flash[:notice] = 'Concept was successfully updated.'
        format.html { redirect_to :id=>session[:project_id], :action=>"edit", :controller=>"projects", :concept_id=>@concept.id }
        format.xml  { head :ok }
        format.js #update.rjs
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @concept.errors.to_xml }
        format.js do
          render :update do |page|
            page.fail_instant_update
          end
        end
      end
    end
  end

  # DELETE /concepts/1
  # DELETE /concepts/1.xml
  def destroy
    @concept = Concept.find(params[:id])
    @concept.destroy

    respond_to do |format|
      format.html { redirect_to concepts_url }
      format.xml  { head :ok }
      format.js #destroy.rjs
    end
  end

  # called when list title is clicked
  def when_list_title_clicked
    @concept_id=params[:concept_id]
    @concept=Concept.find(@concept_id)
    
    @function_structure_diagram=@concept.function_structure_diagram
    @entity_model_name='concept'

    @known_objects=@concept.function_structure_diagram.known_objects
    
    respond_to do |format|
      format.js #when_list_title_clicked.rjs
    end
  end

   def delete_avatar
    @concept_id=params[:id]
    @concept=Concept.find(@concept_id)

    respond_to do |format|
      if @concept.update_attribute(:avatar_file_name, nil)
        flash[:notice]="Avatar has been deleted."
        format.html {redirect_to :id=>@concept_id, :action=>"edit", :controller=>"concepts"}
      else
        format.html { render :nothing => true }
      end
    end
  end
  
  # called when a diagram is being deleted, updates the picutre to null
  def delete_picture
    @concept_id=params[:id]
    @concept=Concept.find(@concept_id)

    respond_to do |format|
      if @concept.update_attribute(:picture, nil)
        flash[:notice]="Diagram has been deleted."
        format.html {redirect_to :id=>session[:project_id], :action=>"edit", :controller=>"projects"}
      else
        format.html { render :nothing => true }
      end
    end
  end

  def get_picture
     @concept=Concept.find(params[:id])
	 
     #send_data(@concept.picture, :type=>'image/jpeg')
  end
  
end
