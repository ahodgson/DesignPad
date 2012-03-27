# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = %q{paperclip}
  s.version = "2.3.12"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Jon Yurek"]
  s.date = %q{2011-06-27}
  s.description = %q{Easy upload management for ActiveRecord}
  s.email = %q{jyurek@thoughtbot.com}
  s.extra_rdoc_files = ["README.md"]
  s.files = ["README.md"]
  s.homepage = %q{https://github.com/thoughtbot/paperclip}
  s.rdoc_options = ["--line-numbers", "--inline-source"]
  s.require_paths = ["lib"]
  s.requirements = ["ImageMagick"]
  s.rubyforge_project = %q{paperclip}
  s.rubygems_version = %q{1.7.2}
  s.summary = %q{File attachments as attributes for ActiveRecord}

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<activerecord>, [">= 2.3.0"])
      s.add_runtime_dependency(%q<activesupport>, [">= 2.3.2"])
      s.add_runtime_dependency(%q<cocaine>, [">= 0.0.2"])
      s.add_development_dependency(%q<shoulda>, [">= 0"])
      s.add_development_dependency(%q<appraisal>, [">= 0"])
      s.add_development_dependency(%q<mocha>, [">= 0"])
      s.add_development_dependency(%q<aws-s3>, [">= 0"])
      s.add_development_dependency(%q<sqlite3-ruby>, [">= 0"])
    else
      s.add_dependency(%q<activerecord>, [">= 2.3.0"])
      s.add_dependency(%q<activesupport>, [">= 2.3.2"])
      s.add_dependency(%q<cocaine>, [">= 0.0.2"])
      s.add_dependency(%q<shoulda>, [">= 0"])
      s.add_dependency(%q<appraisal>, [">= 0"])
      s.add_dependency(%q<mocha>, [">= 0"])
      s.add_dependency(%q<aws-s3>, [">= 0"])
      s.add_dependency(%q<sqlite3-ruby>, [">= 0"])
    end
  else
    s.add_dependency(%q<activerecord>, [">= 2.3.0"])
    s.add_dependency(%q<activesupport>, [">= 2.3.2"])
    s.add_dependency(%q<cocaine>, [">= 0.0.2"])
    s.add_dependency(%q<shoulda>, [">= 0"])
    s.add_dependency(%q<appraisal>, [">= 0"])
    s.add_dependency(%q<mocha>, [">= 0"])
    s.add_dependency(%q<aws-s3>, [">= 0"])
    s.add_dependency(%q<sqlite3-ruby>, [">= 0"])
  end
end
