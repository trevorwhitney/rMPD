Gamez::Application.routes.draw do

  resources :user_sessions, :only => [:new, :create, :destroy]

  match '/login' => 'user_sessions#new', :as => :login
  match '/logout' => 'user_sessions#destroy', :as => :logout

  root :to => 'user_sessions#new'

  namespace :admin do
    resources :users
    resources :roles
    root :controller => 'admin', :action => 'index'
  end

  namespace :members do
    resources :games
    resources :users
    match '/profile', :controller => 'users', :action => 'show', 
      :as => :profile
    match '/profile/edit', :controller => 'users', :action => 'edit',
      :as => :edit_profile
    match '/profile/:id', :controller => 'users', :action => 'update',
      :as => :update_profile
    root :controller => 'games', :action => 'index'
  end
  
end
