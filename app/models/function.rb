# This is the model class for function.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class Function < ActiveRecord::Base
  has_many :concept_categories, :order=>"created_at DESC", :dependent=>:destroy
  belongs_to :function_structure_diagram 
  belongs_to :object1, :class_name=>"KnownObject", :foreign_key=>"object1_id"
  belongs_to :object2, :class_name=>"KnownObject", :foreign_key=>"object2_id"

  #Max & Min lengths for all fields
  NAME_MIN_LENGTH = 1
  NAME_MAX_LENGTH = 100
  RELATION_MIN_LENGTH = 1
  RELATION_MAX_LENGTH = 20
  NAME_RANGE = NAME_MIN_LENGTH..NAME_MAX_LENGTH

  #Text box sizes for display in the views
  NAME_SIZE = 20
  RELATION_SIZE = 20

  # Icon path
  ICON_PATH = '/images/function.jpg'

  # validations
  validates_length_of :name, :within=>NAME_RANGE

  # Return true if the function has only unclassifed category and theres no concept created
  def has_no_idea?
    concept_categories=self.concept_categories
    concept_categories.length==1 && concept_categories[0].name==ConceptCategory::NO_CATEGORY && concept_categories[0].concepts.length==0
  end

  # Return unclassified category for this function
  def no_category
    no_category=ConceptCategory.find(:all, :conditions=>["function_id=? and name=?", self.id.to_s, ConceptCategory::NO_CATEGORY])
    return no_category[0]
  end

  # create the function with default category at the same time
  def self.create_with_default_category(function_structure_diagram_id, name)
    transaction do
      @function=Function.create(:function_structure_diagram_id=>function_structure_diagram_id, :name=>name)
      no_category=ConceptCategory.new(:name=>ConceptCategory::NO_CATEGORY)
      @function.concept_categories<<no_category
      
      return @function
    end
  end
end
