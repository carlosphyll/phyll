export const stats = [
  { label: "Total Contacts", value: "12,345", change: "+12.5%", icon: "users" },
  { label: "Messages Sent", value: "48,392", change: "+8.2%", icon: "send" },
  { label: "Open Rate", value: "68.4%", change: "+2.1%", icon: "eye" },
  { label: "Active Flows", value: "24", change: "+4", icon: "zap" },
];

export const recentActivity = [
  { name: "John Doe", action: "triggered flow Welcome Series", time: "2 min ago", avatar: "https://i.pravatar.cc/150?img=12" },
  { name: "Jane Smith", action: "replied to your story", time: "15 min ago", avatar: "https://i.pravatar.cc/150?img=5" },
  { name: "Mike Johnson", action: "commented LINK on your post", time: "1 hour ago", avatar: "https://i.pravatar.cc/150?img=8" },
  { name: "Sarah Wilson", action: "subscribed via keyword", time: "3 hours ago", avatar: "https://i.pravatar.cc/150?img=9" },
];

export const contacts = [
  { id: 1, name: "John Doe", handle: "@johndoe", status: "SUBSCRIBED", tags: "lead, vip", lastSeen: "2 min ago", avatar: "https://i.pravatar.cc/150?img=12" },
  { id: 2, name: "Jane Smith", handle: "@janesmith", status: "SUBSCRIBED", tags: "customer", lastSeen: "15 min ago", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: 3, name: "Mike Johnson", handle: "@mikej", status: "UNSUBSCRIBED", tags: "lead", lastSeen: "1 day ago", avatar: "https://i.pravatar.cc/150?img=8" },
];

export const chartData = [42, 65, 38, 80, 56, 91, 73, 60, 85, 47, 69, 95];

export const TRIGGER_TYPES = ["COMMENT_KEYWORD", "STORY_REPLY", "DM_KEYWORD", "NEW_FOLLOWER"];
export const FLOW_STATUSES = ["ACTIVE", "INACTIVE", "DRAFT"];
