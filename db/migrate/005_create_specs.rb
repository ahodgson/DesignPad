# This is the database migration class for specs.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class CreateSpecs < ActiveRecord::Migration
  def self.up
    create_table :specs do |t|
      t.column :user_id,    :integer, :null=>false
      t.column :first_name, :string, :default=>""
      t.column :last_name,  :string, :default=>""
      t.column :gender,     :string
      t.column :birthdate,  :date
      t.column :student_number, :string, :default=>""
    end
  end

  def self.down
    drop_table :specs
  end
end
