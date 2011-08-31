require File.dirname(__FILE__) + '/../test_helper'
require 'function_structure_diagrams_controller'

# Re-raise errors caught by the controller.
class FunctionStructureDiagramsController; def rescue_action(e) raise e end; end

class FunctionStructureDiagramsControllerTest < Test::Unit::TestCase
  fixtures :function_structure_diagrams

  def setup
    @controller = FunctionStructureDiagramsController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:function_structure_diagrams)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_function_structure_diagram
    old_count = FunctionStructureDiagram.count
    post :create, :function_structure_diagram => { }
    assert_equal old_count+1, FunctionStructureDiagram.count
    
    assert_redirected_to function_structure_diagram_path(assigns(:function_structure_diagram))
  end

  def test_should_show_function_structure_diagram
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_function_structure_diagram
    put :update, :id => 1, :function_structure_diagram => { }
    assert_redirected_to function_structure_diagram_path(assigns(:function_structure_diagram))
  end
  
  def test_should_destroy_function_structure_diagram
    old_count = FunctionStructureDiagram.count
    delete :destroy, :id => 1
    assert_equal old_count-1, FunctionStructureDiagram.count
    
    assert_redirected_to function_structure_diagrams_path
  end
end
