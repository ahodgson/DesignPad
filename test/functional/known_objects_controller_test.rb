require File.dirname(__FILE__) + '/../test_helper'
require 'known_objects_controller'

# Re-raise errors caught by the controller.
class KnownObjectsController; def rescue_action(e) raise e end; end

class KnownObjectsControllerTest < Test::Unit::TestCase
  fixtures :known_objects

  def setup
    @controller = KnownObjectsController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:known_objects)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_known_object
    old_count = KnownObject.count
    post :create, :known_object => { }
    assert_equal old_count+1, KnownObject.count
    
    assert_redirected_to known_object_path(assigns(:known_object))
  end

  def test_should_show_known_object
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_known_object
    put :update, :id => 1, :known_object => { }
    assert_redirected_to known_object_path(assigns(:known_object))
  end
  
  def test_should_destroy_known_object
    old_count = KnownObject.count
    delete :destroy, :id => 1
    assert_equal old_count-1, KnownObject.count
    
    assert_redirected_to known_objects_path
  end
end
