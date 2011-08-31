# This is the model class for function structure diagram.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class FunctionStructureDiagram < ActiveRecord::Base
  has_many :functions, :dependent=>:destroy
  has_many :object_ownerships, :dependent=>:destroy
  has_many :known_objects, :through=>:object_ownerships
  has_one :project, :dependent=>:destroy
  has_one :concept, :dependent=>:destroy
  belongs_to :user

  # lengths
  NAME_MIN_LENGTH = 1
  NAME_MAX_LENGTH = 100
  NAME_RANGE=NAME_MIN_LENGTH..NAME_MAX_LENGTH
  
  #Text box sizes for display in the views
  NAME_SIZE = 20
  
  # Icon path
  ICON_PATH = '/images/function_structure_diagram.jpg'

  # Return the default function structure diagram name for project
  def self.default_name_for_project(project_name)
    "Base FSD For "+project_name
  end

  # Return the default function structure diagram name for concept
  def self.default_name_for_concept(concept_name)
    "FSD For "+concept_name
  end

  # Return true if the function structure diagram name exists
  def exist?
    not self.name.nil?
  end

  # Return true if the function structure diagram has picture
  def has_picture?
    not self.picture.nil?
  end

  # Return true if the function structure diagram is for project
  def is_for_project?
    not self.project.nil?
  end

  # Return all availale known objects for the function structure diagram
  def available_known_objects
    known_objects=self.known_objects
    if not self.project.nil?
      return known_objects
    else
      upper_level_known_objects=self.concept.concept_category.function.function_structure_diagram.available_known_objects
      return (upper_level_known_objects + known_objects).uniq
    end
  end

  # Return all known objects for the project with project_id in the order that
  # available objects followed by unavailable objects
  def ordered_all_known_objects(project_id)
    available_known_objects=self.available_known_objects
    other_known_objects=KnownObject.find(:all, :conditions=>["project_id = ?", project_id]) - available_known_objects
    return (available_known_objects + other_known_objects)
  end

  # Save uploaded picture to database
  # This method name must be different from "picture", because "picture=" is a default method.
  # It must be as same as the field name for uploading.
  def diagram=(diagram_in)
    self.picture=diagram_in.read
  end
  
end
