# This is the database migration class for teams.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class CreateTeams < ActiveRecord::Migration
  def self.up
    create_table :teams do |t|
      #t.column :user_id, :integer, :null=>false  #creator
      t.column :name, :string
      t.column :created_at, :timestamp, :default=>"0000-00-00 00:00:00"
      t.column :updated_at, :timestamp, :default=>"0000-00-00 00:00:00"
    end
  end

  def self.down
    drop_table :teams
  end
end
