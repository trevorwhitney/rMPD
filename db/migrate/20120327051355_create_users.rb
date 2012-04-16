class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :username
      t.string :first_name
      t.string :last_name
      t.string :email

      #Authlogic Stuff
      t.string :crypted_password
      t.string :password_salt
      t.string :persistence_token
      t.datetime :current_login_at
      t.datetime :last_login_at

      t.timestamps
    end
  end
end
