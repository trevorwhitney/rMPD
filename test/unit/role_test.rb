require 'test_helper'

class RoleTest < ActiveSupport::TestCase

  test "role requires a name" do
    role = roles(:member)
    role.name = nil

    assert !role.valid?

    role.name = "Member"
    assert role.valid?
  end
  
end
