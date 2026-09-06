/**
 * Database contract for the RETURN Supabase project (hzeabckqzwhqrlbcnhhy).
 * Mirrors supabase/migrations/0001–0006 exactly. When a migration changes a
 * column, change it here in the same commit.
 */

export type RecordState = 'draft' | 'recorded' | 'archived'
export type Visibility = 'private' | 'public'
export type PrayerKind = 'mine' | 'intercession'
export type PromiseState = 'active' | 'closed'
export type ActionOutcome = 'done' | 'retry' | 'modified' | 'rescheduled' | 'record_only'
export type ConfessionType = 'prayer' | 'confession' | 'grace' | 'daily'
export type ReactionType = 'pray_together' | 'received_grace' | 'touched'
export type ReportReason = 'personal_info' | 'harassment' | 'spam' | 'safety'
export type ReportState = 'open' | 'reviewing' | 'actioned' | 'dismissed'
export type ModerationActionType = 'hide' | 'unhide' | 'delete' | 'restrict' | 'restore'
export type ShareSourceKind =
  | 'repentance'
  | 'prayer_record'
  | 'prayer_topic'
  | 'promise'
  | 'action_record'

/** `R` required on insert; everything else is defaulted or nullable in SQL. */
type Table<Row, R extends keyof Row = never> = {
  Row: Row
  Insert: Partial<Row> & Pick<Row, R>
  Update: Partial<Row>
  Relationships: []
}

type Timestamps = { created_at: string; updated_at: string }

export type ProfileRow = {
  id: string
  display_name: string
  church_name: string | null
  denomination: string | null
  church_info_public: boolean
  avatar_path: string | null
  bio: string | null
  profile_visibility: Visibility
  terms_agreed_at: string | null
  privacy_agreed_at: string | null
  onboarding_completed_at: string | null
} & Timestamps

export type PrayerFolderRow = {
  id: string
  user_id: string
  name: string
  sort_order: number
} & Timestamps

export type PrayerTopicRow = {
  id: string
  user_id: string
  folder_id: string | null
  kind: PrayerKind
  title: string
  subject_name: string | null
  body: string | null
  state: RecordState
  closed_at: string | null
} & Timestamps

export type PrayerRecordRow = {
  id: string
  user_id: string
  topic_id: string
  prayed_on: string
  body: string
  voice_path: string | null
  voice_duration_ms: number | null
} & Timestamps

export type PrayerTextRow = {
  id: string
  user_id: string
  title: string
  occasion: string | null
  body: string
  state: RecordState
} & Timestamps

export type RepentanceRow = {
  id: string
  user_id: string
  title: string
  looking_back: string | null
  realization: string | null
  turning_promise: string | null
  returning_note: string | null
  voice_path: string | null
  voice_duration_ms: number | null
  state: RecordState
  recorded_at: string | null
} & Timestamps

export type PromiseGroupRow = {
  id: string
  user_id: string
  name: string
  is_default: boolean
  sort_order: number
  created_at: string
}

export type PromiseRow = {
  id: string
  user_id: string
  group_id: string | null
  title: string
  background: string | null
  purpose: string | null
  started_on: string
  due_date: string | null
  daily_target: number
  state: PromiseState
  closed_at: string | null
} & Timestamps

export type PromiseCheckRow = {
  promise_id: string
  user_id: string
  check_date: string
  done_count: number
  note: string | null
  updated_at: string
}

export type ActionRow = {
  id: string
  user_id: string
  promise_id: string
  title: string
  planned_for: string | null
} & Timestamps

export type ActionRecordRow = {
  id: string
  user_id: string
  action_id: string
  outcome: ActionOutcome
  note: string | null
  recorded_on: string
  repentance_id: string | null
  created_at: string
}

export type ReminderRow = {
  id: string
  user_id: string
  promise_id: string | null
  action_id: string | null
  remind_at: string
  weekdays: number[]
  enabled: boolean
  created_at: string
}

export type MoodRecordRow = {
  user_id: string
  recorded_on: string
  level: number
  note: string | null
} & Timestamps

export type LifeEventRow = {
  id: string
  user_id: string
  occurred_on: string
  title: string
  body: string | null
  category: string | null
  significance: number
} & Timestamps

export type SavedScriptureRow = {
  id: string
  user_id: string
  reference: string
  memo: string | null
  saved_on: string
  created_at: string
}

export type BibleReadingProgressRow = {
  user_id: string
  book: string
  chapter: number
  read_on: string
}

export type ConfessionPostRow = {
  id: string
  user_id: string
  type: ConfessionType
  body: string
  photo_path: string | null
  source_kind: ShareSourceKind | null
  source_id: string | null
  source_detached_at: string | null
  hidden_at: string | null
} & Timestamps

