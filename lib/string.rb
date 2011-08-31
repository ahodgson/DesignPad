# Extension for string class.

class String
  
  # Return an alternate string if blank.
  #
  # @param: alternate  the alternative string
  # @return: if the string is blank, return the alternative string, otherwise return itself
  def or_else(alternate)
    blank? ? alternate : self
  end
  
end