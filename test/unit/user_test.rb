require 'test_helper'

class UserTest < ActiveSupport::TestCase

  test "is_admin?" do
    assert users(:admin).is_admin?
    assert !users(:member).is_admin?
  end


  test "last_login" do
    user = users(:admin)

    #test minutes ago
    user.last_login_at = 2.minutes.ago
    assert_equal "Two minutes ago", user.last_login(Time.now)

    #test hours ago
    user.last_login_at = 3.hours.ago
    assert_equal "Three hours ago", user.last_login(Time.now)
    user.last_login_at = Time.now.yesterday
    assert_equal "Yesterday", user.last_login(Time.now)

    #test days
    user.last_login_at = Time.now.yesterday
    assert_equal "Yesterday", user.last_login(Time.now)
    user.last_login_at = 4.days.ago
    assert_equal "Four days ago", user.last_login(Time.now)

    #test weeks
    user.last_login_at = 1.weeks.ago
    assert_equal "One week ago", user.last_login(Time.now)

    #test months
    user.last_login_at = 5.months.ago
    assert_equal "Five months ago", user.last_login(Time.now)

    #test years
    user.last_login_at = 2.years.ago
    assert_equal "Over a year ago", user.last_login(Time.now)
  end

  test "full_name" do
    assert_equal "Joe Admin", users(:admin).full_name
    assert_equal "Joe Member", users(:member).full_name
  end

  test "role_symbols" do
    assert_equal [:administrator], users(:admin).role_symbols
    assert_equal [:member], users(:member).role_symbols

    users(:admin).roles << Role.find_by_name("member")
    assert_equal [:administrator, :member], users(:admin).role_symbols
  end

end