export type ConfessionReactionRow = {
  post_id: string
  user_id: string
  type: ReactionType
  created_at: string
}

export type ConfessionCommentRow = {
  id: string
  post_id: string
  user_id: string
  body: string
  /** Soft delete — docs/08 작성자 본인 삭제, thread shape preserved. */
  deleted_at: string | null
  created_at: string
}

export type CommunityProfileRow = {
  id: string
  display_name: string
  avatar_path: string | null
  updated_at: string
}

export type ReportRow = {
  id: string
  reporter_id: string
  post_id: string | null
  comment_id: string | null
  reported_user_id: string | null
  reason: ReportReason
  detail: string | null
  state: ReportState
  created_at: string
}

export type UserBlockRow = {
  blocker_id: string
  blocked_id: string
  created_at: string
}

export type PostHashtagRow = { post_id: string; tag: string }
export type ProfileHashtagRow = { user_id: string; tag: string; created_at: string }

export type ProfileMediaRow = {
  id: string
  user_id: string
  storage_path: string
  category: string | null
  caption: string | null
  sort_order: number
  created_at: string
}

export type OnboardingAnswerRow = {
  user_id: string
  question_key: 'q1_word' | 'q2_walk' | 'q3_promise'
  body: string
} & Timestamps

export type AiMemoryConsentRow = {
  user_id: string
  enabled: boolean
  enabled_at: string | null
  revoked_at: string | null
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, 'id'>
      profile_media: Table<ProfileMediaRow, 'user_id' | 'storage_path'>
      profile_hashtags: Table<ProfileHashtagRow, 'user_id' | 'tag'>
      onboarding_answers: Table<OnboardingAnswerRow, 'user_id' | 'question_key'>
      prayer_folders: Table<PrayerFolderRow, 'user_id' | 'name'>
      prayer_topics: Table<PrayerTopicRow, 'user_id' | 'title'>
      prayer_records: Table<PrayerRecordRow, 'user_id' | 'topic_id'>
      prayer_texts: Table<PrayerTextRow, 'user_id' | 'title'>
      repentances: Table<RepentanceRow, 'user_id'>
      repentance_scriptures: Table<
        { repentance_id: string; user_id: string; reference: string },
        'repentance_id' | 'user_id' | 'reference'
      >
      promise_groups: Table<PromiseGroupRow, 'user_id' | 'name'>
      promises: Table<PromiseRow, 'user_id' | 'title'>
      promise_checks: Table<PromiseCheckRow, 'promise_id' | 'user_id' | 'check_date'>
      actions: Table<ActionRow, 'user_id' | 'promise_id' | 'title'>
      action_records: Table<ActionRecordRow, 'user_id' | 'action_id'>
      reminders: Table<ReminderRow, 'user_id' | 'remind_at'>
      mood_records: Table<MoodRecordRow, 'user_id' | 'recorded_on' | 'level'>
      life_events: Table<LifeEventRow, 'user_id' | 'occurred_on' | 'title'>
      saved_scriptures: Table<SavedScriptureRow, 'user_id' | 'reference'>
      bible_reading_progress: Table<BibleReadingProgressRow, 'user_id' | 'book' | 'chapter'>
      confession_posts: Table<ConfessionPostRow, 'user_id' | 'type'>
      confession_reactions: Table<ConfessionReactionRow, 'post_id' | 'user_id' | 'type'>
      confession_comments: Table<ConfessionCommentRow, 'post_id' | 'user_id' | 'body'>
      post_hashtags: Table<PostHashtagRow, 'post_id' | 'tag'>
      community_profiles: Table<CommunityProfileRow, 'id'>
      reports: Table<ReportRow, 'reporter_id' | 'reason'>
      user_blocks: Table<UserBlockRow, 'blocker_id' | 'blocked_id'>
      ai_memory_consent: Table<AiMemoryConsentRow, 'user_id'>
      ai_usage_events: Table<
        {
          id: string
          user_id: string
          domain: string
          capability: string
          used_memory: boolean
          created_at: string
        },
        'user_id' | 'domain' | 'capability'
      >
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: {
      record_state: RecordState
      visibility: Visibility
      prayer_kind: PrayerKind
      promise_state: PromiseState
      action_outcome: ActionOutcome
      confession_type: ConfessionType
      reaction_type: ReactionType
      report_reason: ReportReason
      report_state: ReportState
      moderation_action_type: ModerationActionType
      share_source_kind: ShareSourceKind
    }
    CompositeTypes: Record<never, never>
  }
}
