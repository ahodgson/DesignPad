# Filters added to this controller only apply to users controller.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

require 'digest/sha1'

class UserController < ApplicationController
  
  include ApplicationHelper
  helper :profile
  before_filter :protect, :only=>[:index, :edit, :edit_password]
  
  # edit the user's basic info
  def edit
    @title = "Edit basic info"
    @user=User.find(session[:user_id])
    if param_posted?(:user)
      attribute = params[:attribute]
      case attribute
        when "email"
          try_to_update @user, attribute
        when "password"
          if @user.correct_password?(params)
            try_to_update @user, attribute
          else
            @user.password_errors(params)
          end
        when "team_id"
          try_to_update @user, attribute
      end
    end   
    #For security purpose, never fill in password fields automatically.
    @user.clear_password!
  end

  # index.rhtml
  def index   
    @title="Design Pad User Hub"
    @user=User.find(session[:user_id])    
    @spec= @user.spec||=Spec.new
    @team=@user.team
    if @team
      @projects=@team.projects
    end
  end

  # register.rhtml
  # register a new account 
  def register
    @title="Register"
    if param_posted?(:user)
      
      #output goes to log file (log/development.log in development mode)
      #logger.info params[:user].inspect
      
      #output goes to browser
      #raise params[:user].inspect
      
      @user=User.new(params[:user])
      if @user.save
        @user.login!(session)
        flash[:notice] = "User #{@user.screen_name} created!"
        redirect_to_forwarding_url
      else
        @user.clear_password!
      end
    end
  end

  # login.rhtml
  # log into the system
  def login
    @title="Log in to Design Pad"
    if request.get?
      @user=User.new(:remember_me=>remember_me_string)
    elsif param_posted?(:user)
      @user=User.new(params[:user])
      user=User.find_by_screen_name_and_password(@user.screen_name, @user.password)
      if user
        user.login!(session)
        @user.remember_me? ? user.remember!(cookies) : user.forget!(cookies)
        flash[:notice]= "User #{user.screen_name} logged in!"
        redirect_to_forwarding_url
      else
        @user.clear_password!
        flash[:notice]= "Invalid screen name/password combination"
      end
    end
  end

  # log out of the system
  def logout
    User.logout!(session,cookies)
    flash[:notice]="Logged out"
    redirect_to :action=>"index", :controller=>"site"
  end
  
  
  private
  
  # redirect to the previously requested URL (if present)
  def redirect_to_forwarding_url
    if(redirect_url=session[:protected_page])
        session[:protected_page]=nil
        redirect_to redirect_url
    else
        redirect_to :action=>"index"
    end
  end

  # returns the remember me string
  def remember_me_string
    cookies[:remember_me]||"0"
  end
  
  # try to update the user, redirecting if successful
  def try_to_update(user, attribute)
    if user.update_attributes(params[:user])
      flash[:notice] = "User #{attribute} updated."
      redirect_to :action=>"index"
    end
  end

end
