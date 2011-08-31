# This is the model class for spec.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class Spec < ActiveRecord::Base
  
  belongs_to :user
  
  ALL_FIELDS = %w{first_name last_name student_number gender birthdate}
  STRING_FIELDS = %w{first_name last_name student_number}
  VALID_GENDERS = ["Male", "Female"]
  START_YEAR = 1900
  VALID_DATES = DateTime.new(START_YEAR)..DateTime.now
  
  STRING_FIELD_MAX_LENGTH=255

  # validations
  validates_length_of STRING_FIELDS, :maximum=>STRING_FIELD_MAX_LENGTH
  validates_inclusion_of :gender, :in=>VALID_GENDERS, :allow_nil=>true, :message=>"must be male or female"
  validates_inclusion_of :birthdate, :in=>VALID_DATES, :allow_nil=>true, :message=>"is invalid"
  
  # Return a sensibly formatted location string
  def full_name
    [first_name, last_name].join(" ")
  end
  
  # Return a sensibly formatted location string
  def location
    [city, state, zip_code].join(" ")
  end
  
end
