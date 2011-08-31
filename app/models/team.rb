# This is the model class for team.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class Team < ActiveRecord::Base
  has_many :users, :dependent=>:destroy
  #belongs_to :user #creator

  # Length ranges
  NAME_MIN_LENGTH = 1
  NAME_MAX_LENGTH = 20
  NAME_RANGE = NAME_MIN_LENGTH..NAME_MAX_LENGTH

  # Html sizes
  NAME_SIZE = 20

  # validations
  validates_uniqueness_of :name
  validates_length_of :name, :within=>NAME_RANGE

  # Return the projects related to the team
  def projects
    projects=[]
    self.users.each{|user| projects.concat(user.projects).uniq!}
    return projects
  end
end
