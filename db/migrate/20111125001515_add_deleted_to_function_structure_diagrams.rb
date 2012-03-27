class AddDeletedToFunctionStructureDiagrams < ActiveRecord::Migration
  def self.up
    add_column :function_structure_diagrams, :deleted, :boolean, :default => false
  end

  def self.down
    remove_column :function_structure_diagrams, :deleted
  end
end
