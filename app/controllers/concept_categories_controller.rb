# Filters added to this controller only apply to concept categories controller.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class ConceptCategoriesController < ApplicationController

  before_filter :protect

  # GET /concept_categories
  # GET /concept_categories.xml
  def index
    @concept_categories = ConceptCategory.find(:all)

    respond_to do |format|
      format.html # index.rhtml
      format.xml  { render :xml => @concept_categories.to_xml }
    end
  end

  # GET /concept_categories/1
  # GET /concept_categories/1.xml
  def show
    @concept_category = ConceptCategory.find(params[:id])

    respond_to do |format|
      format.html # show.rhtml
      format.xml  { render :xml => @concept_category.to_xml }
    end
  end

  # GET /concept_categories/new
  def new
    @concept_category = ConceptCategory.new
    respond_to do |format|
      format.js #new.rjs
    end
  end

  # GET /concept_categories/1;edit
  def edit
    @concept_category = ConceptCategory.find(params[:id])
  end

  # POST /concept_categories
  # POST /concept_categories.xml
  def create
    @concept_category = ConceptCategory.new(params[:concept_category])

    respond_to do |format|
      if @concept_category.save
        flash[:notice] = 'ConceptCategory was successfully created.'
        format.html { redirect_to concept_category_url(@concept_category) }
        format.xml  { head :created, :location => concept_category_url(@concept_category) }
        format.js #instant_create.rjs
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @concept_category.errors.to_xml }
        format.js do
          render :update do |page|
            page.fail_instant_create
          end
        end
      end
    end

  end

  # PUT /concept_categories/1
  # PUT /concept_categories/1.xml
  def update
    @concept_category = ConceptCategory.find(params[:id])

    respond_to do |format|
      if @concept_category.update_attributes(params[:concept_category])
        flash[:notice] = 'ConceptCategory was successfully updated.'
        format.html { redirect_to concept_category_url(@concept_category) }
        format.xml  { head :ok }
        format.js #update.rjs
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @concept_category.errors.to_xml }
        format.js do
          render :update do |page|
            page.fail_instant_update
          end
        end
      end
    end
  end

  # DELETE /concept_categories/1
  # DELETE /concept_categories/1.xml
  def destroy
    @concept_category = ConceptCategory.find(params[:id])
    
    if(@concept_category.name==ConceptCategory::NO_CATEGORY)
      respond_to do |format|
        format.js do
          render :update do |page|
            page.alert("This Category can not be deleted.")
          end
        end
      end

      return;
    end

    @concepts=Concept.find(:all, :conditions=>['concept_category_id=?', @concept_category.id])
    @function=@concept_category.function
    @existing_concepts_for_no_category_before_delete=Concept.find(:all, :conditions=>['concept_category_id=?', @function.no_category().id])
    @concept_category.release
    @concept_category.destroy

    respond_to do |format|
      format.html { redirect_to concept_categories_url }
      format.xml  { head :ok }
      format.js #destroy.rjs
    end
  end

  # called when list title is clicked
  def when_list_title_clicked
    @concept_category_id=params[:concept_category_id]
    @concept_category=ConceptCategory.find(@concept_category_id)   
    @function_structure_diagram=@concept_category.function.function_structure_diagram
    @entity_model_name='concept_category'

    respond_to do |format|
      format.js #when_list_title_clicked.rjs
    end
  end

  # called when a concept is dropped into a category
  def receive_concept
    @element_to_move_id=params[:element_to_move_id]
    @post_concept_category_id=params[:post_concept_category_id]
    @post_concept_category=ConceptCategory.find(@post_concept_category_id)

    @concept_id=@element_to_move_id.split('_')[0]
    @concept=Concept.find(@concept_id)
    
    @previous_concept_category_id=@concept.concept_category_id
    @previous_concept_category=ConceptCategory.find(@previous_concept_category_id)
    
    @existing_concepts_for_post_category_before_drag=Concept.find(:all, :conditions=>['concept_category_id=?', @post_concept_category_id])
    @concept.update_attribute(:concept_category_id, @post_concept_category_id)
    @existing_concepts_for_previous_category_after_drag=Concept.find(:all, :conditions=>['concept_category_id=?', @previous_concept_category_id])

    respond_to do |format|
      format.js #receive_concept.rjs
    end
  end
end
