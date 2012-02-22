# This is the model class for known object.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class KnownObject < ActiveRecord::Base
  has_many :functions, :conditions => {:deleted => false}
  has_many :object_ownerships, :dependent=>:destroy
  has_many :function_structure_diagrams, :through=>:object_ownerships, :conditions => {:deleted => false}
  belongs_to :project

  #Max & Min lengths for all fields
  NAME_MIN_LENGTH = 1
  NAME_MAX_LENGTH = 100
  DESCRIPTION_MIN_LENGTH = 5
  DESCRIPTION_MAX_LENGTH = 100
  NAME_RANGE = NAME_MIN_LENGTH..NAME_MAX_LENGTH
  DESCRIPTION_RANGE = DESCRIPTION_MIN_LENGTH..DESCRIPTION_MAX_LENGTH

  #Text box sizes for display in the views
  NAME_SIZE = 20

  # Icon path
  ICON_PATH = '/images/concept1.bmp'

  # validations
  validates_length_of :name, :within=>NAME_RANGE

  # Return all synergies (concept sharing this object) related to the object
  def concepts
    concepts=[]
    self.function_structure_diagrams.each do |function_structure_diagram|
      if not function_structure_diagram.is_for_project?
        concepts<<function_structure_diagram.concept
      end
    end
    return concepts
  end

  # Return true if the object is at top level (known_object)
  def is_project_object?
    for function_structure_diagram in self.function_structure_diagrams
      if not function_structure_diagram.project.nil?
        return true
      end
    end
    return false
  end

  # Return true if the object is available to a certian function structure diagram
  def is_available_to?(concept)
    available_known_objects=concept.function_structure_diagram.available_known_objects

    if available_known_objects.include?(self)
      return true
    else
      return false
    end
  end

  # create the object with relationship to a function structure diagram
  def self.create_with_ownership(known_object, function_structure_diagram)
    transaction do
      known_object.save!
      ObjectOwnership.associate(function_structure_diagram, known_object)
    end
  end

end
