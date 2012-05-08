class ClientsController < ApplicationController
  filter_access_to :all
  before_filter :require_user

  def index
  end
end
