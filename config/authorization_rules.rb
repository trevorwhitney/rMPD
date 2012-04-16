authorization do
  role :guest do
  end

  role :administrator do
    has_permission_on [:admin_users, :admin_roles], 
      :to => [:index, :show, :edit, :create, :update, :destroy, :new]
    has_permission_on [:members_games, :members_users],
      :to => :index
    has_permission_on :members_users, :to => :show
  end

  role :member do
    has_permission_on :members_games,
      :to => [:index, :show, :edit, :create, :update, :destroy, :new]
    has_permission_on :members_users,
      :to => [:show, :edit, :update, :index]
  end

end