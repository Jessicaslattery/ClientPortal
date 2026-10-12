// Shared option lists + colours for ContentPost, used by both the client and
// founder calendar UIs so the two never drift apart.

export const POST_TYPES = ["reel", "carousel", "picture"] as const;
export const POST_TYPE_LABELS: Record<string, string> = {
  reel: "Reel",
  carousel: "Carousel",
  picture: "Picture",
};

export const FUNNEL_STAGES = ["top", "middle", "bottom"] as const;
export const FUNNEL_LABELS: Record<string, string> = {
  top: "Top of funnel",
  middle: "Middle of funnel",
  bottom: "Bottom of funnel",
};
export const FUNNEL_COLORS: Record<string, string> = {
  top: "#9B7DB8",
  middle: "#B7791F",
  bottom: "#2D6A4F",
};

export const HOOK_TYPES = ["visual", "audio"] as const;
export const HOOK_TYPE_LABELS: Record<string, string> = {
  visual: "Visual",
  audio: "Audio",
};

export const OUTCOMES = ["save", "share", "comment", "dm", "likes"] as const;
export const OUTCOME_LABELS: Record<string, string> = {
  save: "Save",
  share: "Share",
  comment: "Comment",
  dm: "DM",
  likes: "Likes",
};

export const STATUSES = ["todo", "working_on_it", "complete"] as const;
export const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  working_on_it: "Working On It",
  complete: "Complete",
};
export const STATUS_BG: Record<string, string> = {
  todo: "#F5F2ED",
  working_on_it: "#FEF3C7",
  complete: "#EAF3DE",
};
export const STATUS_TEXT: Record<string, string> = {
  todo: "#8C8277",
  working_on_it: "#B7791F",
  complete: "#2D6A4F",
};
export const STATUS_DOT: Record<string, string> = {
  todo: "#DDD5C8",
  working_on_it: "#E0A93B",
  complete: "#2D6A4F",
};

export const STORY_CONTENT_TYPE = "story";
