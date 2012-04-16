require 'test_helper'

class Members::UsersControllerTest < ActionController::TestCase
  setup :activate_authlogic

  test "guest should not be able to access any methods" do
    get :index
    assert_response :redirect

    get :edit
    assert_response :redirect

    post :update
    assert_response :redirect

    get :show
    assert_response :redirect
  end

  test "admin should be redirected" do
    login_admin

    get :index
    assert_redirected_to admin_users_path

    get :show
    assert_redirected_to admin_user_path(users(:admin))
  end

  test "member should get profile" do
    login_member

    get :show, :id => users(:member).id
    assert_response :success
  end

  test "index should redirect memeber to profile" do
    login_member

    get :index
    assert_redirected_to members_profile_path
  end

  def login_member
    UserSession.create(users(:member))
  end

  def login_admin
    UserSession.create(users(:admin))
  end 

end