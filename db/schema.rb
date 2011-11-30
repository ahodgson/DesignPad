# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20111125002124) do

  create_table "comments", :force => true do |t|
    t.integer  "user_id",    :null => false
    t.integer  "concept_id"
    t.text     "body"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "concept_categories", :force => true do |t|
    t.integer  "function_id",                    :null => false
    t.string   "name",                           :null => false
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "deleted",     :default => false
  end

  create_table "concepts", :force => true do |t|
    t.integer  "user_id",                                                              :null => false
    t.integer  "function_structure_diagram_id",                                        :null => false
    t.integer  "concept_category_id",                                                  :null => false
    t.string   "name"
    t.text     "description"
    t.binary   "picture",                       :limit => 16777215
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "image_remote_url"
    t.string   "avatar_file_name"
    t.string   "avatar_content_type"
    t.integer  "avatar_file_size"
    t.datetime "avatar_updated_at"
    t.boolean  "deleted",                                           :default => false
  end

  create_table "function_structure_diagrams", :force => true do |t|
    t.integer  "user_id",                                            :null => false
    t.string   "name"
    t.text     "description"
    t.binary   "picture",     :limit => 16777215
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "deleted",                         :default => false
  end

  create_table "functions", :force => true do |t|
    t.integer  "function_structure_diagram_id",                                        :null => false
    t.integer  "object1_id"
    t.integer  "object2_id"
    t.string   "relation"
    t.string   "name"
    t.text     "description"
    t.binary   "picture",                       :limit => 16777215
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "deleted",                                           :default => false
  end

  create_table "known_objects", :force => true do |t|
    t.integer  "project_id",                      :null => false
    t.string   "name"
    t.text     "description"
    t.binary   "picture",     :limit => 16777215
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "object_ownerships", :force => true do |t|
    t.integer  "function_structure_diagram_id", :null => false
    t.integer  "known_object_id",               :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "projects", :force => true do |t|
    t.integer  "user_id",                       :null => false
    t.integer  "function_structure_diagram_id", :null => false
    t.string   "name",                          :null => false
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "sessions", :force => true do |t|
    t.string   "session_id"
    t.text     "data"
    t.datetime "updated_at"
  end

  add_index "sessions", ["session_id"], :name => "index_sessions_on_session_id"
  add_index "sessions", ["updated_at"], :name => "index_sessions_on_updated_at"

  create_table "specs", :force => true do |t|
    t.integer "user_id",                        :null => false
    t.string  "first_name",     :default => ""
    t.string  "last_name",      :default => ""
    t.string  "gender"
    t.date    "birthdate"
    t.string  "student_number", :default => ""
  end

  create_table "teams", :force => true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", :force => true do |t|
    t.integer  "team_id"
    t.string   "screen_name"
    t.string   "email"
    t.string   "password"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "authorization_token"
  end

end
