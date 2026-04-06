create table if not exists users (
  id text primary key,
  email text not null unique,
  name text not null,
  role text not null check (role in ('guest', 'member')),
  plan text not null check (plan in ('free', 'plus', 'pro')),
  password_hash text,
  email_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists auth_sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists admin_panel_sessions (
  id text primary key,
  admin_user_id text references users(id) on delete set null,
  admin_label text not null,
  auth_mode text not null check (auth_mode in ('config', 'member')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists auth_tokens (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  token_hash text not null unique,
  token_type text not null check (token_type in ('verify_email', 'reset_password')),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists teacher_classes (
  id text primary key,
  teacher_id text not null references users(id) on delete cascade,
  name text not null,
  join_code text not null unique,
  approval_required boolean not null default true,
  join_message text,
  created_at timestamptz not null default now()
);

create table if not exists teacher_class_enrollments (
  class_id text not null references teacher_classes(id) on delete cascade,
  student_id text not null references users(id) on delete cascade,
  status text not null default 'approved' check (status in ('pending', 'approved')),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table if not exists student_profiles (
  user_id text primary key references users(id) on delete cascade,
  preferred_exam_type text not null check (preferred_exam_type in ('IELTS', 'TOEFL')) default 'IELTS',
  target_score numeric(4,1),
  weekly_goal integer not null default 4,
  daily_minutes_goal integer not null default 15,
  study_days_json jsonb not null default '[]'::jsonb,
  current_level text not null default 'Building basics',
  focus_skill text not null default 'Balanced practice',
  exam_date text,
  target_reason text,
  discovery_source text,
  bio text,
  updated_at timestamptz not null default now()
);

create table if not exists institution_billing (
  teacher_id text primary key references users(id) on delete cascade,
  plan text not null check (plan in ('starter', 'team', 'campus')),
  status text not null check (status in ('draft', 'active')) default 'draft',
  seat_count integer not null default 20,
  monthly_price numeric(8,2) not null default 49,
  included_classes integer not null default 3,
  included_students integer not null default 20,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists homework_assignments (
  id text primary key,
  teacher_id text not null references users(id) on delete cascade,
  student_id text not null references users(id) on delete cascade,
  class_id text references teacher_classes(id) on delete set null,
  title text not null,
  instructions text not null,
  focus_skill text not null,
  recommended_task_type text not null,
  prompt_id text,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists homework_auto_assign_rules (
  class_id text primary key references teacher_classes(id) on delete cascade,
  teacher_id text not null references users(id) on delete cascade,
  enabled boolean not null default false,
  score_threshold numeric(4,1) not null default 5.5,
  due_days integer not null default 7,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists class_shared_study_items (
  id text primary key,
  class_id text not null references teacher_classes(id) on delete cascade,
  teacher_id text not null references users(id) on delete cascade,
  prompt_id text not null,
  exam_type text not null check (exam_type in ('IELTS', 'TOEFL')),
  task_type text not null,
  difficulty text not null,
  title text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists study_list_folders (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists study_list_items (
  id text primary key,
  folder_id text not null references study_list_folders(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  prompt_id text not null,
  exam_type text not null check (exam_type in ('IELTS', 'TOEFL')),
  task_type text not null,
  difficulty text not null,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists study_list_tasks (
  id text primary key,
  folder_id text not null references study_list_folders(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  title text not null,
  note text,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists study_task_reminders (
  id text primary key,
  task_id text not null references study_list_tasks(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  milestone_percent integer not null check (milestone_percent in (25, 50, 75, 100)),
  title text not null,
  body text not null,
  href text,
  email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (task_id, milestone_percent)
);

create table if not exists analytics_events (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  event text not null,
  path text,
  created_at timestamptz not null default now()
);

create table if not exists auth_activity (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  event_type text not null check (event_type in ('signin', 'signout')),
  meta_json jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists billing_events (
  id text primary key,
  provider text not null check (provider in ('lemonsqueezy')),
  event_name text not null,
  user_email text,
  user_id text references users(id) on delete set null,
  plan text not null check (plan in ('free', 'plus', 'pro')),
  billing_status text not null,
  provider_customer_id text,
  provider_subscription_id text,
  payload_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists announcements (
  id text primary key,
  author_id text not null references users(id) on delete cascade,
  audience_type text not null check (audience_type in ('global', 'teacher', 'class')),
  class_id text references teacher_classes(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists marketing_leads (
  id text primary key,
  email text not null unique,
  name text,
  source text not null default 'site',
  created_at timestamptz not null default now()
);

create table if not exists referral_codes (
  id text primary key,
  code text not null unique,
  label text,
  created_by text,
  trial_days integer not null default 7,
  active boolean not null default true,
  usage_limit integer,
  created_at timestamptz not null default now()
);

create table if not exists custom_blog_posts (
  id text primary key,
  slug text not null unique,
  language text not null default 'en',
  title text not null,
  description text not null,
  keywords_json jsonb not null default '[]'::jsonb,
  intro text not null,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists usage_daily (
  user_id text not null references users(id) on delete cascade,
  usage_date date not null,
  sessions_count integer not null default 0,
  speaking_seconds integer not null default 0,
  primary key (user_id, usage_date)
);

create table if not exists speaking_sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  exam_type text not null check (exam_type in ('IELTS', 'TOEFL')),
  task_type text not null,
  difficulty text not null,
  plan text not null check (plan in ('free', 'plus', 'pro')),
  prompt_id text not null,
  prompt_title text not null,
  prompt_text text not null,
  prep_seconds integer not null,
  speaking_seconds integer not null,
  audio_uploaded boolean not null default false,
  audio_bytes integer,
  transcript text,
  created_at timestamptz not null default now()
);

create table if not exists feedback_reports (
  session_id text primary key references speaking_sessions(id) on delete cascade,
  overall_score numeric(4,1) not null,
  scale_label text not null,
  categories_json jsonb not null,
  strengths_json jsonb not null,
  improvements_json jsonb not null,
  next_exercise text not null,
  caution text not null,
  filler_words_json jsonb not null,
  improved_answer text,
  created_at timestamptz not null default now()
);

create table if not exists teacher_notes (
  id text primary key,
  teacher_id text not null references users(id) on delete cascade,
  student_id text not null references users(id) on delete cascade,
  session_id text references speaking_sessions(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

alter table speaking_sessions add column if not exists raw_transcript text;
alter table speaking_sessions add column if not exists cleaned_transcript text;
alter table speaking_sessions add column if not exists transcript_quality_score numeric(5,2);
alter table speaking_sessions add column if not exists transcript_quality_label text;
alter table users add column if not exists email_verified boolean not null default false;
alter table users add column if not exists member_type text not null default 'student';
alter table users add column if not exists organization_name text;
alter table users add column if not exists admin_access boolean not null default false;
alter table users add column if not exists teacher_access boolean not null default false;
alter table users add column if not exists billing_status text not null default 'free';
alter table users add column if not exists lemon_customer_id text;
alter table users add column if not exists lemon_subscription_id text;
alter table users add column if not exists trial_ends_at timestamptz;
alter table users add column if not exists referral_code_used text;
alter table teacher_classes add column if not exists approval_required boolean not null default true;
alter table teacher_classes add column if not exists join_message text;
alter table teacher_class_enrollments add column if not exists status text not null default 'approved';
alter table teacher_class_enrollments add column if not exists requested_at timestamptz not null default now();
alter table teacher_class_enrollments add column if not exists approved_at timestamptz;
alter table feedback_reports add column if not exists improved_answer text;
alter table teacher_notes add column if not exists tags_json jsonb not null default '[]'::jsonb;
alter table student_profiles add column if not exists onboarding_complete boolean not null default false;
alter table student_profiles add column if not exists daily_minutes_goal integer not null default 15;
alter table student_profiles add column if not exists exam_date text;
alter table student_profiles add column if not exists target_reason text;
alter table student_profiles add column if not exists discovery_source text;
alter table homework_auto_assign_rules add column if not exists exam_type text;
alter table homework_auto_assign_rules add column if not exists task_type text;
alter table homework_auto_assign_rules add column if not exists focus_skill text;

create index if not exists idx_speaking_sessions_user_created_at
  on speaking_sessions(user_id, created_at desc);

create index if not exists idx_auth_sessions_user_id
  on auth_sessions(user_id);

create index if not exists idx_auth_activity_user_id
  on auth_activity(user_id, occurred_at desc);

create index if not exists idx_referral_codes_code
  on referral_codes(code);

create index if not exists idx_custom_blog_posts_slug
  on custom_blog_posts(slug);

create index if not exists idx_custom_blog_posts_status_language
  on custom_blog_posts(status, language, published_at desc);

create index if not exists idx_auth_tokens_user_id
  on auth_tokens(user_id);

create index if not exists idx_auth_tokens_type_expires_at
  on auth_tokens(token_type, expires_at);

create index if not exists idx_teacher_classes_teacher_id
  on teacher_classes(teacher_id);

create index if not exists idx_teacher_notes_teacher_student
  on teacher_notes(teacher_id, student_id, created_at desc);

create index if not exists idx_teacher_enrollments_student_id
  on teacher_class_enrollments(student_id, joined_at desc);

create index if not exists idx_teacher_enrollments_class_status
  on teacher_class_enrollments(class_id, status, requested_at desc);

create index if not exists idx_homework_assignments_student_created
  on homework_assignments(student_id, created_at desc);

create index if not exists idx_homework_assignments_teacher_created
  on homework_assignments(teacher_id, created_at desc);

create index if not exists idx_study_list_folders_user_created
  on study_list_folders(user_id, created_at desc);

create index if not exists idx_study_list_items_folder_created
  on study_list_items(folder_id, created_at desc);

create index if not exists idx_study_list_tasks_folder_created
  on study_list_tasks(folder_id, created_at desc);

create index if not exists idx_study_task_reminders_user_created
  on study_task_reminders(user_id, created_at desc);

create index if not exists idx_homework_assignments_class_due
  on homework_assignments(class_id, due_at desc);

create index if not exists idx_homework_auto_assign_rules_teacher
  on homework_auto_assign_rules(teacher_id, updated_at desc);

create index if not exists idx_class_shared_study_items_class_created
  on class_shared_study_items(class_id, created_at desc);

create index if not exists idx_analytics_events_user_created
  on analytics_events(user_id, created_at desc);

create index if not exists idx_billing_events_email_created
  on billing_events(user_email, created_at desc);

create index if not exists idx_billing_events_subscription_created
  on billing_events(provider_subscription_id, created_at desc);

create index if not exists idx_announcements_audience_created
  on announcements(audience_type, created_at desc);

create index if not exists idx_marketing_leads_created
  on marketing_leads(created_at desc);

alter table users drop constraint if exists users_plan_check;
alter table users drop constraint if exists users_role_check;
alter table speaking_sessions drop constraint if exists speaking_sessions_plan_check;
alter table speaking_sessions drop constraint if exists speaking_sessions_exam_type_check;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_role_check'
      and conrelid = 'users'::regclass
  ) then
    alter table users
      add constraint users_role_check
      check (role in ('guest', 'member'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_member_type_check'
      and conrelid = 'users'::regclass
  ) then
    alter table users
      add constraint users_member_type_check
      check (member_type in ('student', 'teacher', 'school'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_plan_check'
      and conrelid = 'users'::regclass
  ) then
    alter table users
      add constraint users_plan_check
      check (plan in ('free', 'plus', 'pro'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'speaking_sessions_exam_type_check'
      and conrelid = 'speaking_sessions'::regclass
  ) then
    alter table speaking_sessions
      add constraint speaking_sessions_exam_type_check
      check (exam_type in ('IELTS', 'TOEFL'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'speaking_sessions_plan_check'
      and conrelid = 'speaking_sessions'::regclass
  ) then
    alter table speaking_sessions
      add constraint speaking_sessions_plan_check
      check (plan in ('free', 'plus', 'pro'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'teacher_class_enrollments_status_check'
      and conrelid = 'teacher_class_enrollments'::regclass
  ) then
    alter table teacher_class_enrollments
      add constraint teacher_class_enrollments_status_check
      check (status in ('pending', 'approved'));
  end if;
end $$;
