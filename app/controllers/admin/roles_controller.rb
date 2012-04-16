class Admin::RolesController < Admin::AdminController
  before_filter :require_user
  
  def index
    @roles = Role.all
  end

  def show
    @role = Role.find(params[:id], :include => :users)
  end

  def create
    @role = Role.new(params[:role])

    if @role.save
      respond_to do |format|
        format.html { redirect_to admin_roles_path, 
          :notice => "Role was sucessfully created."}
      end
    else
      respond_to do |format|
        format.html { redirect_to new_admin_role_path,
          :error => "Role could not be created." }
      end
    end
  end

  def edit
    @role = Role.find(params[:id])
  end

  def update
    @role = Role.find(params[:id])

    respond_to do |format|
      if @role.update_attributes(params[:role])
        format.html { redirect_to admin_roles_path, 
          notice: "Role was sucessfully updated."}
      else
        format.html { render :action => "edit" }
      end
    end
  end

end
