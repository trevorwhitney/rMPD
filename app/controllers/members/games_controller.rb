class Members::GamesController < Members::MembersController
  before_filter :require_user

  def index
    if current_user.is_admin?
      redirect_to admin_users_path
    end
  end

end