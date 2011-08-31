DesignPad::Application.routes.draw do |map|

  map.resources :comments

  map.resources :comment_for_concepts

  map.resources :teams
  
  map.resources :known_objects
  map.resources :function_structure_diagrams
  map.resources :concept_categories
  map.resources :concepts
  map.resources :functions
  map.resources :projects
  #map.resources :sessions, :constraints => { :protocol => "https" }
  # The priority is based upon order of creation: first created -> highest priority.
  
  # Sample of regular route:
  # map.connect 'products/:id', :controller => 'catalog', :action => 'view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  # map.purchase 'products/:id/purchase', :controller => 'catalog', :action => 'purchase'
  # This route can be invoked with purchase_url(:id => product.id)

  # You can have the root of your site routed by hooking up ''
  # -- just remember to delete public/index.html.
   map.connect '', :controller => "site", :action=>'index', :id=>nil
   map.profile 'profile/:screen_name', :controller=>'profile', :action=>'show'
   map.hub 'user', :controller=>'user', :action=>'index'
   map.connect 'concepts/edit/:id', :controller=>'concepts', :action=>'edit'
   
  # Allow downloading Web Service WSDL as a file with an extension
  # instead of a file named 'wsdl'
  map.connect ':controller/service.wsdl', :action => 'wsdl'

  # Install the default route as the lowest priority.
  map.connect ':controller/:action/:id.:format'
  map.connect ':controller/:action/:id'
end
