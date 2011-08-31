# This is the database migration class for adding authorization token to user.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class AddAuthorizationToken < ActiveRecord::Migration
  def self.up
    add_column :users, :authorization_token, :string
  end

  def self.down
    remove_column :users, :authorization_token
  end
end
