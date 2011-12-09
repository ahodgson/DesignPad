# This is the model class for project.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class Project < ActiveRecord::Base
  belongs_to :user  #the creater of the project
  belongs_to :function_structure_diagram
  has_many :known_objects, :dependent=>:destroy

  # Length ranges
  NAME_MIN_LENGTH = 1
  NAME_MAX_LENGTH = 115 # changed from 100 to 120 because of a project's base FSD's initial defaulted name, which includes the project name
  DESCRIPTION_MIN_LENGTH = 5
  DESCRIPTION_MAX_LENGTH = 100
  NAME_RANGE = NAME_MIN_LENGTH..NAME_MAX_LENGTH
  DESCRIPTION_RANGE = DESCRIPTION_MIN_LENGTH..DESCRIPTION_MAX_LENGTH

  # Html sizes
  NAME_SIZE = 50

  # Icon path
  ICON_PATH='/images/project.jpg'

  # validations
  validates_uniqueness_of :description, :scope => [:name, :user_id]
  validates_uniqueness_of :name
  validates_length_of :name, :within=>NAME_RANGE
  validates_length_of :description, :within=>DESCRIPTION_RANGE

  # create the project with default function structure diagram name together
  def self.create_with_default_function_structure_diagram(user_id, name, description)
    transaction do
      @function_structure_diagram = FunctionStructureDiagram.new(:user_id=>user_id, :name=>FunctionStructureDiagram.default_name_for_project(name))
      @function_structure_diagram.save!

      @project = Project.new( :user_id=>user_id,
                              :function_structure_diagram_id=>@function_structure_diagram.id,
                              :name=>name,
                              :description=>description)
      @project.save!
      return @project
    end
  end

  # Return the top level objects(known objects) for the project
  def known_objects
    self.function_structure_diagram.known_objects
  end

  # Return true if the project has a function structure diagram with name
  def has_function_structure_diagram?
    function_structure_diagram=self.function_structure_diagram
    !(function_structure_diagram.nil? || function_structure_diagram.name.nil?)
  end

  def as_json

  end
end
