# This is the database migration class for adding timestamps to user.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class AddUserTimestamps < ActiveRecord::Migration
  def self.up
    add_column :users, :created_at, :timestamp
    add_column :users, :updated_at, :timestamp
  end

  def self.down
    remove_column :users, :created_at
    remove_column :users, :updated_at
  end
end
