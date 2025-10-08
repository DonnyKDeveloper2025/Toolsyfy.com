export enum Category {
  AI_MACHINE_LEARNING = 'AI & Machine Learning',
  DATA_ANALYTICS = 'Data & Analytics',
  DEVELOPER_TOOLS = 'Developer Tools',
  AUTOMATION_SCRIPTING = 'Automation & Scripting',
  API_JSON_TOOLS = 'API & JSON Tools',
  CLOUD_HOSTING = 'Cloud & Hosting',
  NO_CODE_BUILDERS = 'No-Code & Builders',
  NETWORK_IP = 'Network & IP',
  ACCESSIBILITY_TOOLS = 'Accessibility Tools',
  BUSINESS_MARKETING = 'Business & Marketing',
  E_COMMERCE_RETAIL = 'E-commerce & Retail',
  HR_RECRUITING = 'HR & Recruiting',
  LEGAL_COMPLIANCE = 'Legal & Compliance',
  PROJECT_MANAGEMENT = 'Project Management',
  FINANCE = 'Finance',
  SEO_WEB = 'SEO & Web',
  TEXT_CONTENT = 'Text & Content',
  IMAGE_VIDEO = 'Image & Video',
  AUDIO_MUSIC = 'Audio & Music',
  ANIMATION_3D = 'Animation & 3D',
  BRANDING_LOGOS = 'Branding & Logos',
  DESIGN_COLOR = 'Design & Color',
  SOCIAL_MEDIA = 'Social Media',
  INFLUENCER_ADS = 'Influencer & Ads',
  PRODUCTIVITY = 'Productivity',
  DOCUMENTS_FORMS = 'Documents & Forms',
  PDF_FILE = 'PDF & File',
  CONVERSION_TOOLS = 'Conversion Tools',
  CALCULATION_MATH = 'Calculation & Math',
  DATE_TIME = 'Date & Time',
  LANGUAGE_TRANSLATION = 'Language & Translation',
  SECURITY_ENCODING = 'Security & Encoding',
  PASSWORD_ACCESS = 'Password & Access',
  ENCRYPTION_HASHING = 'Encryption & Hashing',
  LIFESTYLE_HOBBIES = 'Lifestyle & Hobbies',
  HEALTH_FITNESS = 'Health & Fitness',
  MAPS_GEO = 'Maps & Geo',
  ENVIRONMENT_WEATHER = 'Environment & Weather',
  EVENT_POLLING = 'Event & Polling',
  GAMING = 'Gaming',
  EDUCATION_LEARNING = 'Education & Learning',
  KIDS_LEARNING = 'Kids & Learning',
  RANDOM_FUN = 'Randomness & Fun',
  MESSAGING_CHAT = 'Messaging & Chat',
  PLANNER_PRINTABLE = 'Planner & Printable',
};

export type ToolStatus = 'live' | 'dead' | 'scanning' | 'unchecked';

export interface Tool {
  name: string;
  description: string;
  category: Category | string;
  link: string;
  tags?: string[];
  loginRequired?: boolean;
  adsDisabled?: boolean;
  isSponsored?: boolean;
  clickCount?: number;
  title?: string;
  metaDescription?: string;
  keywords?: string;
  thumbnail?: string;
  layout?: 'default' | 'medium' | 'large' | 'wide' | 'full';
}

export interface SiteSettings {
  siteTitle: string;
  metaDescription: string;
  metaKeywords: string;
  adsenseId: string;
  adSlotIdMain: string;
  adSlotIdToolPage: string;
  adSlotIdInFeed: string;
}

export interface AuthorSettings {
  authorName: string;
  authorBio: string;
  authorImageUrl: string;
  buyMeACoffeeUrl: string;
  twitterUrl: string;
  githubUrl: string;
  footerText: string;
}

export interface LayoutSettings {
  showToolOfTheDay: boolean;
  showFeaturedTools: boolean;
  customToolOfTheDay: string;
  customFeaturedTools: string[];
  showAffiliateSection: boolean;
}

export interface FirebaseSettings {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface Report {
  id: string;
  timestamp: number;
  status: 'Open' | 'Reviewed' | 'Fixed';
  tool: string;
  category: string;
  description: string;
  email?: string;
}

export interface AffiliateItem {
  id: string;
  name: string;
  description: string;
  link: string;
  imageUrl: string;
  callToAction: string;
}
