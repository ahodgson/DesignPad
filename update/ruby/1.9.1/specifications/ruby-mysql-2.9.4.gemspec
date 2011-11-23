# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = %q{ruby-mysql}
  s.version = "2.9.4"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["tommy"]
  s.date = %q{2010-12-28}
  s.description = %q{MySQL connector for Ruby}
  s.email = %q{tommy@tmtm.org}
  s.extra_rdoc_files = ["README.rdoc", "ChangeLog"]
  s.files = ["README.rdoc", "ChangeLog"]
  s.homepage = %q{http://github.com/tmtm/ruby-mysql}
  s.rdoc_options = ["--title", "ruby-mysql documentation", "--charset", "utf-8", "--opname", "index.html", "--line-numbers", "--main", "README", "--inline-source", "--exclude", "^(examples|extras)/"]
  s.require_paths = ["lib"]
  s.required_ruby_version = Gem::Requirement.new(">= 1.8.7")
  s.rubyforge_project = %q{rubymysql}
  s.rubygems_version = %q{1.7.2}
  s.summary = %q{MySQL connector for Ruby}

  if s.respond_to? :specification_version then
    s.specification_version = 2

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
    else
    end
  else
  end
end
