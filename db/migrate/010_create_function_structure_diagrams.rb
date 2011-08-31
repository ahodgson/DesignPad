# This is the database migration class for function structure diagrams.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class CreateFunctionStructureDiagrams < ActiveRecord::Migration
  def self.up
    create_table :function_structure_diagrams do |t|
      t.column :user_id,      :integer, :null=>false  #creator
      t.column :name,         :string
      t.column :description,  :text
      t.column :picture,      :mediumblob
      t.column :created_at, :timestamp, :default=>"0000-00-00 00:00:00"
      t.column :updated_at, :timestamp, :default=>"0000-00-00 00:00:00"
    end
  end

  def self.down
    drop_table :function_structure_diagrams
  end
end
