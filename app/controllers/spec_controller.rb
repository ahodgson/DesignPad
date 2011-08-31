# Filters added to this controller only apply to specs controller.
#
# @version: 1.0
# @author: Kexia Tang
# @date: 12/24/2009

class SpecController < ApplicationController
  
  before_filter :protect

  # default to redirect to user index
  def index
    redirect_to :controller =>"user", :action=>"index"
  end

  # edit the user's Spec
  def edit
    @title="Edit Spec"
    @user=User.find(session[:user_id])
    @user.spec||=Spec.new
    @spec=@user.spec
    if param_posted?(:spec)
      if @user.spec.update_attributes(params[:spec])
        flash[:notice]= "Changes saved"
        redirect_to :controller=>"user", :action=>"index"
      end
    end
  end
end
