require "#{File.dirname(__FILE__)}/../test_helper"

class RememberMeTest < ActionController::IntegrationTest
  include ApplicationHelper

  fixtures :users
  
  def setup
    @user = users(:valid_user)
  end

  def test_remember_me
    # Log in with remember me enabled.
    post "user/login", :user => { :screen_name => @user.screen_name,
                                  :password    => @user.password, 
                                  :remember_me => "1" }
    puts session[:user_id]    # Prints "1", the string for @user.id.
    session[:user_id] = 42    # some bogus value
    puts session[:user_id]    # Prints "42".
    # Now access an arbitrary page.
    get "site/index"
    # The session has reverted to its previous value!
    puts session[:user_id]    # Prints "1"!
    # The check_authorization before_filter should have logged us in.
    assert logged_in?
    assert_equal @user.id, session[:user_id]
  end
end
