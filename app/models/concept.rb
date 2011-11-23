# This is the model class for concept.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

require 'open-uri'

class Concept < ActiveRecord::Base
	
  attr_accessor :image_url, :content_type, :original_filename, :image_data
  before_save :decode_base64_image

  belongs_to :user
  belongs_to :concept_category
  belongs_to :function_structure_diagram
  has_many :comments, :order=>"created_at DESC", :dependent=>:destroy
  has_attached_file :avatar

  #Max & Min lengths for all fields
  NAME_MIN_LENGTH = 1
  NAME_MAX_LENGTH = 100
  DESCRIPTION_MIN_LENGTH = 5
  DESCRIPTION_MAX_LENGTH = 300
  
  NAME_RANGE = NAME_MIN_LENGTH..NAME_MAX_LENGTH
  DESCRIPTION_RANGE = DESCRIPTION_MIN_LENGTH..DESCRIPTION_MAX_LENGTH
  
  before_validation :download_remote_image, :if => :image_url_provided?
  validates_presence_of :image_remote_url, :if => :image_url_provided?, :message => 'is invalid or inaccessible'

  #Text box sizes for display in the views
  NAME_SIZE = 20

  # Icon path
  ICON_PATH = '/images/concept1.jpg'

  # validations
  validates_length_of :name, :within=>NAME_RANGE

  # Returns the objects being used by the concept
  def known_objects
    self.function_structure_diagram.object_ownerships.collect{|object_ownership| object_ownership.known_object}
  end
  
  # Returns the objects being used only by this concept
  def monopolized_known_objects
    objects=[]
    self.known_objects.each do |known_object|
      if known_object.object_ownerships.length==1
        objects<<known_object
      end
    end
    return objects
  end

  # Returns true if the object is being used by the concept
  def has_object?(object)
    self.known_objects.each do |known_object|
      if known_object==object
        return true
      end
    end
    return false;
  end

  # Returns true if the concept's function structure diagram has a name
  def has_function_structure_diagram?
    function_structure_diagram=self.function_structure_diagram
    !(function_structure_diagram.nil? || function_structure_diagram.name.nil?)
  end

  # Create a concept and a function structure diagram without name for it
  def self.create_with_default_function_structure_diagram(user_id, concept_category_id, name)
    transaction do 
      @function_structure_diagram = FunctionStructureDiagram.new(:user_id=>user_id)     
      @function_structure_diagram.save!
      @concept = Concept.new( :user_id=>user_id,
                              :concept_category_id=>concept_category_id,
                              :function_structure_diagram_id=>@function_structure_diagram.id,
                              :name=>name)
      @concept.save!
      return @concept
    end
  end

  # Return true if the concept has a picture
  def has_picture?
    not self.picture.nil?
  end

  # Save uploaded picture to database
  # This method name must be different from "picture", because "picture=" is a default method.
  # It must be as same as the field name for uploading.
  def diagram=(diagram_in)
    self.picture=diagram_in.read
  end
  
  # Override destroy
  def destroy
    transaction do
      super
      self.monopolized_known_objects.each{|known_object| known_object.destroy}
      self.function_structure_diagram.destroy   
    end 
  end
 
#	Yelnil Gabo
#	Summer 2011 Coop Internship
#	Computer Science, year 4
#	UBC, Vancouver BC

  def image_url_provided?
    !self.image_url.blank?
  end
  
  def download_remote_image
    self.avatar = do_download_remote_image
  end
  
  def do_download_remote_image
    io = open(URI.parse(image_url))
    def io.original_filename; base_uri.path.split('/').last; end
    io.original_filename.blank? ? nil : io
  rescue # catch url errors with validations instead of exceptions (Errno::ENOENT, OpenURI::HTTPError, etc...)
  end
  
	# if uploaded pic was base64 handle here
	def decode_base64_image
		content_type      = 'image/png'
		original_filename = 'screenshots.png'
	
		if !image_data.nil?
			if !image_data.empty? && content_type && original_filename
				
				#cut off header "data:image/jpeg;base64,"
				index = image_data.index(','); 
				decoded_data = Base64.decode64(image_data[index..-1])
				 
				data = StringIO.new(decoded_data)
				data.class_eval do
				  attr_accessor :content_type, :original_filename
				end

				data.content_type = content_type
				data.original_filename = File.basename(original_filename)

				self.avatar = data
			end
		end
	end
  
  # defines the JSON representation of the concept category objects to be rendered in the JIT tree
  def as_json( options={} )
    { :id => id.to_s + "_con", :name => name, :data => description, :children => concepts }
  end
  
end