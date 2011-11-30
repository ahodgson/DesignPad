class AddDeletedToConcepts < ActiveRecord::Migration
  def self.up
    add_column :concepts, :deleted, :boolean, :default => false
  end

  def self.down
    remove_column :concepts, :deleted
  end
end
