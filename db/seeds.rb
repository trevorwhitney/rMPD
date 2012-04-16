%w{Administrator Member}.each do |role|
  Role.create(:name => role)
end

admin = User.new do |u|
  u.first_name = "Joe"
  u.last_name = "Admin"
  u.password = "password"
  u.password_confirmation = "password"
  u.username = "administrator"
  u.email = "JoeAdmin@gamez.com"
  u.role_ids = [1]
end

member = User.new do |u|
  u.first_name = "Joe"
  u.last_name = "Member"
  u.password = "password"
  u.password_confirmation = "password"
  u.username = "member"
  u.email = "JoeMember@gamez.com"
  u.role_ids = [2]
end

admin.save
member.save