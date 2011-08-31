# Provide tasks to load and delete sample user data.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

require 'active_record'
require 'active_record/fixtures'

namespace :db do
  DATA_DIRECTORY = "#{Rails.root.to_s}/lib/tasks/sample_data"
  namespace :sample_data do 
    TABLES = %w(users specs teams projects 
                function_structure_diagrams 
                functions concepts concept_categories
                known_objects
                object_ownerships)
    MIN_ID = 1000    # Starting user id for the sample data
  
    desc "Load sample data"
    task :load => :environment do |t|
      class_name = nil    # Use nil to get Rails to figure out the class.
      TABLES.each do |table_name|
        fixture = Fixtures.new(ActiveRecord::Base.connection, 
                               table_name, class_name, 
                               File.join(DATA_DIRECTORY, table_name.to_s))
        fixture.insert_fixtures
        puts "Loaded data from #{table_name}.yml"
      end
    end
      
    desc "Remove sample data" 
    task :delete => :environment do |t|
      User.delete_all("id      >= #{MIN_ID}")
      Spec.delete_all("id      >= #{MIN_ID}")
      Team.delete_all("id      >= #{MIN_ID}")
      Project.delete_all("id      >= #{MIN_ID}")
      FunctionStructureDiagram.delete_all("id      >= #{MIN_ID}")
      Function.delete_all("id      >= #{MIN_ID}")
      Concept.delete_all("id      >= #{MIN_ID}")
      ConceptCategory.delete_all("id      >= #{MIN_ID}")
      KnownObject.delete_all("id      >= #{MIN_ID}")
      ObjectOwnership.delete_all("id      >= #{MIN_ID}")
      #Spec.delete_all("user_id >= #{MIN_USER_ID}")
    end
  end
end