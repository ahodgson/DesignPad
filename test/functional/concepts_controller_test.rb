require File.dirname(__FILE__) + '/../test_helper'
require 'concepts_controller'

# Re-raise errors caught by the controller.
class ConceptsController; def rescue_action(e) raise e end; end

class ConceptsControllerTest < Test::Unit::TestCase
  fixtures :concepts

  def setup
    @controller = ConceptsController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:concepts)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_concept
    old_count = Concept.count
    post :create, :concept => { }
    assert_equal old_count+1, Concept.count
    
    assert_redirected_to concept_path(assigns(:concept))
  end

  def test_should_show_concept
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_concept
    put :update, :id => 1, :concept => { }
    assert_redirected_to concept_path(assigns(:concept))
  end
  
  def test_should_destroy_concept
    old_count = Concept.count
    delete :destroy, :id => 1
    assert_equal old_count-1, Concept.count
    
    assert_redirected_to concepts_path
  end
end
