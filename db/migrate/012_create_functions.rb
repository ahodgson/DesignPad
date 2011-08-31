# This is the database migration class for functions.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class CreateFunctions < ActiveRecord::Migration
  def self.up
    create_table :functions do |t|      
      t.column :function_structure_diagram_id,  :integer, :null=>false     
      t.column :object1_id,                     :integer
      t.column :object2_id,                     :integer
      t.column :relation,                       :string
      t.column :name,                           :string
      t.column :description,                    :text
      t.column :picture,                        :mediumblob
      t.column :created_at, :timestamp, :default=>"0000-00-00 00:00:00"
      t.column :updated_at, :timestamp, :default=>"0000-00-00 00:00:00"
    end
  end

  def self.down
    drop_table :functions
  end
end
