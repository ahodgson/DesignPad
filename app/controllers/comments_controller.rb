# Filters added to this controller only apply to comments controller.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class CommentsController < ApplicationController

  helper :profile
  include ProfileHelper
  before_filter :protect, :load_entity

  # GET /comments
  # GET /comments.xml
  def index
    @comments = Comment.find(:all)

    respond_to do |format|
      format.html # index.rhtml
      format.xml  { render :xml => @comments.to_xml }
    end
  end

  # GET /comments/1
  # GET /comments/1.xml
  def show
    @comment = Comment.find(params[:id])

    respond_to do |format|
      format.html # show.rhtml
      format.xml  { render :xml => @comment.to_xml }
    end
  end

  # GET /comments/new
  def new
    @comment = Comment.new
    respond_to do |format|
      format.html # new.rhtml
      format.js   # new.rjs
    end
  end

  # GET /comments/1;edit
  def edit
    @comment = Comment.find(params[:id])
  end

  # POST /comments
  # POST /comments.xml
  def create
    @comment = Comment.new(params[:comment])
    @comment.user = User.find(session[:user_id])
    if not @concept.nil?
      @comment.concept = @concept
    end

    respond_to do |format|
      if not @concept.nil?
        if @comment.duplicate_for_concept? or @concept.comments << @comment
          format.html { redirect_to :controller=>:projects, :action=>"edit", :id=>session[:project_id] }
          format.js # create.rjs
        else
          format.html { redirect_to new_comment_for_concept_url }
          format.js { render :nothing => true }
        end
      end
    end
  end


  # PUT /comments/1
  # PUT /comments/1.xml
  def update
    @comment = Comment.find(params[:id])

    respond_to do |format|
      if @comment.update_attributes(params[:comment])
        flash[:notice] = 'Comment was successfully updated.'
        format.html { redirect_to comment_url(@comment) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @comment.errors.to_xml }
      end
    end
  end

  # DELETE /comments/1
  # DELETE /comments/1.xml
  def destroy
    @comment = Comment.find(params[:id])
    user = User.find(session[:user_id])
    if @comment.authorized?(user)
      @comment.destroy
    else
      redirect_to hub_url
      return
    end

    respond_to do |format|
      format.html { redirect_to comments_url }
      format.xml  { head :ok }
      format.js # destroy.rjs
    end
  end

  private

  # filter function as a prerequisite
  def load_entity
    if params[:concept_id]
      @concept = Concept.find(params[:concept_id])
      #@entity=@concept
    end
  end
  
end
