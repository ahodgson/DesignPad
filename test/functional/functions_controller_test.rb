require File.dirname(__FILE__) + '/../test_helper'
require 'functions_controller'

# Re-raise errors caught by the controller.
class FunctionsController; def rescue_action(e) raise e end; end

class FunctionsControllerTest < Test::Unit::TestCase
  fixtures :functions

  def setup
    @controller = FunctionsController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:functions)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_function
    old_count = Function.count
    post :create, :function => { }
    assert_equal old_count+1, Function.count
    
    assert_redirected_to function_path(assigns(:function))
  end

  def test_should_show_function
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_function
    put :update, :id => 1, :function => { }
    assert_redirected_to function_path(assigns(:function))
  end
  
  def test_should_destroy_function
    old_count = Function.count
    delete :destroy, :id => 1
    assert_equal old_count-1, Function.count
    
    assert_redirected_to functions_path
  end
end
