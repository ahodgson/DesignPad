# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class ApplicationController < ActionController::Base
  protect_from_forgery
  include ApplicationHelper
  before_filter :check_authorization
  
  # Pick a unique cookie name to distinguish our session data from others'
 # session :session_key => '_design_pad_session_id'
  
  # Check for a valid authorization cookie, possibly logging the user in.
  # 
  # @param: none
  # @return: boolean value
  def check_authorization
    authorization_token = cookies[:authorization_token]
    if authorization_token and not logged_in?
      user = User.find_by_authorization_token(authorization_token)
      user.login!(session) if user
    end
  end
  
  # return true if a parameter corresponding to the given symbol was posted
  #
  # @param: symbol indicating the variable name
  # @return: boolean value
  def param_posted?(symbol)
    request.post? and params[symbol]
  end
  
  # protect a page from unauthorized access
  #
  # @param: none
  # @return: boolean value
  def protect
    unless logged_in?
      session[:protected_page]=request.fullpath
      flash[:notice]="Please log in first"
      redirect_to :controller=>"user", :action=>"login"
      return false;
    end
  end
  
end

