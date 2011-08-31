class AddImageRemoteUrlToConcept < ActiveRecord::Migration
  def self.up
    add_column :concepts, :image_remote_url, :string
  end

  def self.down
    remove_column :concepts, :image_remote_url
  end
end