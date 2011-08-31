# This is the database migration class for object ownerships.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class CreateObjectOwnerships < ActiveRecord::Migration
  def self.up
    create_table :object_ownerships do |t|
      t.column :function_structure_diagram_id,  :integer, :null=>false
      t.column :known_object_id,  :integer, :null=>false
      t.column :created_at, :timestamp, :default=>"0000-00-00 00:00:00"
      t.column :updated_at, :timestamp, :default=>"0000-00-00 00:00:00"
    end
  end

  def self.down
    drop_table :object_ownerships
  end
end
