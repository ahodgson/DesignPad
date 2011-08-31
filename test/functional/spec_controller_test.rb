require File.dirname(__FILE__) + '/../test_helper'
require 'spec_controller'

# Re-raise errors caught by the controller.
class SpecController; def rescue_action(e) raise e end; end

class SpecControllerTest < Test::Unit::TestCase
  def setup
    @controller = SpecController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  # Replace this with your real tests.
  def test_truth
    assert true
  end
end
