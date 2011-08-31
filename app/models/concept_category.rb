# This is the model class for concept category.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class ConceptCategory < ActiveRecord::Base
  belongs_to :function
  has_many :concepts

  NO_CATEGORY="Unclassified"

  NAME_MIN_LENGTH = 1
  NAME_MAX_LENGTH = 100
  DESCRIPTION_MIN_LENGTH = 5
  DESCRIPTION_MAX_LENGTH = 100
  NAME_RANGE = NAME_MIN_LENGTH..NAME_MAX_LENGTH
  DESCRIPTION_RANGE = DESCRIPTION_MIN_LENGTH..DESCRIPTION_MAX_LENGTH

  # HTML displaying sizes
  NAME_SIZE = 20;

  # Icon path
  ICON_PATH = '/images/concept_category.jpg'

  # validations
  validates_uniqueness_of :name, :scope => [:function_id]
  validates_length_of :name, :within=>NAME_RANGE

  # Clear a concept category, therefore make all its concepts unclassified
  def release
    if self.name!=NO_CATEGORY
      transaction do
        self.concepts.each do |concept|
          concept.update_attribute(:concept_category_id, self.function.no_category().id)
        end
      end
    end
  end
  
end
