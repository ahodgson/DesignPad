# Filters added to this controller only apply to profiles controller.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class ProfileController < ApplicationController

  # the index.rhtml page
  def index
    @title="RailsSpace Profiles"
  end

  # the show.rhml page
  def show
    @hide_edit_links = true
    screen_name=params[:screen_name]
    @user=User.find_by_screen_name(screen_name)
    if @user
      @title="My RailsSpace Profile for #{screen_name}"
      @spec=@user.spec||=Spec.new
    else
      flash[:notice]="No user #{screen_name} at RailsSpace!"
      redirect_to :action=>"index"
    end
  end
  
end
