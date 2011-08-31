# This is the model class for comment.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class Comment < ActiveRecord::Base
  belongs_to :user
  belongs_to :concept
  
  BODY_MAX_LENGTH=40000

  # validations
  validates_presence_of :body, :concept, :user
  validates_length_of :body, :maximum => BODY_MAX_LENGTH
  # Prevent duplicate comments.
  validates_uniqueness_of :body, :scope => [:concept_id, :user_id]

  # Return true for a duplicate comment (same user and body).
  def duplicate_for_concept?
    c = Comment.find_by_concept_id_and_user_id_and_body(concept, user, body)
    # Give self the id for REST routing purposes.
    self.id = c.id unless c.nil?
    not c.nil?
  end

  # Check authorization for destroying comments.
  def authorized?(user)
    self.user == user
  end
  
end
