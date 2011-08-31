# include the Aptana Cloud Capistrano tasks

begin
  require 'aptana_cloud'
rescue LoadError
  puts "This configuration requries aptana_cloud to be installed in order to deploy and the gem can not be found"
  puts "Please install the aptana_cloud gem and rerun your deployment command"
  exit 1
end

set :application, "designpad"
set :domain, "#{application}.aptanacloud.com"

server domain, :app, :web, :db, :primary => true

# Optional: set user (user used on site). You can also set the
# environment variable APTANA_ID. If neither :user or APTANA_ID is
# set, capistrano will prompt for a user.

# set :user, "ahodgson"

# Optional: set database user and password. You can also set the
# environment variable APTANA_DB_USER and APTANA_DB_PASSWORD. If
# neither is set, capistrano will prompt.

# A default user was created when your site was created and these
# credentials are given as the default.

set :db_user, "app_user"
set :db_password, "Rz1s3a9L"

# You may need this if you need to enter passwords during your deploy

# default_run_options[:pty] = true

# Customizations

# Unless told otherwise, we deploy your current working directory to
# your site.  if you use scm, e.g., subversion or git, uncomment the
# appropriate lines and specify the location of your repository

# subversion

#   set :scm, :subversion

#   Specify your svn repository in the next line the default is the
#   repository setup in your cloud

#   set :repository, "https://#{domain}:39443/svn/repo/trunk"

#   Optionally (and typically) you can use the remote_cache strategy
#   so that your site is checked out directly on your site. You also
#   use the svn export command rather than the (default) checkout so
#   your application directories don't include .svn subdirectories.

#   set :deploy_via, :remote_cache
#   set :checkout, "export"

#   Note that you may need to log in to your site and do at least one
#   svn command in order to accept the self-signed certificate from
#   your secure SVN repository, e.g.,

#   -bash-3.2$ svn info https://#{domain}:39443/svn/repo/trunk  
#   Error validating server certificate for 'https://#{domain}:39443':
#    - The certificate is not issued by a trusted authority. Use the
#      fingerprint to validate the certificate manually!
#   Certificate information:
#    - Hostname: #{domain}
#    - Valid: from ... GMT until ... GMT
#    - Issuer: #{domain}
#    - Fingerprint: ...
#   (R)eject, accept (t)emporarily or accept (p)ermanently? p

# git

#   set :scm, :git

#   Specify your git repository in the next line the default is the
#   repository setup in your cloud:

#   set :repository,  "ssh://#{domain}/var/git/#{application}.git"

#   Optionally (and typically) you can use the remote_cache strategy
#   so that your site is checked out directly on your site.

#   set :deploy_via, :remote_cache

#   Instead, if you don't want your .git directories checked out, you can use

#   set :deploy_via, :export

#   Note that you may need to log into your site and do at least one
#   git command in order to accept the self-signed certificate from
#   your secure SVN repository, e.g.,

#   -bash-3.2$ git ls-remote ssh://#{domain}/var/git/#{application}.git     
#   The authenticity of host '#{domain} (...)' can't be established.
#   RSA key fingerprint is ...
#   Are you sure you want to continue connecting (yes/no)? yes