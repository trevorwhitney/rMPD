class ApplicationController < ActionController::Base
  protect_from_forgery

  helper_method :current_user

  before_filter :set_current_user

  protected

  def permission_denied
    flash[:error] = "You do not have permission to access #{request.path}"
    redirect_to root_url
  end

  def set_current_user
    Authorization.current_user = current_user
  end

  def require_user
    unless current_user
      store_location
      flash[:notice] = "You must be logged in to access this page"
      redirect_to new_user_session_url
      return false
    end
  end

  def require_no_user
    if current_user
      store_location
      flash[:notice] = "You must be logged out to access this page"
      redirect_to account_url
      return false
    end
  end

  def current_user_session
    return @current_user_session if defined?(@current_user_session)
    @current_user_session = UserSession.find
  end

  def current_user
    @current_user = current_user_session && current_user_session.record
  end

end
