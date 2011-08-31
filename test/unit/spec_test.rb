require File.dirname(__FILE__) + '/../test_helper'

class SpecTest < Test::Unit::TestCase
  fixtures :specs
  
  def setup
    @valid_spec = specs(:valid_spec)
  end
  
  def test_max_lengths
    Spec::STRING_FIELDS.each do |field|
      assert_length :max, @valid_spec, field, DB_STRING_MAX_LENGTH
    end
  end
  
  # Test a saving a blank spec.
  def test_blank
    blank = Spec.new(:user_id => @valid_spec.id)
    assert blank.save, blank.errors.full_messages.join("\n")
  end
  
  def test_invalid_birthdates
    spec = @valid_spec
    invalid_birthdates = [Date.new(Spec::START_YEAR - 1),
                          Date.today + 1.year]
    invalid_birthdates.each do |birthdate|
      spec.birthdate = birthdate
      assert !spec.valid?, "#{birthdate} shouldn't pass validation"
    end
  end

  # Test for valid genders.
  def test_gender_with_valid_examples
    spec = @valid_spec
    Spec::VALID_GENDERS.each do |valid_gender|
      spec.gender = valid_gender
      assert spec.valid?, "#{valid_gender} should pass validation but doesn't." 
    end
  end
  
  # Test invalid genders.
  def test_gender_with_invalid_examples
    spec = @valid_spec
    invalid_genders = ["Eunuch", "Hermaphrodite", "Ann Coulter"]
    invalid_genders.each do |invalid_gender|
      spec.gender = invalid_gender
      assert !spec.valid?, "#{invalid_gender} shouldn't pass validation, but does."
    end
  end
end
