# This is the model class for object ownership.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class ObjectOwnership < ActiveRecord::Base
  belongs_to :known_object
  belongs_to :function_structure_diagram

  # validations
  validates_presence_of :function_structure_diagram_id, :known_object_id

  # Return true if the ownership exists between known_object and function_structure_diagram
  def self.exists?(function_structure_diagram, known_object)
    not find_by_function_structure_diagram_id_and_known_object_id(function_structure_diagram, known_object).nil?
  end

  # create the ownership between known_object and function_structure_diagram
  def self.associate(function_structure_diagram, known_object)
    unless ObjectOwnership.exists?(function_structure_diagram, known_object)
      create(:function_structure_diagram=>function_structure_diagram, :known_object=>known_object)
    end
  end
  
end
