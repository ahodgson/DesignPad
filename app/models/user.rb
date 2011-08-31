# This is the model class for user.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class User < ActiveRecord::Base
  
  belongs_to :team
  
  has_one :spec, :dependent=>:destroy
  has_many :concepts, :dependent=>:destroy, :order=>"created_at DESC"
  has_many :projects, :dependent=>:destroy, :order=>"created_at DESC"
  has_many :function_structure_diagram, :dependent=>:destroy, :order=>"created_at DESC"
  has_many :comments, :order=>"created_at DESC", :dependent=>:destroy
  
  attr_accessor :remember_me
  attr_accessor :current_password
  
  #Max & Min lengths for all fields
  SCREEN_NAME_MIN_LENGTH = 4
  SCREEN_NAME_MAX_LENGTH = 20
  PASSWORD_MIN_LENGTH = 4
  PASSWORD_MAX_LENGTH = 40
  EMAIL_MAX_LENGTH = 50
  SCREEN_NAME_RANGE = SCREEN_NAME_MIN_LENGTH..SCREEN_NAME_MAX_LENGTH
  PASSWORD_RANGE = PASSWORD_MIN_LENGTH..PASSWORD_MAX_LENGTH
  
  #Text box sizes for display in the views
  SCREEN_NAME_SIZE = 20
  PASSWORD_SIZE = 10
  EMAIL_SIZE = 30

  # validations
  validates_uniqueness_of :screen_name#, :email   #allow email to repeat
  validates_length_of :screen_name, :within=>SCREEN_NAME_RANGE
  validates_length_of :password, :within=>PASSWORD_RANGE
  validates_length_of :email, :maximum=>EMAIL_MAX_LENGTH
  validates_format_of :screen_name, :with=>/^[A-Z0-9_]*$/i, :message=>"must contain only letters, numbers, and underscores"
  validates_format_of :email, :with=>/^[A-Z0-9._%-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i, :message=>"must be a valid email address"
  validates_confirmation_of :password

  # log in
  def login!(session)
    session[:user_id]=id
    session[:team_id]=team_id
   # session[:user_id]=self.id
  end

  # log out
  def self.logout!(session, cookies)
    session[:user_id]=nil
    session[:team_id]=nil
    cookies.delete(:authorization_token)
  end

  # clear password field
  def clear_password!
    self.password = nil
    self.password_confirmation = nil
    self.current_password = nil
  end
 
 # Remember a user for future login 
  def remember!(cookies)
    cookie_expiration = 10.years.from_now
    cookies[:remember_me]={:value=>"1", :expires=>cookie_expiration}
    self.authorization_token=unique_identifier
    save!
    cookies[:authorization_token]={:value=>authorization_token, :expires=>cookie_expiration}
  end

  # Return a encrypted token for a user
  def unique_identifier
    Digest::SHA1.hexdigest("#{screen_name}:#{password}")
  end
  
  # Forget a user's login status
  def forget!(cookies)
    cookies.delete(:remember_me)
    cookies.delete(:authorization_token)
  end
  
  # Return true if the user wants the login status remembered.
  def remember_me?
    remember_me == "1"
  end
  
  # Return true if the password from params is correct.
  def correct_password?(params)
    current_password=params[:user][:current_password]
    password==current_password
  end
  
  # Generate messages for password errors.
  def password_errors(params)
    # Use User model's valid? method to generate error messages
    # for a password mismatch(if any)
    self.password = params[:user][:password]
    self.password_confirmation = params[:user][:password_confirmation]
    valid?
    # The current passwod is incorrect, so add an error message.
    errors.add(:current_password, "is incorrect")
  end

  # Register Team
  def create_team(team)
    transaction do
      return (team.save && self.update_attribute(:team_id, team.id))
    end
  end
  
  # Return a sensible name for the user.
  def name
    spec.full_name.or_else(screen_name)
  end
  
end
