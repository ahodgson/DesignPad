require File.dirname(__FILE__) + '/../test_helper'
require 'teams_controller'

# Re-raise errors caught by the controller.
class TeamsController; def rescue_action(e) raise e end; end

class TeamsControllerTest < Test::Unit::TestCase
  fixtures :teams

  def setup
    @controller = TeamsController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:teams)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_team
    old_count = Team.count
    post :create, :team => { }
    assert_equal old_count+1, Team.count
    
    assert_redirected_to team_path(assigns(:team))
  end

  def test_should_show_team
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_team
    put :update, :id => 1, :team => { }
    assert_redirected_to team_path(assigns(:team))
  end
  
  def test_should_destroy_team
    old_count = Team.count
    delete :destroy, :id => 1
    assert_equal old_count-1, Team.count
    
    assert_redirected_to teams_path
  end
end
