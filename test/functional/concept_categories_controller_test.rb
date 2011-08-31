require File.dirname(__FILE__) + '/../test_helper'
require 'concept_categories_controller'

# Re-raise errors caught by the controller.
class ConceptCategoriesController; def rescue_action(e) raise e end; end

class ConceptCategoriesControllerTest < Test::Unit::TestCase
  fixtures :concept_categories

  def setup
    @controller = ConceptCategoriesController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:concept_categories)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_concept_category
    old_count = ConceptCategory.count
    post :create, :concept_category => { }
    assert_equal old_count+1, ConceptCategory.count
    
    assert_redirected_to concept_category_path(assigns(:concept_category))
  end

  def test_should_show_concept_category
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_concept_category
    put :update, :id => 1, :concept_category => { }
    assert_redirected_to concept_category_path(assigns(:concept_category))
  end
  
  def test_should_destroy_concept_category
    old_count = ConceptCategory.count
    delete :destroy, :id => 1
    assert_equal old_count-1, ConceptCategory.count
    
    assert_redirected_to concept_categories_path
  end
end
