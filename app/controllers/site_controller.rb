# Filters added to this controller only apply to sites controller.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class SiteController < ApplicationController

  # index.rhtml
  def index
    @title = "Homepage"
  end

  # about.rhtml
  def about
    @title = "About Us"
  end

  # help.rhtml
  def help
    @title = "Help"
  end
  
  def ex
	@concept = Concept.first
  end
  
  def ex2
	@concept = Concept.first
  end
  
  def exboxes
	@concept = Concept.first
  end
  
  def ex3
	@concept = Concept.first
  end
  
  def ex4
	require 'json'
	ActiveRecord::Concept.include_root_in_json = false
	ActiveRecord::FunctionStructureDiagram.include_root_in_json = false
	
	
	json = FunctionStructureDiagram.first.to_json(:only =>  :name,
												:include => { :functions => { :only =>  :name,
																:include => { :concept_categories => { :only => :name,
																	:include => { :concepts => { :only => :name, :include => {:function_structure_diagram => { :only => :name } }}}}}}}) 
	
	
	json2 = Concept.first.to_json(:only => [ :id, :name ])
	puts ""
	puts json
	puts ""
	puts json2
	puts ""
	@concept = Concept.first
	@project = Project.first
  end
end
