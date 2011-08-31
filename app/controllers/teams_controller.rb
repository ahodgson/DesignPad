# Filters added to this controller only apply to teams controller.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class TeamsController < ApplicationController
  
  before_filter :protect
  
  # GET /teams
  # GET /teams.xml
  def index
    @teams = Team.find(:all)

    respond_to do |format|
      format.html # index.rhtml
      format.xml  { render :xml => @teams.to_xml }
    end
  end

  # GET /teams/1
  # GET /teams/1.xml
  def show
    @team = Team.find(params[:id])

    respond_to do |format|
      format.html # show.rhtml
      format.xml  { render :xml => @team.to_xml }
    end
  end

  # GET /teams/new
  def new
    @team = Team.new
    respond_to do |format|
      format.js #new.rjs
    end
  end

  # GET /teams/1;edit
  def edit
    @team = Team.find(params[:id])
  end

  # POST /teams
  # POST /teams.xml
  def create
    @team = Team.new(params[:team])
    @user=User.find(session[:user_id])
    @projects=@team.projects

    respond_to do |format|
      if @user.create_team(@team)
        flash[:notice] = 'Team was successfully created.'
        format.html { redirect_to hub_url }
        format.xml  { head :created, :location => team_url(@team) }
        format.js #create.rjs
      else
        format.html { redirect_to hub_url }
        format.xml  { render :xml => @team.errors.to_xml }
      end
    end
  end

  # PUT /teams/1
  # PUT /teams/1.xml
  def update
    @team = Team.find(params[:id])

    respond_to do |format|
      if @team.update_attributes(params[:team])
        flash[:notice] = 'Team was successfully updated.'
        format.html { redirect_to team_url(@team) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @team.errors.to_xml }
      end
    end
  end

  # DELETE /teams/1
  # DELETE /teams/1.xml
  def destroy
    @team = Team.find(params[:id])
    @team.destroy

    respond_to do |format|
      format.html { redirect_to teams_url }
      format.xml  { head :ok }
    end
  end

  # validates name range
  def test_name
    respond_to do |format|
      format.js #test_name.rjs
    end
  end
end
