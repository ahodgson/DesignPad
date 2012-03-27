class AddDeletedToConceptCategories < ActiveRecord::Migration
  def self.up
    add_column :concept_categories, :deleted, :boolean, :default => false
  end

  def self.down
    remove_column :concept_categories, :deleted
  end
end
