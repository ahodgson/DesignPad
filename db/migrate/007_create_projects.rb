# This is the database migration class for projects.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class CreateProjects < ActiveRecord::Migration
  def self.up
    create_table :projects do |t|
      t.column :user_id,                          :integer,     :null=>false
      t.column :function_structure_diagram_id,    :integer,     :null=>false
      t.column :name,                             :string,      :null=>false
      t.column :description,                      :text
      t.column :created_at, :timestamp, :default=>"0000-00-00 00:00:00"
      t.column :updated_at, :timestamp, :default=>"0000-00-00 00:00:00"
    end
  end

  def self.down
    drop_table :projects
  end
end
