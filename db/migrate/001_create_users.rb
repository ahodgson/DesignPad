# This is the database migration class for users.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class CreateUsers < ActiveRecord::Migration
  def self.up
    create_table :users do |t|
      t.column :team_id, :integer
      t.column :screen_name, :string
      t.column :email, :string
      t.column :password, :string
    end
  end

  def self.down
    drop_table :users
  end
end
