require 'test_helper'

class Admin::UsersControllerTest < ActionController::TestCase
  setup :activate_authlogic

  test "should not get new for member or guest" do
    #guest
    get :new
    assert_response :redirect

    #member
    UserSession.create(users(:member))
    get :new
    assert_response :redirect
  end

  test "should get new for admin" do
    UserSession.create(users(:admin))
    get :new
    assert_response :success
  end


  test "shouldn't get edit for guest or member" do
    #guest
    get :edit
    assert_response :redirect

    #member
    UserSession.create(users(:member))
    get :edit
    assert_response :redirect
  end

  test "should get edit for admin" do
    UserSession.create(users(:admin))
    get :edit, :id => users(:member).id
    assert_response :success
  end

  test "shouldn't get index for guest or member" do
    #guest
    get :index
    assert_response :redirect

    #member
    UserSession.create(users(:member))
    get :index
    assert_response :redirect
  end

  test "should get index for admin" do
    UserSession.create(users(:admin))
    get :index
    assert_response :success
  end

  test "shouldn't get show for guest or member" do
    #guest
    get :show
    assert_response :redirect

    #member
    get :show
    assert_response :redirect
  end

  test "should get show for admin" do
    UserSession.create(users(:admin))
    get :show, :id => users(:member).id
    assert_response :success
  end

  test "shouldn't create for guest or member" do
    #guest
    post :create
    assert_response :redirect

    #member
    UserSession.create(users(:member))
    post :create
    assert_response :redirect
  end

  test "should create for admin" do
    new_user_attr = {
      :username => "new_user",
      :password => "password",
      :first_name => "New",
      :last_name => "User",
      :email => "newuser@new.com"
    }

    UserSession.create(users(:admin))

    #test failure
    post :create, :user => new_user_attr
    assert_redirected_to new_admin_user_path

    #test success
    new_user_attr[:password_confirmation] = "password"
    post :create, :user => new_user_attr
    assert_redirected_to root_url
    assert_equal "Registration suceeded.", flash[:notice]
  end

  test "shouldn't update for guest or member" do
    #guest
    post :update
    assert_response :redirect

    #member
    UserSession.create(users(:member))
    post :update
    assert_response :redirect
  end

  test "should update for admin" do
    user = users(:member)
    user.username = nil

    #test failure
    UserSession.create(users(:admin))
    put :update, { :id => user.id, :user => user.attributes }
    assert_redirected_to edit_admin_user_path(user)

    #test success
    user.username = 'member'
    put :update, { :id => user, :attributes => user.attributes }
    assert_redirected_to admin_users_path
    assert_equal 'User was successfully updated.', flash[:notice]
  end

end
