# This is the database migration class for known objects.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class CreateKnownObjects < ActiveRecord::Migration
  def self.up
    create_table :known_objects do |t|
      t.column :project_id,                     :integer, :null=>false
      t.column :name,                           :string
      t.column :description,                    :text
      t.column :picture,                        :mediumblob
      t.column :created_at, :timestamp, :default=>"0000-00-00 00:00:00"
      t.column :updated_at, :timestamp, :default=>"0000-00-00 00:00:00"
    end
  end

  def self.down
    drop_table :known_objects
  end
end
