require 'test_helper'

class ClientControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
  end

end
