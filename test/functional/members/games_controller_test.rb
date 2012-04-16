require 'test_helper'

class Members::GamesControllerTest < ActionController::TestCase
  setup :activate_authlogic

  test "guest should not get index" do
    get :index
    assert_response :redirect
  end

  test "member should get index" do
    login_member
    get :index
    assert_response :success
  end

  test "admin should be redirected" do
    login_admin
    get :index
    assert_redirected_to admin_users_path
  end

  def login_member
    UserSession.create(users(:member))
  end

  def login_admin
    UserSession.create(users(:admin))
  end 

end