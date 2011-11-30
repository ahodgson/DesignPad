class AddDeletedToFunctions < ActiveRecord::Migration
  def self.up
    add_column :functions, :deleted, :boolean, :default => false
  end

  def self.down
    remove_column :functions, :deleted
  end
end
