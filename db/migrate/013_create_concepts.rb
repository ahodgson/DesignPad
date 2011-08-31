# This is the database migration class for concepts.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class CreateConcepts < ActiveRecord::Migration
  def self.up
    create_table :concepts do |t|
      t.column :user_id,                        :integer, :null=>false
      t.column :function_structure_diagram_id,  :integer, :null=>false
      t.column :concept_category_id,            :integer, :null=>false
      t.column :name,                           :string
      t.column :description,                    :text
      t.column :picture,                        :mediumblob
      t.column :created_at, :timestamp, :default=>"0000-00-00 00:00:00"
      t.column :updated_at, :timestamp, :default=>"0000-00-00 00:00:00"
    end
	
  end

  def self.down
    drop_table :concepts
  end
  
end
