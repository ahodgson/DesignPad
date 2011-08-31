# This is the database migration class for concept categories.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class CreateConceptCategories < ActiveRecord::Migration
  def self.up
    create_table :concept_categories do |t|
      t.column :function_id,  :integer, :null=>false
      t.column :name,         :string,  :null=>false
      t.column :description,  :text
      t.column :created_at, :timestamp, :default=>"0000-00-00 00:00:00"
      t.column :updated_at, :timestamp, :default=>"0000-00-00 00:00:00"
    end
  end

  def self.down
    drop_table :concept_categories
  end
end
