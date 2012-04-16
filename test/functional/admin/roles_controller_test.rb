require 'test_helper'

class Admin::RolesControllerTest < ActionController::TestCase
  setup :activate_authlogic

  test "shouldn't get index for guest or member" do
    #guest
    get :index
    assert_response :redirect

    #member
    login_member
    get :index
    assert_response :redirect
  end

  test "should get index for admin" do
    login_admin
    get :index
    assert_response :success
  end

  test "shouldn't create for guest or member" do
    #guest
    post :create
    assert_response :redirect

    #member
    login_member
    post :create
    assert_response :redirect
  end

  test "should create for admin" do
    role = roles(:administrator)

    login_admin
    post :create, :role => role.attributes
    assert_redirected_to admin_roles_path
    assert_equal "Role was sucessfully created.", flash[:notice]
  end

  test "shouldn't get edit for member or guest" do
    #guest
    get :edit
    assert_response :redirect

    #member
    login_member
    get :edit
    assert_response :redirect
  end

  test "should get edit for admin" do
    login_admin
    get :edit, :id => roles(:member).id
    assert_response :success
  end

  test "shouldn't update for member or guest" do
    #guest
    put :update
    assert_response :redirect

    #member
    login_member
    put :update
    assert_response :redirect
  end

  test "should update for admin" do
    role = roles(:administrator)
    role.name = nil

    login_admin
    put :update, :id => role.id, :role => role.attributes
    assert_template :edit

    role.name = "Administrator"
    put :update, :id => role.id, :role => role.attributes
    assert_redirected_to admin_roles_path
    assert_equal "Role was sucessfully updated.", flash[:notice]
  end

  def login_member
    UserSession.create(users(:member))
  end

  def login_admin
    UserSession.create(users(:admin))
  end

end
