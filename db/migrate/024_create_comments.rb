# This is the database migration class for comments.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class CreateComments < ActiveRecord::Migration
  def self.up
    create_table :comments do |t|
      t.column :user_id, :integer, :null=>false
      t.column :concept_id, :integer
      
      t.column :body,       :text
      t.column :created_at, :timestamp
      t.column :updated_at, :timestamp
    end
  end

  def self.down
    drop_table :comments
  end
end
