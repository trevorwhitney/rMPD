module Admin::RolesHelper

  def role_actions(role)
    @role = role
    render "actions"
  end

  def view_role(role)
    link_to image_tag('magnifier.png'), admin_role_path(role), :title => 'View role'
  end

  def edit_role(role)
    link_to image_tag('page_edit.png'), edit_admin_role_path(role), 
      :title => 'Edit role'
  end

  def delete_role(role)
    link_to image_tag('bin.png'), admin_role_path(role), confirm: 'Are you sure?', 
      :method => :delete, :title => 'Delete role'
  end

end
