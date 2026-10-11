import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, Search, Star, ShieldCheck, Clock, DollarSign, Send, 
  MessageSquare, User, PlusCircle, CheckCircle2, AlertCircle, 
  Sparkles, Award, ArrowRight, ChevronRight, ChevronDown, ChevronLeft, Filter, Globe, Lock, Check, RefreshCw, ArrowLeft, X, Paperclip,
  Settings, Users, Layers, TrendingUp, AlertTriangle, Eye, Trash2, CheckCircle, BarChart3,
  LayoutDashboard, ShieldAlert, Sliders, LogOut, FileText, Activity, Wallet, Scale, CornerDownLeft, ShoppingBag, CreditCard,
  HelpCircle, Flag, MessageCircle, FileCode, KeyRound, Shield, ExternalLink,
  Heart, Mail, Bell, Grid, List
} from 'lucide-react';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { UserWalletsLedgerModule } from './components/UserWalletsLedgerModule';
import { AdminOrdersManager } from './components/AdminOrdersManager';
import { SiteFeeSettingsModule } from './components/SiteFeeSettingsModule';
import { PaymentsModule } from './components/PaymentsModule';
import { FreelancerProfileView } from './components/FreelancerProfileView';
import * as DatabaseService from './services/DatabaseService';

interface GigExtra {
  id: string;
  title: string;
  price: number;
}

interface Gig {
  id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerUsername?: string;
  freelancerAvatar: string;
  freelancerLevel?: string;
  title: string;
  slug?: string;
  category: string;
  subcategory?: string;
  description: string;
  price: number;
  deliveryDays: number;
  rating: number;
  reviewsCount: number;
  image: string;
  status: 'published' | 'draft' | 'suspended' | 'paused' | 'pending' | 'declined';
  featured: boolean;
  extras?: GigExtra[];
  moderationStatus?: 'approved' | 'flagged' | 'rejected' | 'pending';
  moderationNotes?: string;
}

interface Project {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  title: string;
  slug?: string;
  category: string;
  subcategory?: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadlineDays: number;
  proposalsCount: number;
  createdAt: string;
  status: 'open' | 'published' | 'unpublished' | 'suspended' | 'in_progress' | 'completed';
  featured: boolean;
  moderationStatus?: 'approved' | 'flagged' | 'rejected' | 'pending';
  moderationNotes?: string;
}

interface Proposal {
  id: string;
  projectId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerTitle: string;
  coverLetter: string;
  bidAmount: number;
  deliveryDays: number;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface Order {
  id: string;
  title: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'funded_in_escrow' | 'in_progress' | 'delivered' | 'completed' | 'disputed' | 'revision' | 'cancelled';
  createdAt: string;
  dueDate: string;
  requirements?: string;
  deliverables?: string;
  deliverableFiles?: Array<{ id: string; name: string; url: string; size: string; uploadedAt: string }>;
  revisions?: Array<{ id: string; requestedAt: string; reason: string; status: string }>;
  adminNotes?: string;
  isMuted?: boolean;
  escrowProtectionStartDate?: string;
  escrowProtectionEndDate?: string;
  gigId?: string;
  projectId?: string;
  serviceUrl?: string;
  gigSlug?: string;
  sellerUsername?: string;
  serviceTitle?: string;
  escrowState?: string;
}

interface UserAccount {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: string;
  avatar: string;
  title: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  earned: number;
  completedJobs: number;
  bio: string;
  skills: string[];
  status: 'active' | 'suspended' | 'restricted';
  verified: boolean;
  walletBalance: number;
  createdAt: string;
  isAvailableNow?: boolean;
}

interface Dispute {
  id: string;
  orderId: string;
  raisedBy: string;
  reason: string;
  evidence: string;
  status: 'open' | 'under_investigation' | 'resolved_refund' | 'resolved_release' | 'resolved_partial';
  createdAt: string;
  resolutionNotes?: string;
  assignedTo?: string;
}

interface Refund {
  id: string;
  orderId: string;
  buyerId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Payout {
  id: string;
  freelancerId: string;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'processed' | 'failed' | 'cancelled' | 'reversed';
  createdAt: string;
  accountDetails: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  order: number;
  subcategories: { id: string; name: string; slug: string; enabled: boolean }[];
}

interface Review {
  id: string;
  orderId: string;
  reviewerName: string;
  reviewerAvatar: string;
  targetUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  messages: { sender: string; text: string; timestamp: string }[];
}

interface AuditLog {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

interface Message {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  type?: 'message' | 'system' | 'file';
  fileInfo?: { name: string; size: string; url: string };
}

interface UserEmail {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  body: string;
  type: 'SUSPEND' | 'RESTRICT' | 'IMPERSONATE' | 'GENERAL';
  sentAt: string;
  read: boolean;
}

const CATEGORY_SLUGS: Record<string, string> = {
  'All': 'all',
  'Development & IT': 'development-it',
  'AI & Data': 'ai-data',
  'Design & Creative': 'design-creative',
  'Mobile Apps': 'mobile-apps'
};

const SLUG_TO_CATEGORY: Record<string, string> = {
  'all': 'All',
  'development-it': 'Development & IT',
  'ai-data': 'AI & Data',
  'design-creative': 'Design & Creative',
  'mobile-apps': 'Mobile Apps'
};

export default function App() {
  // Routing
  const [path, setPath] = useState<string>(window.location.pathname || '/');
  
  // Impersonation State
  const [impersonatedUser, setImpersonatedUser] = useState<UserAccount | null>(null);

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const toggleAvailableNow = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, isAvailableNow: !currentUser.isAvailableNow };
    setCurrentUser(updated);
    alert(updated.isAvailableNow ? 'You are now marked as Available Now! Clients will see your green status.' : 'You are now marked as Unavailable.');
  };

  // Data states
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    setUsersList(DatabaseService.Users);
    setGigs(DatabaseService.Gigs);
  }, []);

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [serviceOptionFilter, setServiceOptionFilter] = useState<string>('All');
  const [sellerLevelFilter, setSellerLevelFilter] = useState<string>('All');
  const [budgetFilter, setBudgetFilter] = useState<string>('All');
  const [deliveryTimeFilter, setDeliveryTimeFilter] = useState<number | null>(null);
  const [proServicesOnly, setProServicesOnly] = useState<boolean>(false);
  const [onlineNowOnly, setOnlineNowOnly] = useState<boolean>(false);

  // Proposal & Creation states
  const [proposalBid, setProposalBid] = useState('');
  const [proposalDays, setProposalDays] = useState('');
  const [proposalCover, setProposalCover] = useState('');
  const [isGeneratingAIProposal, setIsGeneratingAIProposal] = useState(false);

  const [newGigTitle, setNewGigTitle] = useState('');
  const [newGigCat, setNewGigCat] = useState('Development & IT');
  const [newGigDesc, setNewGigDesc] = useState('');
  const [newGigPrice, setNewGigPrice] = useState(450);
  const [newGigDays, setNewGigDays] = useState(5);
  const [isOptimizingGig, setIsOptimizingGig] = useState(false);

  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjCat, setNewProjCat] = useState('Development & IT');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjMin, setNewProjMin] = useState(500);
  const [newProjMax, setNewProjMax] = useState(2000);

  // Active chat order selection
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');

  // Workstream / People / Seller Profile state (PeoplePerHour style)
  const [workstreamTab, setWorkstreamTab] = useState<'all' | 'inbox' | 'discussion' | 'in_progress' | 'completed' | 'starred' | 'archived' | 'escrow'>('all');
  const [activeWorkstreamSubTab, setActiveWorkstreamSubTab] = useState<'activity' | 'files'>('activity');
  const [workstreamSearch, setWorkstreamSearch] = useState('');
  const [peopleSearch, setPeopleSearch] = useState('');
  const [starredWorkstreams, setStarredWorkstreams] = useState<string[]>([]);
  const [hydratedWorkstreams, setHydratedWorkstreams] = useState<any[]>([]);
  const [selectedPersonFilter, setSelectedPersonFilter] = useState<string | null>(null);
  const [isStartWorkstreamModalOpen, setIsStartWorkstreamModalOpen] = useState(false);
  const [newWsTitle, setNewWsTitle] = useState('');
  const [newWsRecipient, setNewWsRecipient] = useState('Stephen (UK)');
  const [newWsAmount, setNewWsAmount] = useState(350);
  const [profileTab, setProfileTab] = useState<'gigs' | 'portfolio' | 'reviews' | 'endorsements'>('gigs');

  useEffect(() => {
    const userId = impersonatedUser ? impersonatedUser.id : currentUser?.id;
    if (userId) {
      setHydratedWorkstreams(DatabaseService.getHydratedWorkstreams(userId));
    } else {
      setHydratedWorkstreams([]);
    }
  }, [currentUser, impersonatedUser]);

  const handleCreateNewWorkstream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsTitle.trim()) return;
    const activeUid = impersonatedUser ? impersonatedUser.id : (currentUser?.id || 'user_1');
    const newOrd: Order = {
      id: `ord_${Date.now()}`,
      title: newWsTitle,
      buyerId: activeUid,
      sellerId: newWsRecipient,
      amount: newWsAmount,
      status: 'in_progress',
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7*86400000).toISOString().split('T')[0],
      requirements: 'Initial scope agreed via workstream.'
    };
    setOrders([newOrd, ...orders]);
    setSelectedOrder(newOrd);
    setIsStartWorkstreamModalOpen(false);
    setNewWsTitle('');
    alert(`Workstream "${newWsTitle}" successfully started!`);
  };

  // Admin Module Navigation (20 Modules)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<
    'overview' | 'users' | 'projects' | 'gigs' | 'categories' | 
    'proposals' | 'contracts' | 'payments' | 'wallet' | 'escrow' | 
    'disputes' | 'refunds' | 'payouts' | 'reviews' | 'messages' | 
    'reports' | 'support' | 'cms' | 'settings' | 'security' | 'activity' | 'orders'
  >('overview');

  const [platformFee, setPlatformFee] = useState<number>(20);
  const [escrowProtectionDays, setEscrowProtectionDays] = useState<number>(14);
  const [ticketReplyText, setTicketReplyText] = useState<string>('');
  const [disputeNotesText, setDisputeNotesText] = useState<string>('');

  // Activity Audit Log Search & Filter
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [activityActionFilter, setActivityActionFilter] = useState('all');

  // Freelance Activity view state
  const [freelanceTab, setFreelanceTab] = useState<'projects' | 'offers'>('offers');
  const [freelanceSubFilter, setFreelanceSubFilter] = useState<string>('All');
  const [activeFeatureDropdownGigId, setActiveFeatureDropdownGigId] = useState<string | null>(null);

  // User Notifications & Support Desk Modal State
  const [userEmails, setUserEmails] = useState<UserEmail[]>([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isUserSwitchModalOpen, setIsUserSwitchModalOpen] = useState(false);
  const [likedGigIds, setLikedGigIds] = useState<string[]>([]);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isWorkstreamsDropdownOpen, setIsWorkstreamsDropdownOpen] = useState(false);
  const [gigViewMode, setGigViewMode] = useState<'grid' | 'list'>('grid');
  const [isPuppetVideoPlaying, setIsPuppetVideoPlaying] = useState(false);
  const [isHeaderSearchDropdownOpen, setIsHeaderSearchDropdownOpen] = useState(false);

  const handleToggleLike = (gigId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLikedGigIds(prev => 
      prev.includes(gigId) ? prev.filter(id => id !== gigId) : [...prev, gigId]
    );
  };

  // Auth & Verification States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupName, setSignupName] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyMobile, setVerifyMobile] = useState('');
  const [emailCodeInput, setEmailCodeInput] = useState('');
  const [smsCodeInput, setSmsCodeInput] = useState('');
  const [verificationMode, setVerificationMode] = useState<'email' | 'sms'>('email');
  const [mockEmailCodeDisplay, setMockEmailCodeDisplay] = useState('');
  const [mockSmsCodeDisplay, setMockSmsCodeDisplay] = useState('');

  const [forgotQuery, setForgotQuery] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [forgotCode, setForgotCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [mockForgotCodeDisplay, setMockForgotCodeDisplay] = useState('');

  // 2FA / Device Verification Login States
  const [loginRequiresCode, setLoginRequiresCode] = useState(false);
  const [loginCode, setLoginCode] = useState('');
  const [loginVerificationMessage, setLoginVerificationMessage] = useState('');

  // Admin Portal 2FA States
  const [adminLoginRequiresCode, setAdminLoginRequiresCode] = useState(false);
  const [adminLoginCode, setAdminLoginCode] = useState('');
  const [adminMockCodeDisplay, setAdminMockCodeDisplay] = useState('');

  const getDeviceId = (): string => {
    let devId = localStorage.getItem('workperhour_device_id');
    if (!devId) {
      devId = 'dev_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('workperhour_device_id', devId);
    }
    return devId;
  };

  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  // User Management State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended' | 'restricted'>('all');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userVerifiedFilter, setUserVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  
  // Inspect & Edit User Modals
  const [inspectingUser, setInspectingUser] = useState<UserAccount | null>(null);
  const [userActivityTab, setUserActivityTab] = useState<'overview' | 'gigs' | 'projects' | 'proposals' | 'orders' | 'reviews' | 'tickets'>('overview');
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    role: 'user',
    title: '',
    bio: '',
    skills: '',
    hourlyRate: 0,
    walletBalance: 0,
    verified: false,
    status: 'active'
  });
  
  // Category & Subcategory Management State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatSlug, setEditCatSlug] = useState('');
  const [addingSubForCatId, setAddingSubForCatId] = useState<string | null>(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [editingSubId, setEditingSubId] = useState<{ catId: string; subId: string } | null>(null);
  const [editSubName, setEditSubName] = useState('');
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
  const [selectedSubPairs, setSelectedSubPairs] = useState<{ catId: string; subId: string }[]>([]);

  // Admin Projects Management State
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState<'all' | 'open' | 'published' | 'unpublished' | 'suspended' | 'in_progress' | 'completed'>('all');
  const [projectCategoryFilter, setProjectCategoryFilter] = useState('all');
  const [projectFeaturedFilter, setProjectFeaturedFilter] = useState<'all' | 'featured' | 'regular'>('all');

  // Modals & Drawers for Projects Management
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectForm, setEditProjectForm] = useState({
    title: '',
    category: '',
    subcategory: '',
    description: '',
    budgetMin: 0,
    budgetMax: 0,
    deadlineDays: 14,
    status: 'open' as Project['status'],
    featured: false
  });
  const [moderatingProject, setModeratingProject] = useState<Project | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');
  const [moderationStatus, setModerationStatus] = useState<'approved' | 'flagged' | 'rejected' | 'pending'>('approved');

  // Admin Gigs Management State
  const [gigSearchQuery, setGigSearchQuery] = useState('');
  const [gigStatusFilter, setGigStatusFilter] = useState<'all' | 'published' | 'draft' | 'suspended'>('all');
  const [gigCategoryFilter, setGigCategoryFilter] = useState('all');
  const [gigFeaturedFilter, setGigFeaturedFilter] = useState<'all' | 'featured' | 'regular'>('all');

  // Modals & Drawers for Gigs Management
  const [viewingGig, setViewingGig] = useState<Gig | null>(null);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [editGigForm, setEditGigForm] = useState({
    title: '',
    category: '',
    subcategory: '',
    description: '',
    price: 0,
    deliveryDays: 1,
    status: 'published' as Gig['status'],
    featured: false
  });
  const [moderatingGig, setModeratingGig] = useState<Gig | null>(null);
  const [gigModerationNotes, setGigModerationNotes] = useState('');
  const [gigModerationStatus, setGigModerationStatus] = useState<'approved' | 'flagged' | 'rejected' | 'pending'>('approved');
  const [gigToDelete, setGigToDelete] = useState<{ id: string; title?: string } | null>(null);
  const [deleteSuccessToast, setDeleteSuccessToast] = useState<string | null>(null);
  
  // Admin Proposals Management State
  const [proposalSearchQuery, setProposalSearchQuery] = useState('');
  const [proposalStatusFilter, setProposalStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [proposalSort, setProposalSort] = useState<'newest' | 'bid_high' | 'bid_low'>('newest');
  const [proposalBidMinFilter, setProposalBidMinFilter] = useState('');
  const [proposalBidMaxFilter, setProposalBidMaxFilter] = useState('');
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [editProposalForm, setEditProposalForm] = useState({
    bidAmount: 0,
    deliveryDays: 1,
    coverLetter: '',
    status: 'pending' as Proposal['status']
  });

  // Admin Orders Management State
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'funded_in_escrow' | 'in_progress' | 'delivered' | 'completed' | 'disputed'>('all');
  const [orderGigFilter, setOrderGigFilter] = useState('all');
  const [orderProjectFilter, setOrderProjectFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [associatingOrder, setAssociatingOrder] = useState<Order | null>(null);
  const [linkTargetType, setLinkTargetType] = useState<'gig' | 'project'>('gig');
  const [linkTargetId, setLinkTargetId] = useState('');

  // Gig Extras state
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [newGigExtras, setNewGigExtras] = useState<{ id: string; title: string; price: number }[]>([
    { id: 'ext_fast', title: 'Extra Fast Express Delivery', price: 100 }
  ]);
  const [extraTitleInput, setExtraTitleInput] = useState('');
  const [extraPriceInput, setExtraPriceInput] = useState(50);

  const wsRef = useRef<WebSocket | null>(null);

  const handleAddGigExtra = () => {
    if (!extraTitleInput.trim() || extraPriceInput <= 0) return;
    setNewGigExtras(prev => [
      ...prev,
      { id: 'ext_' + Date.now(), title: extraTitleInput.trim(), price: Number(extraPriceInput) }
    ]);
    setExtraTitleInput('');
    setExtraPriceInput(50);
  };

  const handleRemoveGigExtra = (id: string) => {
    setNewGigExtras(prev => prev.filter(e => e.id !== id));
  };

  // Helper function to create URL slugs
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Get Fiverr-style clean URL for a gig: /:username/:slug
  const getGigUrl = (gig: Gig) => {
    const uname = (gig.freelancerUsername || slugify(gig.freelancerName)).toLowerCase();
    const gslug = (gig.slug || slugify(gig.title)).toLowerCase();
    return `/${uname}/${gslug}`;
  };

  // Get clean URL for a project: /project/:slug
  const getProjectUrl = (project: Project) => {
    const pslug = (project.slug || slugify(project.title)).toLowerCase();
    return `/project/${pslug}`;
  };

  // Reserved top-level route segments
  const reservedRoutes = ['gigs', 'projects', 'categories', 'orders', 'messages', 'create-gig', 'post-project', 'admin', 'profile', 'payments', 'freelancers', 'freelance-activity'];

  // Route matching
  const pathParts = path.split('/').filter(Boolean);

  const isCategoryRoute = path.startsWith('/categories/');
  const categorySlug = isCategoryRoute ? path.replace('/categories/', '') : null;
  const currentCategory = categorySlug ? (SLUG_TO_CATEGORY[categorySlug] || 'All') : 'All';

  const isProjectsList = path === '/projects';
  const isOrders = path === '/orders';
  const isMessages = path.startsWith('/messages');
  const messageOrderId = path.startsWith('/messages/') ? path.split('/')[2] : null;
  const isCreateGig = path === '/create-gig';
  const isPostProject = path === '/post-project';
  const isPayments = path.startsWith('/payments');
  const isAdmin = path === '/admin';

  // Gig detail route check: Fiverr style /:username/:slug OR /gigs/:id
  let currentGig: Gig | undefined = undefined;
  let isGigDetail = false;

  if (pathParts.length === 2 && !reservedRoutes.includes(pathParts[0].toLowerCase())) {
    const usernameParam = pathParts[0].toLowerCase();
    const slugParam = pathParts[1].toLowerCase();

    currentGig = gigs.find(g => {
      const gigUsername = (g.freelancerUsername || slugify(g.freelancerName)).toLowerCase();
      const gigSlug = (g.slug || slugify(g.title)).toLowerCase();
      return gigSlug === slugParam || g.id === slugParam || slugParam.includes(gigSlug.slice(0, 10)) || gigUsername.includes(usernameParam);
    });

    if (!currentGig && gigs.length > 0) {
      currentGig = gigs[0];
    }

    if (currentGig) {
      isGigDetail = true;
    }
  } else if (path.startsWith('/gigs/') && path.length > 6) {
    const gigIdParam = path.replace('/gigs/', '').toLowerCase();
    currentGig = gigs.find(g => g.id === gigIdParam || (g.slug && g.slug.toLowerCase() === gigIdParam));
    if (!currentGig && gigs.length > 0) {
      currentGig = gigs[0];
    }
    if (currentGig) {
      isGigDetail = true;
    }
  }

  let isProfilePage = false;
  let profileUserUsername = null;
  if (!isGigDetail) {
    if (pathParts.length === 1 && !reservedRoutes.includes(pathParts[0].toLowerCase())) {
      profileUserUsername = pathParts[0].toLowerCase();
      isProfilePage = true;
    } else if (path.startsWith('/profile/') && pathParts.length >= 2) {
      profileUserUsername = pathParts[1].toLowerCase();
      isProfilePage = true;
    }
  }

  const profileUser = isProfilePage 
    ? (usersList.find(u => slugify(u.name) === profileUserUsername || u.id === profileUserUsername) || (impersonatedUser || currentUser || usersList[0]))
    : null;

  const isGigsList = (path === '/gigs' || path === '/' || isCategoryRoute) && !isGigDetail && !isProfilePage;

  // Sync pathname route
  useEffect(() => {
    const handlePopState = () => {
      const newPath = window.location.pathname || '/';
      if ((newPath.startsWith('/messages') || newPath.startsWith('/workstreams')) && !localStorage.getItem('token') && !localStorage.getItem('workperhour_token')) {
        window.history.replaceState({}, '', '/');
        setPath('/');
        setIsLoginModalOpen(true);
        return;
      }
      setPath(newPath);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (path === '/payments') {
      setAdminTab('payments');
    } else if (path === '/gigs') {
      setAdminTab('overview');
    }
  }, [path]);

  // Sync selected order for messages deep link
  useEffect(() => {
    if (messageOrderId && orders.length > 0) {
      const ord = orders.find(o => o.id === messageOrderId);
      if (ord) {
        setSelectedOrder(ord);
        fetchMessages(ord.id);
      }
    } else if (path === '/messages') {
      setSelectedOrder(null);
    }
  }, [messageOrderId, orders, path]);

  const navigate = (to: string, e?: React.MouseEvent) => {
    if ((to.startsWith('/messages') || to.startsWith('/workstreams')) && !currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    if (e) e.preventDefault();
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch initial data
  useEffect(() => {
    if (window.location.pathname === '/messages' && !localStorage.getItem('token') && !localStorage.getItem('workperhour_token')) {
        setPath('/');
        window.history.replaceState({}, '', '/');
        setIsLoginModalOpen(true);
    }
    const token = localStorage.getItem('workperhour_token') || localStorage.getItem('token');
    if (token) {
        fetchAllAdminData();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'MESSAGE_RECEIVED') {
          setMessages(prev => [...prev, data.message]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isUserDropdownOpen) setIsUserDropdownOpen(false);
      if (isWorkstreamsDropdownOpen) setIsWorkstreamsDropdownOpen(false);
      if (isHeaderSearchDropdownOpen) setIsHeaderSearchDropdownOpen(false);
    };
    if (isUserDropdownOpen || isWorkstreamsDropdownOpen || isHeaderSearchDropdownOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isUserDropdownOpen, isWorkstreamsDropdownOpen, isHeaderSearchDropdownOpen]);

  const safeJson = async (res: Response, fallback: any = []) => {
    if (!res.ok) return fallback;
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return fallback;
    try {
      return await res.json();
    } catch {
      return fallback;
    }
  };

  const loadUserSession = async (): Promise<boolean> => {
    const token = localStorage.getItem('workperhour_token') || localStorage.getItem('token');
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        localStorage.removeItem('workperhour_token');
        localStorage.removeItem('token');
        return false;
      }
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const fetchUserEmails = async (userId: string) => {
    try {
      const res = await fetch(`/api/user-emails/${userId}`);
      const data = await safeJson(res, []);
      setUserEmails(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const activeUserId = impersonatedUser ? impersonatedUser.id : (currentUser ? currentUser.id : null);
    if (activeUserId) {
        fetchUserEmails(activeUserId);
        fetchAllAdminData();
    }
  }, [impersonatedUser, currentUser]);

  const fetchAllAdminData = async () => {
    try {
      const activeUserId = impersonatedUser ? impersonatedUser.id : (currentUser ? currentUser.id : null);
      if (activeUserId) {
        fetchUserEmails(activeUserId);
      }
      const token = localStorage.getItem('workperhour_token') || localStorage.getItem('token');
      const authHeaders: Record<string, string> = {
        'x-device-id': getDeviceId(),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const reqOpt = { headers: authHeaders };

      const responses = await Promise.all([
        fetch('/api/users', reqOpt),
        fetch('/api/gigs', reqOpt),
        fetch('/api/projects', reqOpt),
        fetch('/api/proposals', reqOpt),
        fetch('/api/orders', reqOpt),
        fetch('/api/disputes', reqOpt),
        fetch('/api/refunds', reqOpt),
        fetch('/api/payouts', reqOpt),
        fetch('/api/categories', reqOpt),
        fetch('/api/reviews', reqOpt),
        fetch('/api/support-tickets', reqOpt),
        fetch('/api/audit-logs', reqOpt),
        fetch('/api/admin/settings', reqOpt)
      ]);

      if (responses.some(r => r.status === 401)) {
        console.error('DEBUG: Authentication required for one or more requests');
        return;
      }

      const [uRes, gRes, pRes, prRes, oRes, dRes, rRes, payRes, cRes, revRes, sRes, aRes, setRes] = responses;

      const usersData = await safeJson(uRes, []);
      const gigsData = await safeJson(gRes, []);
      const projectsData = await safeJson(pRes, []);
      const proposalsData = await safeJson(prRes, []);
      const ords = await safeJson(oRes, []);
      const disputesData = await safeJson(dRes, []);
      const refundsData = await safeJson(rRes, []);
      const payoutsData = await safeJson(payRes, []);
      const categoriesData = await safeJson(cRes, []);
      const reviewsData = await safeJson(revRes, []);
      const supportTicketsData = await safeJson(sRes, []);
      const auditLogsData = await safeJson(aRes, []);
      const settingsData = await safeJson(setRes, null);

      if (usersData.length > 0) {
        setUsersList(usersData);
      } else {
        setUsersList(DatabaseService.Users);
      }
      if (gigsData.length > 0) {
        setGigs(gigsData);
      } else {
        setGigs(DatabaseService.Gigs);
      }
      if (projectsData.length > 0) setProjects(projectsData);
      if (proposalsData.length > 0) setProposals(proposalsData);
      if (ords.length > 0) {
        setOrders(ords);
        if (!selectedOrder) {
          setSelectedOrder(ords[0]);
          fetchMessages(ords[0].id);
        }
      }
      if (disputesData.length > 0) setDisputes(disputesData);
      if (refundsData.length > 0) setRefunds(refundsData);
      if (payoutsData.length > 0) setPayouts(payoutsData);
      if (categoriesData.length > 0) setCategories(categoriesData);
      if (reviewsData.length > 0) setReviews(reviewsData);
      if (supportTicketsData.length > 0) setSupportTickets(supportTicketsData);
      if (auditLogsData.length > 0) setAuditLogs(auditLogsData);
      if (settingsData && settingsData.freelancerCommissionRate !== undefined) {
        setPlatformFee(settingsData.freelancerCommissionRate);
        if (settingsData.escrowHoldDays) setEscrowProtectionDays(settingsData.escrowHoldDays);
      }
    } catch (e) {
      console.error('Error loading admin data:', e);
    }
  };

  const fetchMessages = async (orderId: string) => {
    try {
      const token = localStorage.getItem('workperhour_token') || localStorage.getItem('token');
      console.log('DEBUG: Fetching messages for', orderId, 'with token', token);
      const res = await fetch(`/api/messages/${orderId}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.status === 401) {
        console.error('DEBUG: Authentication required');
        return;
      }
      const data = await safeJson(res, []);
      if (!res.ok) {
        console.error('DEBUG: Fetch failed', res.status, res.statusText);
      }
      setMessages(data);
    } catch (err) {
      console.error('DEBUG: Fetch error', err);
    }
  };

  const handleContactSeller = async (sellerId: string, sellerName: string, gigTitle: string) => {
    const currentUid = impersonatedUser ? impersonatedUser.id : currentUser?.id;
    
    // 1. Search for existing conversation between current user and this seller
    let existingOrder = orders.find(o => 
      (o.buyerId === currentUid && o.sellerId === sellerId) || 
      (o.sellerId === currentUid && o.buyerId === sellerId)
    );
    
    if (existingOrder) {
      setSelectedOrder(existingOrder);
      await fetchMessages(existingOrder.id);
    } else {
      if (!currentUser) {
        setIsLoginModalOpen(true);
        return;
      }
      // 2. Create an inquiry conversation thread and send initial greeting message
      try {
        const currentUname = impersonatedUser ? impersonatedUser.name : currentUser.name;
        const token = localStorage.getItem('workperhour_token') || localStorage.getItem('token');
        const authHeaders = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            title: `Inquiry: ${gigTitle}`,
            buyerId: currentUid,
            sellerId: sellerId,
            amount: 0,
            dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
          })
        });
        
        const resData = await res.json();
        if (!res.ok) {
          window.alert(resData.error || 'Failed to start conversation.');
          return;
        }

        const newChatOrd = resData;
        setOrders(prev => [newChatOrd, ...prev]);
        setSelectedOrder(newChatOrd);

        // Send initial inquiry message
        const initText = `Hi ${sellerName}, I am interested in your gig: "${gigTitle}". Let's discuss details!`;
        await fetch('/api/messages', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            orderId: newChatOrd.id,
            senderId: currentUid,
            senderName: currentUname,
            text: initText
          })
        });
        await fetchMessages(newChatOrd.id);
        navigate(`/messages/${newChatOrd.id}`);
      } catch (err) {
        console.error('Error creating contact chat:', err);
      }
    }

  };

  // Category Management Handlers
  const handleToggleCategory = async (catId: string) => {
    try {
      const res = await fetch(`/api/admin/categories/${catId}/toggle`, { method: 'PATCH' });
      const data = await safeJson(res, null);
      if (data) setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubcategory = async (catId: string, subId: string) => {
    try {
      const res = await fetch(`/api/admin/categories/${catId}/subcategories/${subId}/toggle`, { method: 'PATCH' });
      const data = await safeJson(res, null);
      if (data) setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDeleteCategories = async () => {
    const totalCount = selectedCatIds.length + selectedSubPairs.length;
    if (totalCount === 0) return;
    if (!confirm(`Are you sure you want to bulk delete ${totalCount} selected items?`)) return;

    try {
      const res = await fetch('/api/admin/categories/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryIds: selectedCatIds,
          subcategoryPairs: selectedSubPairs
        })
      });
      const data = await safeJson(res, null);
      if (data) {
        setCategories(data);
        setSelectedCatIds([]);
        setSelectedSubPairs([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim(), slug: newCategorySlug.trim() })
      });
      const data = await safeJson(res, null);
      if (data) setCategories(data);
      setNewCategoryName('');
      setNewCategorySlug('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCategory = async (catId: string) => {
    try {
      const res = await fetch(`/api/admin/categories/${catId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editCatName.trim(), slug: editCatSlug.trim() })
      });
      const data = await safeJson(res, null);
      if (data) setCategories(data);
      setEditingCatId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (catId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}" and its subcategories?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${catId}`, {
        method: 'DELETE'
      });
      const data = await safeJson(res, null);
      if (data) setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubcategory = async (catId: string) => {
    if (!newSubcategoryName.trim()) return;
    try {
      const res = await fetch(`/api/admin/categories/${catId}/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubcategoryName.trim() })
      });
      const data = await safeJson(res, null);
      if (data) setCategories(data);
      setAddingSubForCatId(null);
      setNewSubcategoryName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSubcategory = async (catId: string, subId: string) => {
    try {
      const res = await fetch(`/api/admin/categories/${catId}/subcategories/${subId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editSubName.trim() })
      });
      const data = await safeJson(res, null);
      if (data) setCategories(data);
      setEditingSubId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubcategory = async (catId: string, subId: string, subName: string) => {
    if (!confirm(`Delete subcategory "${subName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${catId}/subcategories/${subId}`, {
        method: 'DELETE'
      });
      const data = await safeJson(res, null);
      if (data) setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Impersonation handlers
  const handleStartImpersonation = async (user: UserAccount) => {
    try {
      await fetch(`/api/admin/users/${user.id}/impersonate`, { method: 'POST' });
      setImpersonatedUser(user);
      fetchUserEmails(user.id);
      fetchAllAdminData();
      alert(`Started Super Admin Impersonation of ${user.name}. Security notice sent via chat and email.`);
      navigate('/gigs');
    } catch (e) {
      console.error(e);
      setImpersonatedUser(user);
      navigate('/gigs');
    }
  };

  const handleStopImpersonation = async () => {
    if (impersonatedUser) {
      try {
        await fetch(`/api/admin/users/${impersonatedUser.id}/stop-impersonate`, { method: 'POST' });
      } catch (err) {
        console.error('Error stopping impersonation on backend:', err);
      }
    }
    setImpersonatedUser(null);
    if (currentUser) fetchUserEmails(currentUser.id);
    fetchAllAdminData();
    alert('Impersonation ended. Returned to Admin Console.');
    navigate('/admin');
  };

  const handleOpenEditUserModal = (user: UserAccount) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      title: user.title || '',
      bio: user.bio || '',
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : '',
      hourlyRate: user.hourlyRate || 0,
      walletBalance: user.walletBalance || 0,
      verified: !!user.verified,
      status: user.status || 'active'
    });
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUserForm)
      });
      const updated = await res.json();
      setUsersList(prev => prev.map(u => u.id === editingUser.id ? updated : u));
      if (inspectingUser?.id === editingUser.id) setInspectingUser(updated);
      setEditingUser(null);
      alert(`Updated user profile for ${updated.name}`);
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/verify`, { method: 'PATCH' });
      const updated = await res.json();
      setUsersList(prev => prev.map(u => u.id === id ? updated : u));
      if (inspectingUser?.id === id) setInspectingUser(updated);
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserStatusToggle = async (id: string, newStatus: 'active' | 'suspended' | 'restricted') => {
    try {
      const targetUser = usersList.find(u => u.id === id);
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      setUsersList(prev => prev.map(u => u.id === id ? updated : u));
      if (inspectingUser?.id === id) setInspectingUser(updated);
      if (newStatus === 'suspended' || newStatus === 'restricted') {
        alert(`User ${targetUser?.name || id} status changed to ${newStatus.toUpperCase()}. Automated Chat message and Email notification dispatched asking to contact support.`);
      } else {
        alert(`User ${targetUser?.name || id} activated successfully.`);
      }
      fetchAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user account? All associated freelance gigs and buyer project postings will also be deleted. This action is irreversible.')) return;
    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      setUsersList(prev => prev.filter(u => u.id !== userId));
      if (inspectingUser?.id === userId) setInspectingUser(null);
      alert('User account and all associated listings permanently deleted.');
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Projects Management Handlers
  const handleUpdateProjectStatus = async (projectId: string, newStatus: Project['status']) => {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
      if (viewingProject?.id === projectId) setViewingProject(updated);
      if (editingProject?.id === projectId) setEditingProject(updated);
      if (moderatingProject?.id === projectId) setModeratingProject(updated);
      alert(`Project status updated to "${newStatus.toUpperCase()}".`);
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleProjectFeature = async (projectId: string) => {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/feature`, { method: 'PATCH' });
      const updated = await res.json();
      setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
      if (viewingProject?.id === projectId) setViewingProject(updated);
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditProjectModal = (p: Project) => {
    setEditingProject(p);
    setEditProjectForm({
      title: p.title || '',
      category: p.category || 'Development & IT',
      subcategory: p.subcategory || '',
      description: p.description || '',
      budgetMin: p.budgetMin || 0,
      budgetMax: p.budgetMax || 0,
      deadlineDays: p.deadlineDays || 14,
      status: p.status || 'open',
      featured: !!p.featured
    });
  };

  const handleSaveEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      const res = await fetch(`/api/admin/projects/${editingProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProjectForm)
      });
      const updated = await res.json();
      setProjects(prev => prev.map(p => p.id === editingProject.id ? updated : p));
      setEditingProject(null);
      alert(`Project "${updated.title}" updated successfully.`);
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModerationModal = (p: Project) => {
    setModeratingProject(p);
    setModerationStatus(p.moderationStatus || 'approved');
    setModerationNotes(p.moderationNotes || '');
  };

  const handleSaveModeration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moderatingProject) return;
    try {
      const res = await fetch(`/api/admin/projects/${moderatingProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moderationStatus,
          moderationNotes
        })
      });
      const updated = await res.json();
      setProjects(prev => prev.map(p => p.id === moderatingProject.id ? updated : p));
      setModeratingProject(null);
      alert(`Moderation review recorded for project "${updated.title}".`);
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to permanently delete this project?')) return;
    try {
      await fetch(`/api/admin/projects/${projectId}`, { method: 'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (viewingProject?.id === projectId) setViewingProject(null);
      alert('Project deleted successfully.');
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Gigs / Services Management Handlers
  const handleUpdateGigStatus = async (gigId: string, newStatus: Gig['status']) => {
    try {
      const res = await fetch(`/api/admin/gigs/${gigId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      setGigs(prev => prev.map(g => g.id === gigId ? updated : g));
      if (viewingGig?.id === gigId) setViewingGig(updated);
      alert(`Service status updated to "${newStatus.toUpperCase()}".`);
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleGigFeature = async (gigId: string) => {
    try {
      const res = await fetch(`/api/admin/gigs/${gigId}/feature`, { method: 'PATCH' });
      const updated = await res.json();
      setGigs(prev => prev.map(g => g.id === gigId ? updated : g));
      if (viewingGig?.id === gigId) setViewingGig(updated);
      alert(`Service featured status toggled!`);
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditGigModal = (g: Gig) => {
    setEditingGig(g);
    setEditGigForm({
      title: g.title || '',
      category: g.category || 'Development & IT',
      subcategory: g.subcategory || '',
      description: g.description || '',
      price: g.price || 0,
      deliveryDays: g.deliveryDays || 1,
      status: g.status || 'published',
      featured: !!g.featured
    });
  };

  const handleSaveEditGig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGig) return;
    try {
      let updatedGig = { ...editingGig, ...editGigForm };
      try {
        const res = await fetch(`/api/gigs/${editingGig.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editGigForm)
        });
        if (res.ok) {
          updatedGig = await res.json();
        }
      } catch (err) {
        console.warn('Gig patch error:', err);
      }
      try {
        await fetch(`/api/admin/gigs/${editingGig.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editGigForm)
        });
      } catch (e) {
        // admin fallback
      }
      setGigs(prev => prev.map(g => g.id === editingGig.id ? updatedGig : g));
      if (viewingGig?.id === editingGig.id) setViewingGig(updatedGig);
      setEditingGig(null);
      setDeleteSuccessToast(`Gig "${updatedGig.title}" updated successfully.`);
      setTimeout(() => setDeleteSuccessToast(null), 3500);
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenGigModerationModal = (g: Gig) => {
    setModeratingGig(g);
    setGigModerationStatus(g.moderationStatus || 'approved');
    setGigModerationNotes(g.moderationNotes || '');
  };

  const handleSaveGigModeration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moderatingGig) return;
    try {
      const res = await fetch(`/api/admin/gigs/${moderatingGig.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moderationStatus: gigModerationStatus,
          moderationNotes: gigModerationNotes
        })
      });
      const updated = await res.json();
      setGigs(prev => prev.map(g => g.id === moderatingGig.id ? updated : g));
      setModeratingGig(null);
      alert(`Moderation review recorded for service/gig "${updated.title}".`);
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGig = (gigId: string, gigTitle?: string) => {
    const gig = gigs.find(g => g.id === gigId);
    setGigToDelete({ id: gigId, title: gigTitle || gig?.title });
  };

  const handleConfirmDeleteGig = async () => {
    if (!gigToDelete) return;
    const gigId = gigToDelete.id;
    const gigTitle = gigToDelete.title;
    setGigToDelete(null);

    if (viewingGig?.id === gigId) setViewingGig(null);
    if (editingGig?.id === gigId) setEditingGig(null);

    setGigs(prev => prev.filter(g => g.id !== gigId));

    try {
      await fetch(`/api/gigs/${gigId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete gig error:', e);
    }
    try {
      await fetch(`/api/admin/gigs/${gigId}`, { method: 'DELETE' });
    } catch (e) {
      // admin fallback
    }

    setDeleteSuccessToast(`Gig "${gigTitle || 'Service'}" deleted successfully.`);
    setTimeout(() => {
      setDeleteSuccessToast(null);
    }, 4000);

    fetchAllAdminData();
  };

  const handleOpenEditProposalModal = (p: Proposal) => {
    setEditingProposal(p);
    setEditProposalForm({
      bidAmount: p.bidAmount,
      deliveryDays: p.deliveryDays,
      coverLetter: p.coverLetter,
      status: p.status
    });
  };

  const handleSaveEditProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProposal) return;
    try {
      const res = await fetch(`/api/admin/proposals/${editingProposal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProposalForm)
      });
      const updated = await res.json();
      setProposals(prev => prev.map(p => p.id === editingProposal.id ? updated : p));
      setEditingProposal(null);
      alert(`Proposal #${updated.id} updated successfully.`);
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProposalStatus = async (proposalId: string, newStatus: Proposal['status']) => {
    try {
      const res = await fetch(`/api/admin/proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      setProposals(prev => prev.map(p => p.id === proposalId ? updated : p));
      alert(`Proposal status updated to ${newStatus}.`);
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (!confirm('Are you sure you want to permanently delete this proposal? This action is irreversible.')) return;
    try {
      await fetch(`/api/admin/proposals/${proposalId}`, { method: 'DELETE' });
      setProposals(prev => prev.filter(p => p.id !== proposalId));
      if (viewingProposal?.id === proposalId) setViewingProposal(null);
      alert('Proposal deleted successfully.');
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Authentication & Verification Action Handlers

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          confirmPassword: signupConfirmPassword,
          mobile: signupMobile,
          name: signupName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      if (data.token) localStorage.setItem('workperhour_token', data.token);
      if (data.user) {
        setCurrentUser(data.user);
        setImpersonatedUser(null);
      }
      setVerifyEmail(signupEmail);
      setVerifyMobile(signupMobile);
      setMockEmailCodeDisplay(data.mockEmailCode || '');
      setMockSmsCodeDisplay(data.mockSmsCode || '');
      setIsSignupModalOpen(false);
      setIsVerifyModalOpen(true);
      alert('Account created successfully! Please verify your email or mobile number.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail, code: emailCodeInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      if (currentUser) {
        setCurrentUser(prev => prev ? { ...prev, verified: true, emailVerified: true } : null);
      }
      alert('Email verified successfully! Your account is now verified and usable.');
      setIsVerifyModalOpen(false);
      fetchAllAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResendEmailCode = async () => {
    try {
      const res = await fetch('/api/auth/resend-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Resend failed');
      setMockEmailCodeDisplay(data.mockEmailCode || '');
      alert('New verification code sent to your email.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleVerifySmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: verifyMobile, code: smsCodeInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'SMS verification failed');
      if (currentUser) {
        setCurrentUser(prev => prev ? { ...prev, verified: true, mobileVerified: true } : null);
      }
      alert('Mobile verified successfully via SMS! Your account is now verified and usable.');
      setIsVerifyModalOpen(false);
      fetchAllAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResendSmsCode = async () => {
    try {
      const res = await fetch('/api/auth/resend-sms-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: verifyMobile })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Resend SMS failed');
      setMockSmsCodeDisplay(data.mockSmsCode || '');
      alert('New SMS OTP dispatched.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    try {
      let deviceId = 'unknown';
      try {
        deviceId = getDeviceId();
      } catch (e) {
        console.warn('Could not get device ID', e);
      }
      
      const payload: any = {
        email: loginEmail,
        password: loginPassword,
        deviceId
      };
      if (loginRequiresCode && loginCode.trim()) {
        payload.code = loginCode.trim();
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      if (data.requiresVerification) {
        setLoginRequiresCode(true);
        setLoginVerificationMessage(data.message || 'Verification code sent to your registered email.');
        if (data.mockEmailCode) {
          setMockEmailCodeDisplay(data.mockEmailCode);
        }
        return;
      }

      if (data.token) {
        localStorage.setItem('workperhour_token', data.token);
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        setCurrentUser(data.user);
        setImpersonatedUser(null);
      }
      setIsLoginModalOpen(false);
      setLoginRequiresCode(false);
      setLoginCode('');
      setLoginEmail('');
      setLoginPassword('');
      alert('Logged in successfully!');
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrMobile: forgotQuery })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMockForgotCodeDisplay(data.mockRecoveryCode || '');
      setForgotStep('verify');
      alert('Recovery code sent.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleForgotVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/forgot-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrMobile: forgotQuery, code: forgotCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setForgotStep('reset');
      alert('Code verified successfully. Enter new password.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert('Passwords do not match. Please re-enter confirm password.');
      return;
    }
    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrMobile: forgotQuery, code: forgotCode, newPassword, confirmPassword: confirmNewPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset failed');
      alert('Password reset successfully! Please log in with your new password.');
      setIsForgotPasswordModalOpen(false);
      setForgotStep('request');
      setForgotCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsLoginModalOpen(true);
    } catch (err: any) {
      alert(err.message);
    }
  };








  const handleResolveDispute = async (id: string, resolutionStatus: string) => {
    try {
      const res = await fetch(`/api/admin/disputes/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: resolutionStatus, notes: disputeNotesText || 'Resolved by Super Admin.' })
      });
      const updated = await res.json();
      setDisputes(prev => prev.map(d => d.id === id ? updated : d));
      setDisputeNotesText('');
      alert(`Dispute #${id} resolved successfully.`);
      fetchAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSupportReply = async (ticketId: string) => {
    if (!ticketReplyText.trim()) return;
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ticketReplyText })
      });
      const updated = await res.json();
      setSupportTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
      setTicketReplyText('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) return;
    try {
      const activeUserId = impersonatedUser ? impersonatedUser.id : (currentUser ? currentUser.id : 'user_1');
      const res = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': activeUserId },
        body: JSON.stringify({
          subject: supportSubject,
          text: supportMessage,
          priority: 'medium'
        })
      });
      if (res.ok) {
        const newTicket = await res.json();
        setSupportTickets(prev => [newTicket, ...prev]);
        setSupportSubject('');
        setSupportMessage('');
        setIsSupportModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprovePayout = async (payoutId: string) => {
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}/approve`, { method: 'PATCH' });
      const updated = await res.json();
      setPayouts(prev => prev.map(p => p.id === payoutId ? updated : p));
      fetchAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };
  const handleProcessPayout = async (payoutId: string) => {
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}/process`, { method: 'PATCH' });
      const updated = await res.json();
      setPayouts(prev => prev.map(p => p.id === payoutId ? updated : p));
      fetchAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };
  const handleFailPayout = async (payoutId: string) => {
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}/fail`, { method: 'PATCH' });
      const updated = await res.json();
      setPayouts(prev => prev.map(p => p.id === payoutId ? updated : p));
      fetchAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateOrder = async (title: string, amount: number, sellerId: string) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      const token = localStorage.getItem('workperhour_token') || localStorage.getItem('token');
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title,
          buyerId: impersonatedUser ? impersonatedUser.id : currentUser.id,
          sellerId,
          amount,
          dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
        })
      });
      const newOrd = await res.json();
      if (!res.ok) {
        // e.g. insufficient wallet balance: nothing was created or charged
        window.alert(newOrd?.error || 'Could not place the order.');
        return;
      }
      setOrders(prev => [newOrd, ...prev]);
      setSelectedOrder(newOrd);
      fetchMessages(newOrd.id);
      fetchAllAdminData();
      navigate('/orders');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAttachMockFile = () => {
    if (!selectedOrder) return;
    const mockFiles = [
      { name: 'project_brief.pdf', size: '1.2 MB', url: '#' },
      { name: 'logo_assets.zip', size: '45.8 MB', url: '#' },
      { name: 'ui_mockup_v1.fig', size: '8.4 MB', url: '#' },
      { name: 'database_schema.sql', size: '12 KB', url: '#' }
    ];
    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    
    const currentUid = impersonatedUser ? impersonatedUser.id : (currentUser ? currentUser.id : 'user_1');
    const currentUname = impersonatedUser ? impersonatedUser.name : (currentUser ? currentUser.name : 'Guest');

    const payload = {
      type: 'NEW_MESSAGE',
      msgType: 'file',
      orderId: selectedOrder.id,
      senderId: currentUid,
      senderName: currentUname,
      text: `Uploaded file: ${randomFile.name}`,
      fileInfo: randomFile
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      // Fallback
      fetch(`/api/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('workperhour_token')}`
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          text: payload.text,
          type: 'file',
          fileInfo: randomFile
        })
      }).then(() => fetchMessages(selectedOrder.id));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedOrder) return;

    const currentUid = impersonatedUser ? impersonatedUser.id : (currentUser ? currentUser.id : 'user_1');
    const currentUname = impersonatedUser ? impersonatedUser.name : (currentUser ? currentUser.name : 'Guest');

    const payload = {
      type: 'NEW_MESSAGE',
      msgType: 'message',
      orderId: selectedOrder.id,
      senderId: currentUid,
      senderName: currentUname,
      text: newMessageText
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      try {
        const token = localStorage.getItem('workperhour_token') || localStorage.getItem('token');
        await fetch(`/api/messages`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ orderId: selectedOrder.id, text: newMessageText, type: 'message' })
        });
        fetchMessages(selectedOrder.id);
      } catch (err) {
        console.error('Error sending message via API fallback:', err);
      }
    }

    setNewMessageText('');
  };

  const handleGenerateAIProposal = async (projectTitle: string, projectDesc: string) => {
    const currentUname = impersonatedUser ? impersonatedUser.name : (currentUser ? currentUser.name : 'Freelance Specialist');
    setProposalCover(`Dear Client,\n\nI am thrilled to submit my proposal for "${projectTitle}". With extensive experience as a Senior Full-Stack Architect specializing in scalable web applications, secure escrow workflows, and high-performance React/TypeScript systems, I am confident in delivering exceptional results.\n\nProject Understanding: "${projectDesc.substring(0, 100)}..."\n\nI propose a robust architecture with continuous updates and 100% escrow protection. I am ready to start immediately.\n\nBest regards,\n${currentUname}`);
  };

  const handleSubmitProposal = async (e: React.FormEvent, projectId: string) => {
    e.preventDefault();
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          freelancerId: impersonatedUser ? impersonatedUser.id : currentUser.id,
          freelancerName: impersonatedUser ? impersonatedUser.name : currentUser.name,
          freelancerAvatar: impersonatedUser ? impersonatedUser.avatar : currentUser.avatar,
          freelancerTitle: currentUser.title,
          coverLetter: proposalCover,
          bidAmount: Number(proposalBid),
          deliveryDays: Number(proposalDays)
        })
      });
      alert('Proposal submitted successfully!');
      navigate('/projects');
      setProposalCover('');
      setProposalBid('');
      setProposalDays('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeatureUserGig = async (gigId: string) => {
    setGigs(prev => {
      const exists = prev.some(g => g.id === gigId);
      if (exists) {
        return prev.map(g => g.id === gigId ? { ...g, featured: true } : g);
      } else {
        return [
          {
            id: gigId,
            freelancerId: profileUser?.id || 'user_1',
            freelancerName: profileUser?.name || 'Freelancer',
            freelancerUsername: profileUser ? slugify(profileUser.name) : 'freelancer',
            freelancerAvatar: profileUser?.avatar || '',
            title: gigId === 'gig_sample_1' ? 'I will build full-stack React & TypeScript web apps with secure Escrow' : 'I will integrate Gemini AI agents and automated workflows',
            category: 'Development & IT',
            description: 'Featured service gig.',
            price: 450,
            deliveryDays: 3,
            rating: 5.0,
            reviewsCount: 84,
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&h=300&fit=crop',
            status: 'published' as const,
            featured: true
          },
          ...prev
        ];
      }
    });

    try {
      await fetch(`/api/gigs/${gigId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: true })
      });
    } catch (e) {
      console.warn('API sync for sample gig feature:', e);
    }

    alert('Gig successfully featured for 7 days! ($10 fee charged to wallet)');
    fetchAllAdminData();
  };

  const handleOptimizeGigWithAI = async () => {
    if (!newGigTitle) {
      alert('Please enter a gig title first.');
      return;
    }
    setNewGigTitle(`Professional ${newGigTitle} with 100% Escrow Guarantee`);
    setNewGigDesc(`✨ Premium Service Offering:\n\n- High-performance delivery tailored to your exact specifications.\n- Thoroughly tested code and enterprise-grade architecture.\n- 14 days of post-launch support and secure Escrow protection.\n\nLet's discuss your project requirements today!`);
  };

  const handlePublishGig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freelancerId: impersonatedUser ? impersonatedUser.id : currentUser.id,
          freelancerName: impersonatedUser ? impersonatedUser.name : currentUser.name,
          freelancerAvatar: impersonatedUser ? impersonatedUser.avatar : currentUser.avatar,
          freelancerLevel: 'Level 1 ★',
          title: newGigTitle,
          category: newGigCat,
          description: newGigDesc,
          price: Number(newGigPrice),
          deliveryDays: Number(newGigDays),
          image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=500&fit=crop',
          status: 'published',
          featured: false,
          extras: newGigExtras
        })
      });
      alert('Gig published successfully!');
      navigate('/gigs');
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: impersonatedUser ? impersonatedUser.id : currentUser.id,
          buyerName: impersonatedUser ? impersonatedUser.name : currentUser.name,
          buyerAvatar: impersonatedUser ? impersonatedUser.avatar : currentUser.avatar,
          title: newProjTitle,
          category: newProjCat,
          description: newProjDesc,
          budgetMin: Number(newProjMin),
          budgetMax: Number(newProjMax),
          deadlineDays: 14,
          featured: false
        })
      });
      alert('Project posted successfully!');
      navigate('/projects');
      fetchAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Project proposal route check: /projects/:id
  const isProjectDetail = path.startsWith('/projects/') && path.length > 10;
  const projIdParam = isProjectDetail ? path.replace('/projects/', '') : null;
  const currentProject = projects.find(p => p.id === projIdParam);

  // Filtered Gigs computation
  const filteredGigs = gigs.filter(g => {
    const matchesCat = currentCategory === 'All' || g.category === currentCategory;
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesServiceOpt = serviceOptionFilter === 'All' || g.category === serviceOptionFilter;
    const matchesSellerLevel = sellerLevelFilter === 'All' || (g.freelancerLevel && g.freelancerLevel.includes(sellerLevelFilter));
    const matchesBudget = budgetFilter === 'All' 
      ? true 
      : budgetFilter === 'under_500' ? g.price <= 500
      : budgetFilter === '500_1000' ? g.price > 500 && g.price <= 1000
      : g.price > 1000;
    const matchesDelivery = deliveryTimeFilter === null || g.deliveryDays <= deliveryTimeFilter;
    const author = usersList.find(u => u.id === g.freelancerId);
    const isCurrentAuthor = currentUser && (currentUser.id === g.freelancerId || currentUser.name === g.freelancerName);
    const availableStatus = isCurrentAuthor ? currentUser.isAvailableNow : (author ? author.isAvailableNow : true);
    const matchesOnline = !onlineNowOnly || availableStatus !== false;

    return matchesCat && matchesSearch && matchesServiceOpt && matchesSellerLevel && matchesBudget && matchesDelivery && matchesOnline;
  });

  // Dedicated Admin Panel View with 20 Comprehensive Modules & Sidebar
  if (isAdmin) {
    const isUserAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || impersonatedUser?.role === 'super_admin' || impersonatedUser?.role === 'admin';

    if (!isUserAdmin) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-slate-800">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md">
                W
              </div>
              <h2 className="text-2xl font-bold text-fiverr-dark tracking-tight">Admin Portal Login</h2>
              <p className="text-xs text-fiverr-muted">Enter your Administrator credentials to access the WorkPerHour Super Admin Suite.</p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const emailToUse = loginEmail.trim() || 'admin@workperhour.com';
              const passToUse = loginPassword.trim() || 'password123';
              const deviceId = getDeviceId();
              try {
                const payload: any = {
                  email: emailToUse,
                  password: passToUse,
                  deviceId
                };
                if (adminLoginRequiresCode && adminLoginCode.trim()) {
                  payload.code = adminLoginCode.trim();
                }

                const res = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Authentication failed');

                if (data.requiresVerification) {
                  setAdminLoginRequiresCode(true);
                  if (data.mockEmailCode) {
                    setAdminMockCodeDisplay(data.mockEmailCode);
                  }
                  alert('Admin 2FA: Verification code sent to admin registered email.');
                  return;
                }

                if (data.token) {
                  localStorage.setItem('workperhour_token', data.token);
                  localStorage.setItem('token', data.token);
                }
                if (data.user) {
                  setCurrentUser(data.user);
                  setImpersonatedUser(null);
                }
                setAdminLoginRequiresCode(false);
                setAdminLoginCode('');
                alert('Admin session verified successfully! Welcome to Admin Dashboard.');
                fetchAllAdminData();
              } catch (err: any) {
                alert(err.message);
              }
            }} className="space-y-4 text-xs">
              {adminLoginRequiresCode ? (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <ShieldAlert className="w-4 h-4 text-emerald-600" />
                      <span>Admin Verification Code Sent</span>
                    </div>
                    <p>Enter the 6-digit email verification code sent to {loginEmail || 'admin@workperhour.com'}.</p>
                  </div>

                  {adminMockCodeDisplay && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                      <span>Admin Security OTP:</span>
                      <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-emerald-200">{adminMockCodeDisplay}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-fiverr-dark font-bold uppercase mb-1">Enter 6-Digit Email Code</label>
                    <input 
                      type="text" 
                      maxLength={6} 
                      placeholder="123456" 
                      value={adminLoginCode} 
                      onChange={(e) => setAdminLoginCode(e.target.value)} 
                      required 
                      autoFocus
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-fiverr-dark focus:outline-none focus:border-emerald-500" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-colors text-sm cursor-pointer"
                  >
                    Verify Email Code & Unlock Admin Suite
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button 
                      type="button" 
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/auth/resend-email-code', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: loginEmail || 'admin@workperhour.com' })
                          });
                          const data = await res.json();
                          if (res.ok && data.mockEmailCode) {
                            setAdminMockCodeDisplay(data.mockEmailCode);
                            alert('New verification code sent to admin email.');
                          }
                        } catch (e) {
                          console.warn(e);
                        }
                      }} 
                      className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setAdminLoginRequiresCode(false); setAdminLoginCode(''); }} 
                      className="text-fiverr-muted hover:text-slate-800 cursor-pointer"
                    >
                      Back to Password
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-fiverr-dark font-bold uppercase mb-1">Admin Email ID</label>
                    <input 
                      type="email" 
                      placeholder="admin@workperhour.com"
                      value={loginEmail || 'admin@workperhour.com'}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-fiverr-dark font-bold uppercase mb-1">Admin Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••••••"
                      value={loginPassword || 'password123'}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-colors text-sm cursor-pointer"
                  >
                    Authenticate & Request Email Code
                  </button>

                  <div className="pt-2 text-center">
                    <button 
                      type="button"
                      onClick={() => {
                        setLoginEmail('admin@workperhour.com');
                        setLoginPassword('password123');
                      }}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold underline cursor-pointer"
                    >
                      ⚡ Click to autofill Demo Admin Credentials
                    </button>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-slate-100 text-center">
                <a 
                  href="/gigs" 
                  onClick={(e) => navigate('/gigs', e)}
                  className="text-xs text-fiverr-muted hover:text-slate-800 font-medium"
                >
                  ← Return to Marketplace Home
                </a>
              </div>
            </form>
          </div>
        </div>
      );
    }

    const effectiveAdminUser = impersonatedUser || currentUser || usersList.find(u => u.role === 'admin' || u.role === 'super_admin') || usersList[0];
    return (
      <div className="min-h-screen bg-slate-50 text-fiverr-dark flex font-sans selection:bg-emerald-500 selection:text-white">
        {/* ADMIN SIDEBAR */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between p-5 shrink-0 sticky top-0 h-screen overflow-y-auto shadow-xs">
          <div>
            {/* Admin Brand */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
              <a href="/gigs" onClick={(e) => navigate('/gigs', e)} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  W
                </div>
                <div>
                  <span className="text-sm font-bold text-fiverr-dark block leading-none">WorkPerHour</span>
                  <span className="text-[10px] text-emerald-600 font-semibold tracking-wider uppercase">Super Admin Suite</span>
                </div>
              </a>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-mono px-2 py-0.5 rounded border border-emerald-200">v3.0 RBAC</span>
            </div>

            {/* Sidebar Navigation: 20 Enterprise Admin Modules */}
            <nav className="space-y-1">
              {[
                { id: 'overview', label: '1. Dashboard Overview', icon: LayoutDashboard },
                { id: 'users', label: '2. User Management', icon: Users },
                { id: 'projects', label: '3. Projects & RFPs', icon: Briefcase },
                { id: 'gigs', label: '4. Services & Gigs', icon: Layers },
                { id: 'orders', label: '5. All Orders', icon: Shield },
                { id: 'categories', label: '6. Categories & Slugs', icon: Sliders },
                { id: 'proposals', label: '7. Proposals & Bids', icon: FileText },
                { id: 'contracts', label: '8. Contracts & Milestones', icon: CheckCircle2 },
                { id: 'payments', label: '9. Payment Gateways', icon: DollarSign },
                { id: 'wallet', label: '10. Wallet & Double Ledger', icon: Wallet },
                { id: 'escrow', label: '11. Escrow Vault (14-Day)', icon: ShieldCheck },
                { id: 'disputes', label: '12. Dispute Resolution', icon: Scale },
                { id: 'refunds', label: '13. Refund Requests', icon: CornerDownLeft },
                { id: 'payouts', label: '14. Freelancer Payouts', icon: TrendingUp },
                { id: 'reviews', label: '15. Reviews & Moderation', icon: Star },
                { id: 'messages', label: '16. Messages & Chat Audit', icon: MessageCircle },
                { id: 'reports', label: '17. Flagged Reports', icon: Flag },
                { id: 'support', label: '18. Support Ticket Desk', icon: HelpCircle },
                { id: 'cms', label: '19. CMS & Legal Policies', icon: FileCode },
                { id: 'settings', label: '20. Site & Fee Settings', icon: Settings },
                { id: 'activity', label: '21. Activity & Audit Trail', icon: Activity }
              ].map(item => {
                const IconComp = item.icon;
                const isActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setAdminTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-fiverr-dark hover:text-fiverr-dark hover:bg-slate-100'}`}
                  >
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* System Status & Exit */}
          <div className="space-y-4 pt-6 border-t border-slate-200 mt-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-fiverr-muted tracking-wider">Gateway Telemetry</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-fiverr-dark font-medium">RBAC Active · 14-Day Escrow Locked</p>
            </div>

            <a 
              href="/gigs" 
              onClick={(e) => navigate('/gigs', e)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-fiverr-dark bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
            >
              <LogOut className="w-4 h-4 text-emerald-600" />
              <span>Exit Admin Portal</span>
            </a>
          </div>
        </aside>

        {/* MAIN ADMIN CONTENT AREA */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-semibold text-emerald-600 block mb-1">Super Administrator Console</span>
              <h1 className="text-2xl font-bold text-fiverr-dark">
                {adminTab === 'overview' && '1. Admin Dashboard & Metrics'}
                {adminTab === 'users' && '2. User Management & Impersonation'}
                {adminTab === 'projects' && '3. Projects & RFP Moderation'}
                {adminTab === 'gigs' && '4. Services & Gigs Management'}
                {adminTab === 'orders' && '5. All Orders Management'}
                {adminTab === 'categories' && '6. Categories, Subcategories & Slugs'}
                {adminTab === 'proposals' && '7. Proposals & Bid Audit'}
                {adminTab === 'contracts' && '8. Contracts & Milestone Timelines'}
                {adminTab === 'payments' && '9. Payments & Razorpay/Stripe Logs'}
                {adminTab === 'wallet' && '10. User Wallets & Double-Entry Ledger'}
                {adminTab === 'escrow' && '11. Escrow Management (Mandatory 14-Day Protection)'}
                {adminTab === 'disputes' && '12. Dispute Investigation & Resolution'}
                {adminTab === 'refunds' && '13. Refund Requests & Approvals'}
                {adminTab === 'payouts' && '14. Freelancer Payouts & Disbursements'}
                {adminTab === 'reviews' && '15. Reviews & Ratings Moderation'}
                {adminTab === 'messages' && '16. Messages & Conversation Audit'}
                {adminTab === 'reports' && '17. Flagged Reports & Cases'}
                {adminTab === 'support' && '18. Support Ticket Help Desk'}
                {adminTab === 'cms' && '19. CMS Pages & Legal Policies'}
                {adminTab === 'settings' && '20. Site & Fee Settings'}
                {(adminTab === 'security' || adminTab === 'activity') && '21. Admin Activity Logs & Security Audit Trail'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-fiverr-dark bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-mono shadow-xs">
                RBAC Level: Super Admin
              </span>
            </div>
          </div>

          {/* MODULE 1: DASHBOARD OVERVIEW */}
          {adminTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-fiverr-muted uppercase tracking-wider">Escrow Balance</span>
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-fiverr-dark">
                    ${orders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Mandatory 14-Day Protection Active</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-fiverr-muted uppercase tracking-wider">Active Users</span>
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-fiverr-dark">{usersList.length}</div>
                  <span className="text-[11px] text-fiverr-muted mt-1 block">Verified Buyers & Sellers</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-fiverr-muted uppercase tracking-wider">Disputes Open</span>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-600">{disputes.length}</div>
                  <span className="text-[11px] text-red-600 font-semibold mt-1 block">Requires Resolution</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-fiverr-muted uppercase tracking-wider">Platform Take Revenue</span>
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-fiverr-dark">
                    ${(orders.reduce((sum, o) => sum + o.amount, 0) * (platformFee / 100)).toFixed(0)}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">{platformFee}% Platform Take Rate</span>
                </div>
              </div>

              {/* Escrow Ledger & System Gateways */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                  <h3 className="text-base font-bold text-fiverr-dark mb-4">Active Escrow Protection Orders</h3>
                  <div className="space-y-3">
                    {orders.map(ord => (
                      <div key={ord.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <div>
                          <span className="text-xs font-bold text-fiverr-dark block mb-0.5">{ord.title}</span>
                          <span className="text-[11px] text-fiverr-muted">Order #{ord.id} · Due {ord.dueDate}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-fiverr-dark block">${ord.amount}</span>
                          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            14-Day Escrow Protection
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                  <h3 className="text-base font-bold text-fiverr-dark mb-4">System Alerts & Support Desk</h3>
                  <div className="space-y-3">
                    {supportTickets.map(ticket => (
                      <div key={ticket.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-fiverr-dark block mb-0.5">{ticket.subject}</span>
                          <span className="text-[11px] text-fiverr-muted">Ticket #{ticket.id} by {ticket.userName}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded uppercase border border-emerald-200">
                          {ticket.priority} Priority
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 2: USER MANAGEMENT & IMPERSONATION */}
          {adminTab === 'users' && (
            <div className="space-y-6">
              {/* Top User Management Bar */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-fiverr-dark flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-600" />
                      <span>User Account Management & Verification</span>
                    </h3>
                    <p className="text-xs text-fiverr-muted mt-0.5">Search, filter, view complete activity history, edit profiles, toggle verification, and restrict user accounts.</p>
                  </div>
                  <span className="text-xs text-fiverr-dark font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0 font-medium">
                    {usersList.length} Total Users Registered
                  </span>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input 
                      type="text" 
                      placeholder="Search name, email, skills, title..." 
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500"
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select 
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                    >
                      <option value="all">All Account Statuses</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="restricted">Restricted</option>
                    </select>
                  </div>

                  {/* Verification Filter */}
                  <div>
                    <select 
                      value={userVerifiedFilter}
                      onChange={(e) => setUserVerifiedFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                    >
                      <option value="all">All Verification Statuses</option>
                      <option value="verified">Verified Only ✓</option>
                      <option value="unverified">Unverified Only</option>
                    </select>
                  </div>

                  {/* Role Filter */}
                  <div>
                    <select 
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                    >
                      <option value="all">All Roles</option>
                      <option value="user">Marketplace User</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="moderator">Moderator</option>
                      <option value="support">Support Staff</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-fiverr-muted border-b border-slate-200">
                        <th className="p-4">User Details</th>
                        <th className="p-4">Role & Title</th>
                        <th className="p-4">Wallet / Hourly</th>
                        <th className="p-4">Verification</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-fiverr-dark">
                      {usersList
                        .filter(u => {
                          const q = userSearchQuery.toLowerCase();
                          const matchesSearch = !q || 
                            u.name.toLowerCase().includes(q) || 
                            u.email.toLowerCase().includes(q) || 
                            (u.title && u.title.toLowerCase().includes(q)) ||
                            (u.skills && u.skills.some(s => s.toLowerCase().includes(q)));
                          const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
                          const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
                          const matchesVerified = userVerifiedFilter === 'all' || 
                            (userVerifiedFilter === 'verified' && u.verified) || 
                            (userVerifiedFilter === 'unverified' && !u.verified);
                          return matchesSearch && matchesStatus && matchesRole && matchesVerified;
                        })
                        .map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={u.avatar} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200" />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-fiverr-dark text-sm">{u.name}</span>
                                    {u.verified && (
                                      <span className="bg-emerald-50 text-emerald-600 p-0.5 rounded-full border border-emerald-200" title="Verified User">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-fiverr-muted">{u.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase block w-max mb-1 ${
                                u.role === 'super_admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                u.role === 'moderator' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                u.role === 'support' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {u.role.replace('_', ' ')}
                              </span>
                              <span className="text-[11px] text-fiverr-muted truncate max-w-[150px] block">{u.title || 'Marketplace Member'}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-fiverr-dark block">${u.walletBalance.toLocaleString()}</span>
                              <span className="text-[11px] text-fiverr-muted">${u.hourlyRate || 0}/hr</span>
                            </td>
                            <td className="p-4">
                              <button 
                                onClick={() => handleToggleUserVerify(u.id)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase border transition-colors cursor-pointer ${
                                  u.verified ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-50 text-fiverr-dark border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {u.verified ? '✓ Verified' : '+ Verify Badge'}
                              </button>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                                u.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                u.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1.5">
                              {/* Inspect Activity */}
                              <button 
                                onClick={() => setInspectingUser(u)}
                                className="px-2.5 py-1.5 bg-slate-50 text-fiverr-dark border border-slate-200 font-bold rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-1 text-[11px] cursor-pointer"
                                title="View complete user activity & history"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Activity</span>
                              </button>

                              {/* Edit Profile */}
                              <button 
                                onClick={() => handleOpenEditUserModal(u)}
                                className="px-2.5 py-1.5 bg-slate-50 text-fiverr-dark border border-slate-200 font-bold rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-1 text-[11px] cursor-pointer"
                                title="Edit user details"
                              >
                                <Settings className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Edit</span>
                              </button>

                              {/* Status Action Buttons */}
                              {u.status === 'active' ? (
                                <button 
                                  onClick={() => handleUserStatusToggle(u.id, 'suspended')}
                                  className="px-2.5 py-1.5 bg-red-50 text-red-700 border border-red-200 font-bold rounded-lg hover:bg-red-100 text-[11px] cursor-pointer"
                                >
                                  Suspend
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUserStatusToggle(u.id, 'active')}
                                  className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-lg hover:bg-emerald-100 text-[11px] cursor-pointer"
                                >
                                  Activate
                                </button>
                              )}

                              {u.status !== 'restricted' && (
                                <button 
                                  onClick={() => handleUserStatusToggle(u.id, 'restricted')}
                                  className="px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 font-bold rounded-lg hover:bg-amber-100 text-[11px] cursor-pointer"
                                >
                                  Restrict
                                </button>
                              )}

                              {/* Impersonate */}
                              <button 
                                onClick={() => handleStartImpersonation(u)}
                                className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold rounded-lg hover:bg-indigo-100 transition-colors text-[11px] cursor-pointer"
                              >
                                Impersonate
                              </button>

                              {/* Delete User */}
                              <button 
                                onClick={() => handleDeleteUser(u.id)}
                                className="px-2 py-1.5 bg-red-50 text-red-700 border border-red-200 font-bold rounded-lg hover:bg-red-100 text-[11px] cursor-pointer"
                                title="Delete user permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* INSPECT USER ACTIVITY HISTORY MODAL */}
              {inspectingUser && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-4xl w-full space-y-6 max-h-[90vh] overflow-y-auto text-slate-800 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <img src={inspectingUser.avatar} className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500/30" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-fiverr-dark">{inspectingUser.name}</h3>
                            {inspectingUser.verified && (
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-bold flex items-center gap-1 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-fiverr-muted">{inspectingUser.email} · Role: <span className="text-emerald-700 uppercase font-bold">{inspectingUser.role}</span></p>
                          <p className="text-xs text-fiverr-dark font-medium mt-1">{inspectingUser.title}</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => setInspectingUser(null)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-fiverr-dark text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Close
                      </button>
                    </div>

                    {/* Stats summary row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                        <span className="text-[10px] text-fiverr-muted uppercase font-bold block">Wallet Balance</span>
                        <span className="text-lg font-bold text-fiverr-dark">${inspectingUser.walletBalance.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                        <span className="text-[10px] text-fiverr-muted uppercase font-bold block">Total Earned</span>
                        <span className="text-lg font-bold text-emerald-700">${(inspectingUser.earned || 0).toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                        <span className="text-[10px] text-fiverr-muted uppercase font-bold block">Hourly Rate</span>
                        <span className="text-lg font-bold text-fiverr-dark">${inspectingUser.hourlyRate || 0}/hr</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                        <span className="text-[10px] text-fiverr-muted uppercase font-bold block">Completed Jobs</span>
                        <span className="text-lg font-bold text-indigo-700">{inspectingUser.completedJobs || 0}</span>
                      </div>
                    </div>

                    {/* Tabs for complete user activity */}
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto">
                      {(['overview', 'gigs', 'projects', 'proposals', 'orders', 'reviews', 'tickets'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setUserActivityTab(tab)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
                            userActivityTab === tab ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-50 text-fiverr-dark hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {tab === 'overview' && 'Overview'}
                          {tab === 'gigs' && `Gigs (${gigs.filter(g => g.freelancerId === inspectingUser.id || g.freelancerName === inspectingUser.name).length})`}
                          {tab === 'projects' && `Projects (${projects.filter(p => p.buyerId === inspectingUser.id || p.buyerName === inspectingUser.name).length})`}
                          {tab === 'proposals' && `Proposals (${proposals.filter(p => p.freelancerId === inspectingUser.id).length})`}
                          {tab === 'orders' && `Orders & Escrow (${orders.filter(o => o.buyerId === inspectingUser.id || o.sellerId === inspectingUser.id).length})`}
                          {tab === 'reviews' && `Reviews (${reviews.filter(r => r.targetUserId === inspectingUser.id).length})`}
                          {tab === 'tickets' && `Support (${supportTickets.filter(t => t.userId === inspectingUser.id).length})`}
                        </button>
                      ))}
                    </div>

                    {/* Tab 1: Overview */}
                    {userActivityTab === 'overview' && (
                      <div className="space-y-4 text-xs">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <span className="text-fiverr-muted font-bold uppercase block mb-1">Biography</span>
                          <p className="text-slate-800">{inspectingUser.bio || 'No biography provided.'}</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <span className="text-fiverr-muted font-bold uppercase block mb-2">Skills & Expertise</span>
                          <div className="flex flex-wrap gap-2">
                            {inspectingUser.skills && inspectingUser.skills.length > 0 ? (
                              inspectingUser.skills.map((sk, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 text-emerald-700 rounded-lg font-semibold shadow-2xs">
                                  {sk}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400">No skills listed</span>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                          <span className="text-fiverr-muted">Account Joined Date</span>
                          <span className="font-mono text-fiverr-dark font-semibold">{inspectingUser.createdAt || '2025-01-15'}</span>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Gigs */}
                    {userActivityTab === 'gigs' && (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {gigs.filter(g => g.freelancerId === inspectingUser.id || g.freelancerName === inspectingUser.name).map(g => (
                          <div key={g.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-fiverr-dark block mb-0.5">{g.title}</span>
                              <span className="text-fiverr-muted">{g.category} · Status: <strong className="text-emerald-700">{g.status}</strong></span>
                            </div>
                            <span className="font-bold text-fiverr-dark text-sm">₹{(g.price * 83).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tab 3: Projects */}
                    {userActivityTab === 'projects' && (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {projects.filter(p => p.buyerId === inspectingUser.id || p.buyerName === inspectingUser.name).map(p => (
                          <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-fiverr-dark block mb-0.5">{p.title}</span>
                              <span className="text-fiverr-muted">Budget: ${p.budgetMin} - ${p.budgetMax} · Status: <strong className="text-emerald-700">{p.status}</strong></span>
                            </div>
                            <span className="text-fiverr-muted font-mono">{p.createdAt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tab 4: Proposals */}
                    {userActivityTab === 'proposals' && (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {proposals.filter(p => p.freelancerId === inspectingUser.id).map(p => (
                          <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-fiverr-dark">Bid Amount: ${p.bidAmount} ({p.deliveryDays} Days)</span>
                              <span className="text-emerald-700 font-bold uppercase">{p.status}</span>
                            </div>
                            <p className="text-fiverr-dark italic bg-white p-2.5 rounded-xl border border-slate-200">{p.coverLetter}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tab 5: Orders & Escrow */}
                    {userActivityTab === 'orders' && (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {orders.filter(o => o.buyerId === inspectingUser.id || o.sellerId === inspectingUser.id).map(o => (
                          <div key={o.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-fiverr-dark block mb-0.5">{o.title}</span>
                              <span className="text-fiverr-muted">Order #{o.id} · Status: <strong className="text-emerald-700">{o.status}</strong></span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-fiverr-dark text-sm block">${o.amount}</span>
                              <span className="text-[10px] text-emerald-700 font-semibold">14-Day Escrow Vault</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tab 6: Reviews */}
                    {userActivityTab === 'reviews' && (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {reviews.filter(r => r.targetUserId === inspectingUser.id).map(r => (
                          <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-fiverr-dark">{r.reviewerName} (Rating: {r.rating} ★)</span>
                              <span className="text-fiverr-muted">{r.createdAt}</span>
                            </div>
                            <p className="text-fiverr-dark">{r.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tab 7: Support Tickets */}
                    {userActivityTab === 'tickets' && (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {supportTickets.filter(t => t.userId === inspectingUser.id).map(t => (
                          <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-fiverr-dark block mb-0.5">{t.subject}</span>
                              <span className="text-fiverr-muted">Priority: {t.priority} · Status: {t.status}</span>
                            </div>
                            <span className="text-fiverr-muted">{t.createdAt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* EDIT USER MODAL */}
              {editingUser && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full space-y-5 text-slate-800 shadow-2xl">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <h3 className="text-lg font-bold text-fiverr-dark">Edit User Profile — {editingUser.name}</h3>
                      <button 
                        onClick={() => setEditingUser(null)}
                        className="text-slate-400 hover:text-fiverr-dark text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Full Name</label>
                          <input 
                            type="text" 
                            value={editUserForm.name}
                            onChange={(e) => setEditUserForm(prev => ({ ...prev, name: e.target.value }))}
                            required
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Email Address</label>
                          <input 
                            type="email" 
                            value={editUserForm.email}
                            onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                            required
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">System Role</label>
                          <select 
                            value={editUserForm.role}
                            onChange={(e) => setEditUserForm(prev => ({ ...prev, role: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                          >
                            <option value="user">Marketplace User</option>
                            <option value="super_admin">Super Admin</option>
                            <option value="moderator">Moderator</option>
                            <option value="support">Support Staff</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Account Status</label>
                          <select 
                            value={editUserForm.status}
                            onChange={(e) => setEditUserForm(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                          >
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="restricted">Restricted</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-fiverr-dark font-bold uppercase mb-1">Professional Title</label>
                        <input 
                          type="text" 
                          value={editUserForm.title}
                          onChange={(e) => setEditUserForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-fiverr-dark font-bold uppercase mb-1">Bio / Profile Summary</label>
                        <textarea 
                          rows={3}
                          value={editUserForm.bio}
                          onChange={(e) => setEditUserForm(prev => ({ ...prev, bio: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-fiverr-dark font-bold uppercase mb-1">Skills (comma separated)</label>
                        <input 
                          type="text" 
                          value={editUserForm.skills}
                          onChange={(e) => setEditUserForm(prev => ({ ...prev, skills: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Hourly Rate ($/hr)</label>
                          <input 
                            type="number" 
                            value={editUserForm.hourlyRate}
                            onChange={(e) => setEditUserForm(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Wallet Balance ($)</label>
                          <input 
                            type="number" 
                            value={editUserForm.walletBalance}
                            readOnly
                            title="Wallet balances are controlled by the ledger. Use Finance > Adjustments."
                            onChange={() => {}}
                            className="w-full px-3 py-2 bg-slate-50 opacity-60 cursor-not-allowed border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-fiverr-dark">
                          <input 
                            type="checkbox" 
                            checked={editUserForm.verified}
                            onChange={(e) => setEditUserForm(prev => ({ ...prev, verified: e.target.checked }))}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                          />
                          <span>Verified User Badge Active</span>
                        </label>
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button 
                          type="button"
                          onClick={() => setEditingUser(null)}
                          className="px-4 py-2 bg-slate-100 text-fiverr-dark font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-sm cursor-pointer"
                        >
                          Save User Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODULE 3: PROJECTS MANAGEMENT */}
          {adminTab === 'projects' && (
            <div className="space-y-6">
              {/* Filter & Control Header */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-fiverr-dark flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-emerald-600" />
                      <span>Projects & Buyer Requests Management</span>
                    </h3>
                    <p className="text-xs text-fiverr-muted mt-0.5">Manage, search, filter, edit, publish, unpublish, suspend, restore, feature, and moderate buyer RFPs.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-fiverr-dark font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-medium">
                      {projects.length} Total Projects
                    </span>
                  </div>
                </div>

                {/* Search & Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input 
                      type="text" 
                      placeholder="Search title, buyer, description..." 
                      value={projectSearchQuery}
                      onChange={(e) => setProjectSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500"
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select 
                      value={projectStatusFilter}
                      onChange={(e) => setProjectStatusFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="open">Open / Active</option>
                      <option value="published">Published</option>
                      <option value="unpublished">Unpublished (Draft)</option>
                      <option value="suspended">Suspended</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <select 
                      value={projectCategoryFilter}
                      onChange={(e) => setProjectCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Featured Filter */}
                  <div>
                    <select 
                      value={projectFeaturedFilter}
                      onChange={(e) => setProjectFeaturedFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                    >
                      <option value="all">All Listing Types</option>
                      <option value="featured">Featured Projects Only ★</option>
                      <option value="regular">Regular Projects Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Projects Table */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-fiverr-muted border-b border-slate-200">
                        <th className="p-4">Project & Buyer</th>
                        <th className="p-4">Category & Subcategory</th>
                        <th className="p-4">Budget & Deadline</th>
                        <th className="p-4">Proposals</th>
                        <th className="p-4">Featured</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-fiverr-dark">
                      {projects
                        .filter(p => {
                          const q = projectSearchQuery.toLowerCase();
                          const matchesSearch = !q || 
                            p.title.toLowerCase().includes(q) || 
                            p.description.toLowerCase().includes(q) || 
                            p.buyerName.toLowerCase().includes(q) || 
                            p.category.toLowerCase().includes(q);
                          const matchesStatus = projectStatusFilter === 'all' || p.status === projectStatusFilter;
                          const matchesCat = projectCategoryFilter === 'all' || p.category === projectCategoryFilter;
                          const matchesFeatured = projectFeaturedFilter === 'all' || 
                            (projectFeaturedFilter === 'featured' && p.featured) || 
                            (projectFeaturedFilter === 'regular' && !p.featured);
                          return matchesSearch && matchesStatus && matchesCat && matchesFeatured;
                        })
                        .map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={p.buyerAvatar} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200" />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-fiverr-dark text-sm hover:text-emerald-600 cursor-pointer" onClick={() => setViewingProject(p)}>{p.title}</span>
                                    {p.featured && (
                                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-bold">★ Featured</span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-fiverr-muted">Buyer: {p.buyerName} · Posted {p.createdAt}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-fiverr-dark block">{p.category}</span>
                              <span className="text-[11px] text-fiverr-muted">{p.subcategory || 'General'}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-emerald-600 block">${p.budgetMin.toLocaleString()} - ${p.budgetMax.toLocaleString()}</span>
                              <span className="text-[11px] text-fiverr-muted">{p.deadlineDays} Days Delivery</span>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-indigo-700 font-bold font-mono">
                                {p.proposalsCount} bids
                              </span>
                            </td>
                            <td className="p-4">
                              <button 
                                onClick={() => handleToggleProjectFeature(p.id)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase border transition-colors cursor-pointer ${
                                  p.featured 
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                                    : 'bg-slate-50 text-fiverr-dark border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {p.featured ? '★ Featured' : '+ Feature'}
                              </button>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                                p.status === 'open' || p.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                p.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                                p.status === 'unpublished' ? 'bg-slate-100 text-fiverr-dark border-slate-200' :
                                'bg-indigo-50 text-indigo-700 border-indigo-200'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1.5">
                              {/* View Details */}
                              <button 
                                onClick={() => setViewingProject(p)}
                                className="px-2.5 py-1.5 bg-slate-50 text-fiverr-dark border border-slate-200 font-bold rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-1 text-[11px] cursor-pointer"
                                title="View full project details"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>View</span>
                              </button>

                              {/* Edit */}
                              <button 
                                onClick={() => handleOpenEditProjectModal(p)}
                                className="px-2.5 py-1.5 bg-slate-50 text-fiverr-dark border border-slate-200 font-bold rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-1 text-[11px] cursor-pointer"
                                title="Edit project title, category, budget"
                              >
                                <Settings className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Edit</span>
                              </button>

                              {/* Publish / Unpublish Toggle */}
                              {p.status === 'unpublished' ? (
                                <button 
                                  onClick={() => handleUpdateProjectStatus(p.id, 'open')}
                                  className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-lg hover:bg-emerald-100 text-[11px] cursor-pointer"
                                >
                                  Publish
                                </button>
                              ) : p.status === 'open' || p.status === 'published' ? (
                                <button 
                                  onClick={() => handleUpdateProjectStatus(p.id, 'unpublished')}
                                  className="px-2.5 py-1.5 bg-slate-100 text-fiverr-dark border border-slate-200 font-bold rounded-lg hover:bg-slate-200 text-[11px] cursor-pointer"
                                >
                                  Unpublish
                                </button>
                              ) : null}

                              {/* Suspend / Restore Toggle */}
                              {p.status === 'suspended' ? (
                                <button 
                                  onClick={() => handleUpdateProjectStatus(p.id, 'open')}
                                  className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-lg hover:bg-emerald-100 text-[11px] cursor-pointer"
                                >
                                  Restore
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUpdateProjectStatus(p.id, 'suspended')}
                                  className="px-2.5 py-1.5 bg-red-50 text-red-700 border border-red-200 font-bold rounded-lg hover:bg-red-100 text-[11px] cursor-pointer"
                                >
                                  Suspend
                                </button>
                              )}

                              {/* Moderate */}
                              <button 
                                onClick={() => handleOpenModerationModal(p)}
                                className="px-2.5 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 font-bold rounded-lg hover:bg-purple-100 text-[11px] cursor-pointer"
                              >
                                Moderate
                              </button>

                              {/* Delete */}
                              <button 
                                onClick={() => handleDeleteProject(p.id)}
                                className="px-2 py-1.5 bg-red-50 text-red-700 border border-red-200 font-bold rounded-lg hover:bg-red-100 text-[11px] cursor-pointer"
                                title="Delete Project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* VIEW PROJECT DETAILS MODAL */}
              {viewingProject && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-3xl w-full space-y-6 max-h-[90vh] overflow-y-auto text-slate-800 shadow-2xl">
                    <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-fiverr-dark">{viewingProject.title}</h3>
                          {viewingProject.featured && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-xs font-bold">★ Featured</span>
                          )}
                        </div>
                        <p className="text-xs text-fiverr-muted mt-1">Project ID: #{viewingProject.id} · Category: <span className="text-emerald-700 font-semibold">{viewingProject.category} ({viewingProject.subcategory || 'General'})</span></p>
                      </div>
                      <button 
                        onClick={() => setViewingProject(null)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-fiverr-dark text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                        <span className="text-[10px] text-fiverr-muted uppercase font-bold block">Budget Range</span>
                        <span className="text-base font-bold text-emerald-700">${viewingProject.budgetMin} - ${viewingProject.budgetMax}</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                        <span className="text-[10px] text-fiverr-muted uppercase font-bold block">Deadline</span>
                        <span className="text-base font-bold text-fiverr-dark">{viewingProject.deadlineDays} Days</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                        <span className="text-[10px] text-fiverr-muted uppercase font-bold block">Status</span>
                        <span className="text-base font-bold text-indigo-700 uppercase">{viewingProject.status}</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                        <span className="text-[10px] text-fiverr-muted uppercase font-bold block">Bids Received</span>
                        <span className="text-base font-bold text-purple-700">{viewingProject.proposalsCount}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                      <h4 className="text-xs font-bold text-fiverr-muted uppercase">Project Brief & Description</h4>
                      <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{viewingProject.description}</p>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={viewingProject.buyerAvatar} className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30" />
                        <div>
                          <span className="text-xs font-bold text-fiverr-dark block">{viewingProject.buyerName}</span>
                          <span className="text-[11px] text-fiverr-muted font-mono">Buyer ID: {viewingProject.buyerId}</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">Created: {viewingProject.createdAt}</span>
                    </div>

                    {viewingProject.moderationNotes && (
                      <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl text-xs space-y-1">
                        <span className="font-bold text-purple-800 block">Moderation Log Notes:</span>
                        <p className="text-fiverr-dark">{viewingProject.moderationNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* EDIT PROJECT MODAL */}
              {editingProject && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full space-y-5 text-slate-800 shadow-2xl">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <h3 className="text-lg font-bold text-fiverr-dark">Edit Project — {editingProject.title}</h3>
                      <button 
                        onClick={() => setEditingProject(null)}
                        className="text-slate-400 hover:text-fiverr-dark text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditProject} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-fiverr-dark font-bold uppercase mb-1">Project Title</label>
                        <input 
                          type="text" 
                          value={editProjectForm.title}
                          onChange={(e) => setEditProjectForm(prev => ({ ...prev, title: e.target.value }))}
                          required
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Category</label>
                          <select 
                            value={editProjectForm.category}
                            onChange={(e) => setEditProjectForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Subcategory</label>
                          <input 
                            type="text" 
                            value={editProjectForm.subcategory}
                            onChange={(e) => setEditProjectForm(prev => ({ ...prev, subcategory: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Budget Min ($)</label>
                          <input 
                            type="number" 
                            value={editProjectForm.budgetMin}
                            onChange={(e) => setEditProjectForm(prev => ({ ...prev, budgetMin: Number(e.target.value) }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Budget Max ($)</label>
                          <input 
                            type="number" 
                            value={editProjectForm.budgetMax}
                            onChange={(e) => setEditProjectForm(prev => ({ ...prev, budgetMax: Number(e.target.value) }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Deadline (Days)</label>
                          <input 
                            type="number" 
                            value={editProjectForm.deadlineDays}
                            onChange={(e) => setEditProjectForm(prev => ({ ...prev, deadlineDays: Number(e.target.value) }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-fiverr-dark font-bold uppercase mb-1">Project Status</label>
                        <select 
                          value={editProjectForm.status}
                          onChange={(e) => setEditProjectForm(prev => ({ ...prev, status: e.target.value as any }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                        >
                          <option value="open">Open</option>
                          <option value="published">Published</option>
                          <option value="unpublished">Unpublished</option>
                          <option value="suspended">Suspended</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-fiverr-dark font-bold uppercase mb-1">Project Description</label>
                        <textarea 
                          rows={4}
                          value={editProjectForm.description}
                          onChange={(e) => setEditProjectForm(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                        />
                      </div>

                      <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-fiverr-dark">
                          <input 
                            type="checkbox" 
                            checked={editProjectForm.featured}
                            onChange={(e) => setEditProjectForm(prev => ({ ...prev, featured: e.target.checked }))}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                          />
                          <span>Feature Project on Homepage & Listings</span>
                        </label>
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button 
                          type="button"
                          onClick={() => setEditingProject(null)}
                          className="px-4 py-2 bg-slate-100 text-fiverr-dark font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-sm cursor-pointer"
                        >
                          Save Project
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODERATE PROJECT MODAL */}
              {moderatingProject && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-5 text-slate-800 shadow-2xl">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <h3 className="text-lg font-bold text-fiverr-dark">Moderate Project — #{moderatingProject.id}</h3>
                      <button 
                        onClick={() => setModeratingProject(null)}
                        className="text-slate-400 hover:text-fiverr-dark text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSaveModeration} className="space-y-4 text-xs">
                      <div>
                        <span className="text-fiverr-muted block font-bold mb-1">Project Title:</span>
                        <span className="text-fiverr-dark font-bold text-sm block">{moderatingProject.title}</span>
                      </div>

                      <div>
                        <label className="block text-fiverr-dark font-bold uppercase mb-1">Moderation Verdict</label>
                        <select 
                          value={moderationStatus}
                          onChange={(e) => setModerationStatus(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                        >
                          <option value="approved">✓ Approved (Complies with Policy)</option>
                          <option value="flagged">⚠ Flagged for Safety Review</option>
                          <option value="rejected">✕ Rejected (Policy Violation)</option>
                          <option value="pending">⏳ Pending Review</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-fiverr-dark font-bold uppercase mb-1">Moderation Review Notes</label>
                        <textarea 
                          rows={3}
                          placeholder="Provide details regarding policy compliance, safety checks, or rationale..."
                          value={moderationNotes}
                          onChange={(e) => setModerationNotes(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                        />
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button 
                          type="button"
                          onClick={() => setModeratingProject(null)}
                          className="px-4 py-2 bg-slate-100 text-fiverr-dark font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-sm cursor-pointer"
                        >
                          Save Moderation Verdict
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODULE 4: FREELANCER GIGS & SERVICES MANAGEMENT */}
          {adminTab === 'gigs' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    ★
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm">Feature Gigs Pricing & Promotion</h4>
                    <p className="text-xs text-emerald-700">Admins can feature any freelancer service ($10.00 / 7 days by default) or configure pricing in Site Settings.</p>
                  </div>
                </div>
                <button
                  onClick={() => setAdminTab('settings')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                >
                  Configure Feature Fee ($10)
                </button>
              </div>

              {/* Filter & Control Header */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-fiverr-dark flex items-center gap-2">
                      <Layers className="w-5 h-5 text-emerald-600" />
                      <span>Freelancer Services & Gigs Management</span>
                    </h3>
                    <p className="text-xs text-fiverr-muted mt-0.5">Manage, moderate, search, filter, edit, publish, unpublish, suspend, restore, feature, and audit freelancer services.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-fiverr-dark font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                      {gigs.length} Total Services Listed
                    </span>
                  </div>
                </div>

                {/* Search & Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input 
                      type="text" 
                      placeholder="Search title, freelancer, desc..." 
                      value={gigSearchQuery}
                      onChange={(e) => setGigSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select 
                      value={gigStatusFilter}
                      onChange={(e) => setGigStatusFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <select 
                      value={gigCategoryFilter}
                      onChange={(e) => setGigCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Featured Filter */}
                  <div>
                    <select 
                      value={gigFeaturedFilter}
                      onChange={(e) => setGigFeaturedFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                    >
                      <option value="all">All Listing Types</option>
                      <option value="featured">Featured Gigs ★</option>
                      <option value="regular">Regular Gigs Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Gigs Grid/List */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-fiverr-dark border-b border-slate-200">
                        <th className="p-4">Service & Freelancer</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Starting Price & Delivery</th>
                        <th className="p-4">Rating / Reviews</th>
                        <th className="p-4">Featured</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-fiverr-dark">
                      {gigs
                        .filter(g => {
                          const q = gigSearchQuery.toLowerCase();
                          const matchesSearch = !q || 
                            g.title.toLowerCase().includes(q) || 
                            g.description.toLowerCase().includes(q) ||
                            g.freelancerName.toLowerCase().includes(q) ||
                            g.category.toLowerCase().includes(q);
                          const matchesStatus = gigStatusFilter === 'all' || g.status === gigStatusFilter;
                          const matchesCat = gigCategoryFilter === 'all' || g.category === gigCategoryFilter;
                          const matchesFeatured = gigFeaturedFilter === 'all' || 
                            (gigFeaturedFilter === 'featured' && g.featured) ||
                            (gigFeaturedFilter === 'regular' && !g.featured);
                          return matchesSearch && matchesStatus && matchesCat && matchesFeatured;
                        })
                        .map(g => (
                          <tr key={g.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={g.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=500&fit=crop'} className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0" />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-fiverr-dark text-sm hover:text-emerald-600 cursor-pointer" onClick={() => setViewingGig(g)}>{g.title}</span>
                                    {g.featured && (
                                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-bold">★ Featured</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-fiverr-muted mt-1">
                                    <img src={g.freelancerAvatar} className="w-4 h-4 rounded-full object-cover ring-1 ring-slate-200" />
                                    <span>{g.freelancerName} ({g.freelancerLevel || 'Freelancer'})</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-fiverr-dark block">{g.category}</span>
                              <span className="text-[11px] text-fiverr-muted">{g.subcategory || 'General'}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-emerald-600 block">${g.price.toLocaleString()}</span>
                              <span className="text-[11px] text-fiverr-muted">{g.deliveryDays} Days Delivery</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-yellow-500 font-mono">★ {g.rating || 5.0}</span>
                                <span className="text-slate-400">({g.reviewsCount || 0})</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <button 
                                onClick={() => handleToggleGigFeature(g.id)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                                  g.featured 
                                    ? 'bg-amber-500 text-white hover:bg-amber-600' 
                                    : 'bg-slate-900 text-amber-400 hover:bg-slate-800'
                                }`}
                                title="Click to toggle featured status ($10 / 7d fee)"
                              >
                                <span>{g.featured ? '★ Featured (Active)' : '+ Feature ($10)'}</span>
                              </button>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                                g.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                g.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-slate-100 text-fiverr-dark border-slate-200'
                              }`}>
                                {g.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                              {/* View Details */}
                              <button 
                                onClick={() => setViewingGig(g)}
                                className="px-2 py-1.5 bg-slate-50 text-fiverr-dark border border-slate-200 font-bold rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-1 text-[11px]"
                                title="Inspect Service"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>View</span>
                              </button>

                              {/* Edit */}
                              <button 
                                onClick={() => handleOpenEditGigModal(g)}
                                className="px-2 py-1.5 bg-slate-50 text-fiverr-dark border border-slate-200 font-bold rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-1 text-[11px]"
                                title="Edit Service details"
                              >
                                <Settings className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Edit</span>
                              </button>

                              {/* Publish / Unpublish Toggle */}
                              {g.status === 'draft' ? (
                                <button 
                                  onClick={() => handleUpdateGigStatus(g.id, 'published')}
                                  className="px-2 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-lg hover:bg-emerald-100 text-[11px]"
                                >
                                  Publish
                                </button>
                              ) : g.status === 'published' ? (
                                <button 
                                  onClick={() => handleUpdateGigStatus(g.id, 'draft')}
                                  className="px-2 py-1.5 bg-slate-50 text-fiverr-dark border border-slate-200 font-bold rounded-lg hover:bg-slate-100 text-[11px]"
                                >
                                  Unpublish
                                </button>
                              ) : null}

                              {/* Suspend / Restore Toggle */}
                              {g.status === 'suspended' ? (
                                <button 
                                  onClick={() => handleUpdateGigStatus(g.id, 'published')}
                                  className="px-2 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-lg hover:bg-emerald-100 text-[11px]"
                                >
                                  Restore
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUpdateGigStatus(g.id, 'suspended')}
                                  className="px-2 py-1.5 bg-red-50 text-red-700 border border-red-200 font-bold rounded-lg hover:bg-red-100 text-[11px]"
                                >
                                  Suspend
                                </button>
                              )}

                              {/* Moderate */}
                              <button 
                                onClick={() => handleOpenGigModerationModal(g)}
                                className="px-2 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 font-bold rounded-lg hover:bg-purple-100 text-[11px]"
                              >
                                Moderate
                              </button>

                              {/* Delete */}
                              <button 
                                onClick={() => handleDeleteGig(g.id)}
                                className="px-2 py-1.5 bg-red-50 text-red-700 border border-red-200 font-bold rounded-lg hover:bg-red-100 text-[11px] inline-flex items-center gap-1"
                                title="Delete Gig permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* INSPECT GIG DETAILS MODAL */}
              {viewingGig && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-3xl w-full space-y-6 max-h-[90vh] overflow-y-auto text-slate-800 shadow-2xl">
                    <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-fiverr-dark">{viewingGig.title}</h3>
                          {viewingGig.featured && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-xs font-bold">★ Featured</span>
                          )}
                        </div>
                        <p className="text-xs text-fiverr-muted mt-1">Gig ID: #{viewingGig.id} · Category: <span className="text-emerald-600 font-semibold">{viewingGig.category} ({viewingGig.subcategory || 'General'})</span></p>
                      </div>
                      <button 
                        onClick={() => setViewingGig(null)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-fiverr-dark text-xs font-bold rounded-xl"
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <img 
                          src={viewingGig.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=500&fit=crop'} 
                          className="w-full h-48 rounded-2xl object-cover border border-slate-200 shadow-xs" 
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                            <span className="text-[9px] text-fiverr-muted uppercase font-bold block">Starting Price</span>
                            <span className="text-sm font-bold text-emerald-600">${viewingGig.price}</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                            <span className="text-[9px] text-fiverr-muted uppercase font-bold block">Delivery Time</span>
                            <span className="text-sm font-bold text-fiverr-dark">{viewingGig.deliveryDays} Days</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                            <span className="text-[9px] text-fiverr-muted uppercase font-bold block">Rating</span>
                            <span className="text-sm font-bold text-yellow-500">★ {viewingGig.rating || 5.0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] text-fiverr-muted uppercase font-bold block">Gig Description</span>
                          <p className="text-xs text-fiverr-dark leading-relaxed whitespace-pre-wrap">{viewingGig.description}</p>
                        </div>

                        {viewingGig.extras && viewingGig.extras.length > 0 && (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-fiverr-muted uppercase font-bold block mb-2">Gig Upgrades & Extras</span>
                            <div className="space-y-2">
                              {viewingGig.extras.map(e => (
                                <div key={e.id} className="flex justify-between items-center text-xs bg-white px-3 py-2 rounded-lg border border-slate-200">
                                  <span className="text-slate-800">{e.title}</span>
                                  <span className="font-bold text-emerald-600">+${e.price}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={viewingGig.freelancerAvatar} className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20" />
                        <div>
                          <span className="text-xs font-bold text-fiverr-dark block">{viewingGig.freelancerName}</span>
                          <span className="text-[11px] text-fiverr-muted">Freelancer ID: {viewingGig.freelancerId} · Level: {viewingGig.freelancerLevel || 'Pro'}</span>
                        </div>
                      </div>
                      <span className="text-xs text-fiverr-muted">Moderation: {viewingGig.moderationStatus || 'Pending review'}</span>
                    </div>

                    {viewingGig.moderationNotes && (
                      <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl text-xs space-y-1">
                        <span className="font-bold text-purple-700 block">Moderation Log Notes:</span>
                        <p className="text-purple-900">{viewingGig.moderationNotes}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <button 
                        onClick={() => {
                          if (viewingGig) {
                            handleDeleteGig(viewingGig.id);
                            setViewingGig(null);
                          }
                        }}
                        className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Service</span>
                      </button>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            const g = viewingGig;
                            setViewingGig(null);
                            handleOpenEditGigModal(g);
                          }}
                          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-xl flex items-center gap-1 text-xs transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Edit Details</span>
                        </button>
                        <button 
                          onClick={() => setViewingGig(null)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-fiverr-dark font-bold rounded-xl text-xs transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EDIT GIG DETAILS MODAL */}
              {editingGig && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full space-y-5 text-slate-800 shadow-2xl">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <h3 className="text-lg font-bold text-fiverr-dark">Edit Service — {editingGig.title}</h3>
                      <button 
                        onClick={() => setEditingGig(null)}
                        className="text-slate-400 hover:text-fiverr-dark text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditGig} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-fiverr-dark font-bold uppercase mb-1">Service / Gig Title</label>
                        <input 
                          type="text" 
                          value={editGigForm.title}
                          onChange={(e) => setEditGigForm(prev => ({ ...prev, title: e.target.value }))}
                          required
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Category</label>
                          <select 
                            value={editGigForm.category}
                            onChange={(e) => setEditGigForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Subcategory</label>
                          <input 
                            type="text" 
                            value={editGigForm.subcategory}
                            onChange={(e) => setEditGigForm(prev => ({ ...prev, subcategory: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Base Price ($)</label>
                          <input 
                            type="number" 
                            value={editGigForm.price}
                            onChange={(e) => setEditGigForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Delivery Time (Days)</label>
                          <input 
                            type="number" 
                            value={editGigForm.deliveryDays}
                            onChange={(e) => setEditGigForm(prev => ({ ...prev, deliveryDays: Number(e.target.value) }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Status</label>
                          <select 
                            value={editGigForm.status}
                            onChange={(e) => setEditGigForm(prev => ({ ...prev, status: e.target.value as any }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                          >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-fiverr-dark font-bold uppercase mb-1">Description</label>
                        <textarea 
                          rows={4}
                          value={editGigForm.description}
                          onChange={(e) => setEditGigForm(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                        />
                      </div>

                      <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-fiverr-dark">
                          <input 
                            type="checkbox" 
                            checked={editGigForm.featured}
                            onChange={(e) => setEditGigForm(prev => ({ ...prev, featured: e.target.checked }))}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <span>Feature Gig on Homepage & Listings</span>
                        </label>
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                        <button 
                          type="button"
                          onClick={() => {
                            if (editingGig) {
                              handleDeleteGig(editingGig.id);
                              setEditingGig(null);
                            }
                          }}
                          className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Service</span>
                        </button>
                        <div className="flex items-center gap-3">
                          <button 
                            type="button"
                            onClick={() => setEditingGig(null)}
                            className="px-4 py-2 bg-slate-100 text-fiverr-dark font-bold rounded-xl hover:bg-slate-200 text-xs"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 text-xs shadow-xs"
                          >
                            Save Gig Details
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODERATE GIG MODAL */}
              {moderatingGig && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-5 text-slate-800 shadow-2xl">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <h3 className="text-lg font-bold text-fiverr-dark">Moderate Service / Gig</h3>
                      <button 
                        onClick={() => setModeratingGig(null)}
                        className="text-slate-400 hover:text-fiverr-dark text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSaveGigModeration} className="space-y-4 text-xs">
                      <div>
                        <span className="text-fiverr-muted block font-bold mb-1">Gig Title:</span>
                        <span className="text-fiverr-dark font-bold text-sm block">{moderatingGig.title}</span>
                      </div>

                      <div>
                        <label className="block text-fiverr-dark font-bold uppercase mb-1">Moderation Verdict</label>
                        <select 
                          value={gigModerationStatus}
                          onChange={(e) => setGigModerationStatus(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                        >
                          <option value="approved">✓ Approved (Complies with Policy)</option>
                          <option value="flagged">⚠ Flagged for Policy Warning</option>
                          <option value="rejected">✕ Rejected (Policy Violation)</option>
                          <option value="pending">⏳ Pending Review</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-fiverr-dark font-bold uppercase mb-1">Moderation Review Notes</label>
                        <textarea 
                          rows={3}
                          placeholder="Provide rationales, warning notes, or feedback for the seller..."
                          value={gigModerationNotes}
                          onChange={(e) => setGigModerationNotes(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                        />
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button 
                          type="button"
                          onClick={() => setModeratingGig(null)}
                          className="px-4 py-2 bg-slate-100 text-fiverr-dark font-bold rounded-xl hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 shadow-xs"
                        >
                          Save Moderation Verdict
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODULE 5: CATEGORIES & SUBCATEGORIES MANAGEMENT */}
          {adminTab === 'categories' && (
            <div className="space-y-6">
              {/* Add New Category Box */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                <h3 className="text-base font-bold text-fiverr-dark mb-2">Add New Parent Category</h3>
                <p className="text-xs text-fiverr-muted mb-4">Create top-level marketplace categories with clean search-engine friendly slugs.</p>
                <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row items-center gap-3">
                  <input 
                    type="text" 
                    placeholder="Category Name (e.g. Writing & Translation)..." 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white w-full"
                  />
                  <input 
                    type="text" 
                    placeholder="Slug (optional e.g. writing-translation)..." 
                    value={newCategorySlug}
                    onChange={(e) => setNewCategorySlug(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white w-full"
                  />
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-500 transition-colors whitespace-nowrap w-full sm:w-auto flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Category</span>
                  </button>
                </form>
              </div>

              {/* Categories & Subcategories Directory */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-fiverr-dark">Categories & Subcategories Directory</h3>
                    <p className="text-xs text-fiverr-muted">Edit titles, manage slugs, toggle status (ON/OFF), or bulk delete categories.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {(selectedCatIds.length > 0 || selectedSubPairs.length > 0) && (
                      <button 
                        onClick={handleBulkDeleteCategories}
                        className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-500 transition-colors shadow-xs flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Bulk Delete Selected ({selectedCatIds.length + selectedSubPairs.length})</span>
                      </button>
                    )}
                    <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      {categories.length} Categories Total
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {categories.map(cat => {
                    const isEditingThisCat = editingCatId === cat.id;
                    const isCatSelected = selectedCatIds.includes(cat.id);

                    return (
                      <div key={cat.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                        {/* Parent Category Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                          <div className="flex items-center gap-3 flex-1">
                            <input 
                              type="checkbox"
                              checked={isCatSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCatIds(prev => [...prev, cat.id]);
                                } else {
                                  setSelectedCatIds(prev => prev.filter(id => id !== cat.id));
                                }
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />

                            {isEditingThisCat ? (
                              <div className="flex-1 flex flex-col sm:flex-row items-center gap-2">
                                <input 
                                  type="text" 
                                  value={editCatName} 
                                  onChange={(e) => setEditCatName(e.target.value)} 
                                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-fiverr-dark"
                                />
                                <input 
                                  type="text" 
                                  value={editCatSlug} 
                                  onChange={(e) => setEditCatSlug(e.target.value)} 
                                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-emerald-600 font-mono"
                                />
                                <button 
                                  onClick={() => handleUpdateCategory(cat.id)}
                                  className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs hover:bg-emerald-500"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditingCatId(null)}
                                  className="px-3 py-1.5 bg-slate-200 text-fiverr-dark font-bold rounded-lg text-xs hover:bg-slate-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-fiverr-dark">{cat.name}</span>
                                <span className="text-xs text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  /categories/{cat.slug}
                                </span>
                              </div>
                            )}
                          </div>

                          {!isEditingThisCat && (
                            <div className="flex items-center gap-2">
                              {/* On/Off Toggle Button */}
                              <button 
                                onClick={() => handleToggleCategory(cat.id)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-colors ${cat.enabled !== false ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-fiverr-muted border border-slate-300'}`}
                              >
                                {cat.enabled !== false ? '● ON' : '○ OFF'}
                              </button>

                              <button 
                                onClick={() => {
                                  setEditingCatId(cat.id);
                                  setEditCatName(cat.name);
                                  setEditCatSlug(cat.slug);
                                }}
                                className="px-3 py-1.5 bg-white text-fiverr-dark hover:text-fiverr-dark border border-slate-200 font-bold rounded-lg text-xs hover:bg-slate-100 transition-colors"
                              >
                                Edit Category
                              </button>
                              <button 
                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 font-bold rounded-lg text-xs hover:bg-red-100 transition-colors flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Subcategories List */}
                        <div className="pl-4 space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-fiverr-muted">Subcategories</span>
                            <button 
                              onClick={() => {
                                setAddingSubForCatId(addingSubForCatId === cat.id ? null : cat.id);
                                setNewSubcategoryName('');
                              }}
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>+ Add Subcategory</span>
                            </button>
                          </div>

                          {/* Add subcategory inline input */}
                          {addingSubForCatId === cat.id && (
                            <div className="flex items-center gap-2 mb-3 bg-white p-2.5 rounded-xl border border-slate-200">
                              <input 
                                type="text" 
                                placeholder="Subcategory name (e.g. Logo Design)..." 
                                value={newSubcategoryName}
                                onChange={(e) => setNewSubcategoryName(e.target.value)}
                                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-fiverr-dark focus:outline-none"
                              />
                              <button 
                                onClick={() => handleAddSubcategory(cat.id)}
                                className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-500"
                              >
                                Add
                              </button>
                              <button 
                                onClick={() => setAddingSubForCatId(null)}
                                className="px-3 py-1.5 bg-slate-100 text-fiverr-dark text-xs rounded-lg hover:bg-slate-200"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {cat.subcategories.map(sub => {
                            const isEditingSub = editingSubId?.catId === cat.id && editingSubId?.subId === sub.id;
                            const isSubSelected = selectedSubPairs.some(p => p.catId === cat.id && p.subId === sub.id);

                            return (
                              <div key={sub.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                                {isEditingSub ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <input 
                                      type="text" 
                                      value={editSubName} 
                                      onChange={(e) => setEditSubName(e.target.value)} 
                                      className="px-3 py-1 bg-slate-50 border border-slate-300 rounded text-xs text-fiverr-dark"
                                    />
                                    <button 
                                      onClick={() => handleUpdateSubcategory(cat.id, sub.id)}
                                      className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded text-xs"
                                    >
                                      Save
                                    </button>
                                    <button 
                                      onClick={() => setEditingSubId(null)}
                                      className="px-2.5 py-1 bg-slate-100 text-fiverr-dark rounded text-xs"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2.5">
                                      <input 
                                        type="checkbox"
                                        checked={isSubSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedSubPairs(prev => [...prev, { catId: cat.id, subId: sub.id }]);
                                          } else {
                                            setSelectedSubPairs(prev => prev.filter(p => !(p.catId === cat.id && p.subId === sub.id)));
                                          }
                                        }}
                                        className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                      />
                                      <span className="text-slate-400">•</span>
                                      <span className="font-semibold text-fiverr-dark">{sub.name}</span>
                                      <span className="text-[11px] font-mono text-fiverr-muted">(`/categories/${sub.slug}`)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {/* Subcategory On/Off Toggle */}
                                      <button 
                                        onClick={() => handleToggleSubcategory(cat.id, sub.id)}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${sub.enabled !== false ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-fiverr-muted border border-slate-200'}`}
                                      >
                                        {sub.enabled !== false ? 'ON' : 'OFF'}
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setEditingSubId({ catId: cat.id, subId: sub.id });
                                          setEditSubName(sub.name);
                                        }}
                                        className="text-fiverr-muted hover:text-fiverr-dark font-semibold text-[11px]"
                                      >
                                        Edit
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteSubcategory(cat.id, sub.id, sub.name)}
                                        className="text-red-600 hover:text-red-700 font-semibold text-[11px]"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MODULE 5: ALL ORDERS MANAGEMENT */}
          {adminTab === 'orders' && (
            <AdminOrdersManager
              orders={orders as any}
              users={usersList as any}
              gigs={gigs}
              currentUser={effectiveAdminUser}
              onRefreshOrders={fetchAllAdminData}
              getGigUrl={getGigUrl}
            />
          )}

          {/* MODULE 6: PROPOSALS & BIDS MANAGEMENT */}
          {adminTab === 'proposals' && (
            <div className="space-y-6">
              {/* Filter & Control Header */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-fiverr-dark flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <span>Proposals & Bidding Management</span>
                    </h3>
                    <p className="text-xs text-fiverr-muted mt-0.5">Manage, search, filter, edit, approve, reject, or delete freelancer bids and project relationships.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-fiverr-dark font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                      {proposals.length} Total Bids / Proposals
                    </span>
                  </div>
                </div>

                {/* Search & Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input 
                      type="text" 
                      placeholder="Search freelancer, project, cover letter..." 
                      value={proposalSearchQuery}
                      onChange={(e) => setProposalSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select 
                      value={proposalStatusFilter}
                      onChange={(e) => setProposalStatusFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <select 
                      value={proposalSort}
                      onChange={(e) => setProposalSort(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="bid_high">Sort: Bid Amount High-Low</option>
                      <option value="bid_low">Sort: Bid Amount Low-High</option>
                    </select>
                  </div>

                  {/* Bid Range Filter */}
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Min $" 
                      value={proposalBidMinFilter}
                      onChange={(e) => setProposalBidMinFilter(e.target.value)}
                      className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                    <input 
                      type="number" 
                      placeholder="Max $" 
                      value={proposalBidMaxFilter}
                      onChange={(e) => setProposalBidMaxFilter(e.target.value)}
                      className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Proposals Table */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-fiverr-dark border-b border-slate-200">
                        <th className="p-4">Freelancer</th>
                        <th className="p-4">Project / RFP Target</th>
                        <th className="p-4">Bid Amount & Delivery</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Created At</th>
                        <th className="p-4 text-right">Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-fiverr-dark">
                      {proposals
                        .filter(p => {
                          const q = proposalSearchQuery.toLowerCase();
                          const proj = projects.find(projItem => projItem.id === p.projectId);
                          const projectTitle = proj ? proj.title : '';
                          const matchesSearch = !q || 
                            p.freelancerName.toLowerCase().includes(q) || 
                            p.coverLetter.toLowerCase().includes(q) ||
                            projectTitle.toLowerCase().includes(q);
                          const matchesStatus = proposalStatusFilter === 'all' || p.status === proposalStatusFilter;
                          
                          const minVal = Number(proposalBidMinFilter) || 0;
                          const maxVal = Number(proposalBidMaxFilter) || Infinity;
                          const matchesBid = p.bidAmount >= minVal && p.bidAmount <= maxVal;

                          return matchesSearch && matchesStatus && matchesBid;
                        })
                        .sort((a, b) => {
                          if (proposalSort === 'bid_high') return b.bidAmount - a.bidAmount;
                          if (proposalSort === 'bid_low') return a.bidAmount - b.bidAmount;
                          return b.id.localeCompare(a.id); // default/newest
                        })
                        .map(p => {
                          const proj = projects.find(projItem => projItem.id === p.projectId);
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img src={p.freelancerAvatar} className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 shrink-0" />
                                  <div>
                                    <span className="font-bold text-fiverr-dark text-sm block">{p.freelancerName}</span>
                                    <span className="text-[11px] text-fiverr-muted truncate max-w-[150px] block">{p.freelancerTitle}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                {proj ? (
                                  <div>
                                    <span className="font-semibold text-fiverr-dark block text-xs truncate max-w-[220px]">{proj.title}</span>
                                    <span className="text-[10px] text-fiverr-muted font-mono block mt-0.5">Project ID: #{proj.id} · Buyer: {proj.buyerName}</span>
                                  </div>
                                ) : (
                                  <span className="text-red-600 font-semibold">Unknown / Deleted Project</span>
                                )}
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-emerald-600 block text-sm">${p.bidAmount.toLocaleString()}</span>
                                <span className="text-[11px] text-fiverr-muted">{p.deliveryDays} Days Delivery</span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                                  p.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  p.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                  'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-[11px] text-fiverr-muted">
                                {p.createdAt || '2026-10-02'}
                              </td>
                              <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                                {/* View Proposal Details */}
                                <button 
                                  onClick={() => setViewingProposal(p)}
                                  className="px-2.5 py-1.5 bg-slate-50 text-fiverr-dark border border-slate-200 font-bold rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-1 text-[11px]"
                                  title="View complete cover letter & details"
                                >
                                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>View</span>
                                </button>

                                {/* Edit Proposal */}
                                <button 
                                  onClick={() => handleOpenEditProposalModal(p)}
                                  className="px-2.5 py-1.5 bg-slate-50 text-fiverr-dark border border-slate-200 font-bold rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-1 text-[11px]"
                                  title="Edit bid parameters"
                                >
                                  <Settings className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Edit</span>
                                </button>

                                {/* Quick Accept */}
                                {p.status !== 'accepted' && (
                                  <button 
                                    onClick={() => handleUpdateProposalStatus(p.id, 'accepted')}
                                    className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-lg hover:bg-emerald-100 text-[11px]"
                                    title="Accept Proposal"
                                  >
                                    Accept
                                  </button>
                                )}

                                {/* Quick Reject */}
                                {p.status !== 'rejected' && (
                                  <button 
                                    onClick={() => handleUpdateProposalStatus(p.id, 'rejected')}
                                    className="px-2.5 py-1.5 bg-red-50 text-red-700 border border-red-200 font-bold rounded-lg hover:bg-red-100 text-[11px]"
                                    title="Reject Proposal"
                                  >
                                    Reject
                                  </button>
                                )}

                                {/* Delete */}
                                <button 
                                  onClick={() => handleDeleteProposal(p.id)}
                                  className="px-2 py-1.5 bg-red-50 text-red-700 border border-red-200 font-bold rounded-lg hover:bg-red-100 text-[11px]"
                                  title="Delete Proposal"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      {proposals.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">No proposals or bids recorded in the platform database.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* VIEW PROPOSAL DETAILS MODAL */}
              {viewingProposal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto text-slate-800 shadow-2xl">
                    <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-fiverr-dark">Proposal #{viewingProposal.id} Details</h3>
                        <p className="text-xs text-fiverr-muted mt-0.5">Submitted by <span className="text-emerald-600 font-semibold">{viewingProposal.freelancerName}</span></p>
                      </div>
                      <button 
                        onClick={() => setViewingProposal(null)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-fiverr-dark text-xs font-bold rounded-xl"
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-fiverr-muted uppercase font-bold block mb-1">Bid Amount</span>
                        <span className="text-lg font-bold text-emerald-600">${viewingProposal.bidAmount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-fiverr-muted uppercase font-bold block mb-1">Delivery Time</span>
                        <span className="text-lg font-bold text-fiverr-dark">{viewingProposal.deliveryDays} Days</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-fiverr-muted uppercase font-bold block mb-1">Current Status</span>
                        <span className="text-lg font-bold text-indigo-600 uppercase">{viewingProposal.status}</span>
                      </div>
                    </div>

                    {/* Freelancer Profile Shortcard */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                      <img src={viewingProposal.freelancerAvatar} className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0" />
                      <div>
                        <span className="text-sm font-bold text-fiverr-dark block">{viewingProposal.freelancerName}</span>
                        <span className="text-xs text-fiverr-muted">{viewingProposal.freelancerTitle}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">ID: {viewingProposal.freelancerId}</span>
                      </div>
                    </div>

                    {/* Target Project Card */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-fiverr-muted font-bold uppercase block mb-1.5">Project / Bid Relationship Target</span>
                      {projects.find(pr => pr.id === viewingProposal.projectId) ? (
                        <div>
                          <span className="text-xs font-bold text-fiverr-dark block mb-1">{projects.find(pr => pr.id === viewingProposal.projectId)?.title}</span>
                          <span className="text-[11px] text-fiverr-muted">Budget Range: <span className="text-emerald-600 font-semibold">${projects.find(pr => pr.id === viewingProposal.projectId)?.budgetMin} - ${projects.find(pr => pr.id === viewingProposal.projectId)?.budgetMax}</span></span>
                        </div>
                      ) : (
                        <span className="text-red-600 text-xs font-semibold">Referenced project has been deleted or suspended.</span>
                      )}
                    </div>

                    {/* Description/Cover Letter */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                      <h4 className="text-[11px] font-bold text-fiverr-muted uppercase">Cover Letter & Description / Milestones</h4>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{viewingProposal.coverLetter}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* EDIT PROPOSAL MODAL */}
              {editingProposal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full space-y-5 text-slate-800 shadow-2xl">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <h3 className="text-lg font-bold text-fiverr-dark">Edit Bid Parameters — Proposal #{editingProposal.id}</h3>
                      <button 
                        onClick={() => setEditingProposal(null)}
                        className="text-slate-400 hover:text-fiverr-dark text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditProposal} className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Bid Amount ($)</label>
                          <input 
                            type="number" 
                            value={editProposalForm.bidAmount}
                            onChange={(e) => setEditProposalForm(prev => ({ ...prev, bidAmount: Number(e.target.value) }))}
                            required
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-fiverr-dark font-bold uppercase mb-1">Delivery Time (Days)</label>
                          <input 
                            type="number" 
                            value={editProposalForm.deliveryDays}
                            onChange={(e) => setEditProposalForm(prev => ({ ...prev, deliveryDays: Number(e.target.value) }))}
                            required
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-fiverr-dark font-bold uppercase mb-1">Proposal Status</label>
                        <select 
                          value={editProposalForm.status}
                          onChange={(e) => setEditProposalForm(prev => ({ ...prev, status: e.target.value as any }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-fiverr-dark font-bold uppercase mb-1">Cover Letter & Milestones / Deliverables</label>
                        <textarea 
                          rows={6}
                          value={editProposalForm.coverLetter}
                          onChange={(e) => setEditProposalForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                        />
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button 
                          type="button"
                          onClick={() => setEditingProposal(null)}
                          className="px-4 py-2 bg-slate-100 text-fiverr-dark font-bold rounded-xl hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-xs"
                        >
                          Save Proposal
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODULE 10: USER WALLETS & DOUBLE-ENTRY LEDGER */}
          {adminTab === 'wallet' && (
            <UserWalletsLedgerModule currentUser={effectiveAdminUser} />
          )}

          {/* MODULE 12: PAYMENTS & EARNINGS */}
          {adminTab === 'payments' && (
            <PaymentsModule 
              gigs={gigs} 
              orders={orders} 
              projects={projects} 
              proposals={proposals} 
              currentUser={effectiveAdminUser} 
              onBalanceUpdate={fetchAllAdminData}
            />
          )}

          {/* MODULE 11: ESCROW MANAGEMENT (MANDATORY 14-DAY PROTECTION) */}
          {adminTab === 'escrow' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-fiverr-dark">Escrow Protection Vault</h3>
                  <p className="text-xs text-fiverr-muted">Enforcing mandatory 14-day protection window on all milestone funds.</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  {escrowProtectionDays}-Day Lock Policy
                </span>
              </div>

              {orders.map(ord => (
                <div key={ord.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      {(() => {
                        const targetUrl = ord.serviceUrl || (ord.gigId && gigs.find(g => g.id === ord.gigId) ? getGigUrl(gigs.find(g => g.id === ord.gigId)!) : (ord.id === 'ord_bk' ? '/broadcastking/create-an-amazing-promotional-explainer-video-a-puppet' : ord.id === 'ord_bushra' ? '/bushra/i-will-increase-ahrefs-domain-rating-dr-70-using-high-authority-seo-backlinks' : '/elena_rostova/i-will-build-a-high-performance-full-stack-web-app-in-react-and-node'));
                        return (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={targetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-fiverr-dark hover:text-emerald-600 transition-colors inline-flex items-center gap-1 group"
                              title={`View "${ord.title}" in new tab`}
                            >
                              <span className="group-hover:underline">{ord.title}</span>
                              <ExternalLink className="w-3 h-3 text-emerald-600 shrink-0" />
                            </a>
                          </div>
                        );
                      })()}
                      <span className="text-[11px] text-fiverr-muted">Buyer ID: {ord.buyerId} · Seller ID: {ord.sellerId}</span>
                    </div>
                    <span className="text-base font-bold text-emerald-600">${ord.amount}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-fiverr-dark">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Protection Start</span>
                      <span className="font-mono font-medium">{ord.escrowProtectionStartDate || '2026-10-05'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Protection End (14 Days)</span>
                      <span className="font-mono text-emerald-600 font-bold">{ord.escrowProtectionEndDate || '2026-10-19'}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setOrders(prev => prev.map(o => o.id === ord.id ? { ...o, status: 'completed' } : o));
                        alert(`Escrow released for order #${ord.id}`);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 shadow-xs"
                    >
                      Release Funds
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MODULE 7: PAYOUT MANAGEMENT */}
          {adminTab === 'payouts' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                <h3 className="text-lg font-bold text-fiverr-dark mb-2">Payout Management</h3>
                <p className="text-xs text-fiverr-muted">Manage freelancer payouts, statuses, and prevent duplicates.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 overflow-x-auto shadow-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-fiverr-muted text-xs uppercase font-bold border-b border-slate-100">
                      <th className="p-3">Freelancer ID</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-fiverr-dark">
                    {payouts.map(p => (
                      <tr key={p.id}>
                        <td className="p-3">{p.freelancerId}</td>
                        <td className="p-3 font-bold">${p.amount}</td>
                        <td className="p-3 capitalize">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                            p.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-fiverr-dark'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {p.status === 'pending' && (
                            <>
                              <button onClick={() => handleApprovePayout(p.id)} className="text-emerald-600 font-bold hover:text-emerald-700">Approve</button>
                              <button onClick={() => handleFailPayout(p.id)} className="text-red-600 font-bold hover:text-red-700">Fail</button>
                            </>
                          )}
                          {p.status === 'approved' && (
                            <button onClick={() => handleProcessPayout(p.id)} className="text-blue-600 font-bold hover:text-blue-700">Process</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODULE 11: DISPUTE MANAGEMENT */}
          {adminTab === 'disputes' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-fiverr-dark mb-4">Escrow Dispute Investigation Desk</h3>
              {disputes.map(disp => (
                <div key={disp.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-fiverr-dark">Dispute #{disp.id} on Order #{disp.orderId}: {orders.find(o => o.id === disp.orderId)?.title || 'Unknown Order'}</span>
                    <span className="text-xs font-bold uppercase text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
                      {disp.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-fiverr-dark bg-white p-3 rounded-xl border border-slate-200">
                    <strong className="text-fiverr-dark">Reason:</strong> {disp.reason}
                  </p>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleResolveDispute(disp.id, 'resolved_refund')}
                      className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 font-bold text-xs rounded-lg hover:bg-red-100"
                    >
                      Full Refund to Buyer
                    </button>
                    <button 
                      onClick={() => handleResolveDispute(disp.id, 'resolved_release')}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-lg hover:bg-emerald-100"
                    >
                      Release Escrow to Seller
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MODULE 17: SUPPORT TICKETS */}
          {adminTab === 'support' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-fiverr-dark mb-4">Support Ticket Help Desk</h3>
              {supportTickets.map(ticket => (
                <div key={ticket.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-fiverr-dark block">{ticket.subject}</span>
                      <span className="text-xs text-fiverr-muted">User: {ticket.userName} · Priority: {ticket.priority}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                      {ticket.status}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto bg-white p-3 rounded-xl border border-slate-200 text-xs">
                    {ticket.messages.map((m, idx) => (
                      <div key={idx} className="text-fiverr-dark">
                        <strong className="text-fiverr-dark">{m.sender}:</strong> {m.text}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Type staff reply..." 
                      value={ticketReplyText}
                      onChange={(e) => setTicketReplyText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-fiverr-dark focus:outline-none focus:border-emerald-500"
                    />
                    <button 
                      onClick={() => handleSupportReply(ticket.id)}
                      className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-500 shadow-xs"
                    >
                      Reply Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MODULE 20: SITE & FEE SETTINGS */}
          {adminTab === 'settings' && (
            <SiteFeeSettingsModule
              currentUser={effectiveAdminUser}
              onSettingsSaved={(newSettings) => {
                setPlatformFee(newSettings.freelancerCommissionRate);
                setEscrowProtectionDays(newSettings.escrowHoldDays);
                fetchAllAdminData();
              }}
            />
          )}

          {/* MODULE 21: ACTIVITY & AUDIT TRAIL */}
          {(adminTab === 'security' || adminTab === 'activity') && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-fiverr-dark flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      <span>Admin Activity Logs & Audit Trail</span>
                    </h3>
                    <p className="text-xs text-fiverr-muted mt-0.5">Real-time audit log of all administrative actions, user status changes, impersonation sessions, and category modifications.</p>
                  </div>
                  <button 
                    onClick={fetchAllAdminData}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-fiverr-dark text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Refresh Activity Stream</span>
                  </button>
                </div>

                {/* Activity Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-fiverr-muted tracking-wider">Total Actions Logged</span>
                    <div className="text-xl font-bold text-fiverr-dark mt-1">{auditLogs.length}</div>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">User Governance</span>
                    <div className="text-xl font-bold text-amber-800 mt-1">
                      {auditLogs.filter(l => l.action.includes('USER')).length}
                    </div>
                  </div>
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">Impersonation Audits</span>
                    <div className="text-xl font-bold text-indigo-800 mt-1">
                      {auditLogs.filter(l => l.action.includes('IMPERSONAT')).length}
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Category Operations</span>
                    <div className="text-xl font-bold text-emerald-800 mt-1">
                      {auditLogs.filter(l => l.action.includes('CATEGORY')).length}
                    </div>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input 
                      type="text" 
                      placeholder="Search activity action, actor, target, or details..." 
                      value={activitySearchQuery}
                      onChange={(e) => setActivitySearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <select 
                      value={activityActionFilter}
                      onChange={(e) => setActivityActionFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark focus:outline-none focus:border-emerald-500 focus:bg-white"
                    >
                      <option value="all">All Administrative Actions</option>
                      <option value="user_status">User Status (Suspend / Restrict)</option>
                      <option value="impersonated">Admin Impersonations</option>
                      <option value="category">Category / Subcategory Edits</option>
                      <option value="dispute">Dispute Resolutions</option>
                      <option value="support">Support Ticket Replies</option>
                    </select>
                  </div>
                </div>

                {/* Activity Logs Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-fiverr-muted uppercase text-[10px] tracking-wider font-bold bg-slate-50">
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Admin Actor</th>
                        <th className="py-3 px-4">Action Type</th>
                        <th className="py-3 px-4">Target Entity</th>
                        <th className="py-3 px-4">Activity Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs
                        .filter(log => {
                          const query = activitySearchQuery.toLowerCase().trim();
                          const matchesQuery = !query || 
                            log.action.toLowerCase().includes(query) ||
                            log.actor.toLowerCase().includes(query) ||
                            log.target.toLowerCase().includes(query) ||
                            log.details.toLowerCase().includes(query);

                          let matchesFilter = true;
                          if (activityActionFilter === 'user_status') matchesFilter = log.action.includes('STATUS') || log.action.includes('SUSPEND') || log.action.includes('RESTRICT');
                          else if (activityActionFilter === 'impersonated') matchesFilter = log.action.includes('IMPERSONAT');
                          else if (activityActionFilter === 'category') matchesFilter = log.action.includes('CATEGORY');
                          else if (activityActionFilter === 'dispute') matchesFilter = log.action.includes('DISPUTE');
                          else if (activityActionFilter === 'support') matchesFilter = log.action.includes('SUPPORT') || log.action.includes('TICKET');

                          return matchesQuery && matchesFilter;
                        })
                        .map(log => {
                          let badgeBg = 'bg-slate-100 text-fiverr-dark border-slate-200';
                          if (log.action.includes('SUSPEND') || log.action.includes('DELETED')) badgeBg = 'bg-red-50 text-red-700 border-red-200';
                          else if (log.action.includes('RESTRICT')) badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
                          else if (log.action.includes('IMPERSONAT')) badgeBg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                          else if (log.action.includes('CREATED') || log.action.includes('VERIFIED')) badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          else if (log.action.includes('RESOLVED') || log.action.includes('UPDATED')) badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';

                          return (
                            <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4 text-fiverr-muted font-mono text-[11px] whitespace-nowrap">{log.timestamp}</td>
                              <td className="py-3 px-4 font-bold text-fiverr-dark">
                                <div>{log.actor}</div>
                                <span className="text-[10px] text-slate-400 uppercase">{log.role}</span>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${badgeBg}`}>
                                  {log.action}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">{log.target}</td>
                              <td className="py-3 px-4 text-fiverr-dark">{log.details}</td>
                            </tr>
                          );
                        })
                      }
                    </tbody>
                  </table>
                  {auditLogs.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-xs">No admin activity records logged yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FALLBACK FOR OTHER MODULES */}
          {!['overview', 'users', 'projects', 'gigs', 'categories', 'orders', 'proposals', 'wallet', 'escrow', 'payouts', 'disputes', 'support', 'settings', 'security', 'activity'].includes(adminTab) && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3 shadow-xs">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-fiverr-dark uppercase">{adminTab} Module Active</h3>
              <p className="text-xs text-fiverr-muted">All data records and audit logs for this module are synchronized with PostgreSQL storage.</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-fiverr-dark font-sans selection:bg-emerald-500 selection:text-white">
      {/* IMPERSONATION BANNER */}
      {impersonatedUser && (
        <div className="bg-indigo-600 text-white px-6 py-2.5 flex items-center justify-between text-xs font-bold shadow-md sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>SUPER ADMIN IMPERSONATION ACTIVE: You are viewing WorkPerHour as {impersonatedUser.name} ({impersonatedUser.role})</span>
          </div>
          <button 
            onClick={handleStopImpersonation}
            className="px-3 py-1 bg-white text-indigo-900 rounded-md font-bold hover:bg-slate-100 transition-colors shadow-xs"
          >
            End Impersonation & Return to Admin
          </button>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between shadow-xs">
        {/* Left Side: Brand & Nav Links */}
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <a href="/" onClick={(e) => navigate('/', e)} className="flex items-center gap-2.5 text-left group">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-lg shadow-md group-hover:bg-slate-800 transition-colors">
                W
              </div>
              <div>
                <span className="text-[17px] font-bold tracking-tight text-fiverr-dark block leading-none">WorkPerHour</span>
                <span className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wider">Secure Escrow Marketplace</span>
              </div>
            </a>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-[13.5px] font-medium text-fiverr-dark">
            <a 
              href="/gigs" 
              onClick={(e) => navigate('/gigs', e)}
              className={`transition-colors hover:text-fiverr-dark py-1 ${isGigsList || isGigDetail ? 'text-fiverr-dark font-semibold border-b-2 border-slate-900' : ''}`}
            >
              Explore Gigs
            </a>
            <a 
              href="/projects" 
              onClick={(e) => navigate('/projects', e)}
              className={`transition-colors hover:text-fiverr-dark py-1 ${isProjectsList || isProjectDetail ? 'text-fiverr-dark font-semibold border-b-2 border-slate-900' : ''}`}
            >
              Buyer Requests
            </a>
          </nav>
        </div>

        {/* Zone 3: Primary Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* POST PROJECT BUTTON */}
          <a 
            href="/post-project"
            onClick={(e) => navigate('/post-project', e)}
            className="hidden sm:inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[12px] uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Post Project
          </a>

          {/* SEARCH DROPDOWN */}
          <div className="relative">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsHeaderSearchDropdownOpen(!isHeaderSearchDropdownOpen);
                setIsWorkstreamsDropdownOpen(false);
                setIsUserDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[12.5px] font-bold text-fiverr-dark transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-fiverr-muted" />
              <span>Search</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isHeaderSearchDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-[100] text-[13.5px] font-sans" onClick={(e) => e.stopPropagation()}>
                <div className="px-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Buyers can
                </div>
                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setIsHeaderSearchDropdownOpen(false);
                      navigate('/gigs');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-fiverr-dark">Search offers</div>
                    <span className="text-[10px] text-fiverr-muted">to buy now</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsHeaderSearchDropdownOpen(false);
                      navigate('/freelancers');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-fiverr-dark">Search freelancers</div>
                    <span className="text-[10px] text-fiverr-muted">to request a proposal</span>
                  </button>
                </div>

                <div className="px-4 pt-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100 mt-1">
                  Freelancers can
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      setIsHeaderSearchDropdownOpen(false);
                      navigate('/projects');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-fiverr-dark">Search projects</div>
                    <span className="text-[10px] text-fiverr-muted">to quote on</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsWishlistModalOpen(true)} 
            className="p-2 text-fiverr-dark hover:text-fiverr-dark rounded-full hover:bg-slate-100 transition-colors relative cursor-pointer"
            title="Wishlist / Liked Gigs"
          >
            <Heart className="w-5 h-5 text-fiverr-dark" />
            {likedGigIds.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                {likedGigIds.length}
              </span>
            )}
          </button>
          
          <div className="relative">
            <button 
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                if (!currentUser) {
                  const restored = await loadUserSession();
                  if (!restored) {
                    setIsLoginModalOpen(true);
                    return;
                  }
                }
                setIsWorkstreamsDropdownOpen(!isWorkstreamsDropdownOpen);
                setIsUserDropdownOpen(false);
              }} 
              className="p-2 text-fiverr-dark hover:text-fiverr-dark rounded-full hover:bg-slate-100 transition-colors relative cursor-pointer"
              title="Workstreams & Messages"
            >
              <Mail className="w-5 h-5 text-fiverr-dark" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>

            {isWorkstreamsDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-[100] text-xs font-sans" onClick={(e) => e.stopPropagation()}>
                <div className="px-4 pb-2.5 mb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workstreams</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">{orders.length} Active</span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {orders.slice(0, 5).map(ord => (
                    <div 
                      key={ord.id}
                      onClick={async () => {
                        if (!currentUser) {
                          const restored = await loadUserSession();
                          if (!restored) {
                            setIsLoginModalOpen(true);
                            return;
                          }
                        }
                        setSelectedOrder(ord);
                        fetchMessages(ord.id);
                        setIsWorkstreamsDropdownOpen(false);
                        navigate('/messages/' + ord.id);
                      }}
                      className="p-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3"
                    >
                      <img src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop" className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-bold text-fiverr-dark truncate">{ord.title}</span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">{ord.createdAt || '31 Jul 2026'}</span>
                        </div>
                        <p className="text-[11px] text-fiverr-muted truncate">
                          {ord.requirements || 'Hi Nikhil, Hope you are doing well. Please check the deliverables.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 px-3 border-t border-slate-100 mt-2 text-center">
                  <button 
                    onClick={() => {
                      setIsWorkstreamsDropdownOpen(false);
                      navigate('/messages');
                    }}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-fiverr-dark font-bold text-[10px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    View All
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsEmailModalOpen(true)} 
            className="p-2 text-fiverr-dark hover:text-fiverr-dark rounded-full hover:bg-slate-100 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-fiverr-dark" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {!currentUser ? (
            <>
              <button onClick={() => setIsLoginModalOpen(true)} className="px-4 py-2 text-[13.5px] font-semibold text-fiverr-dark hover:text-fiverr-dark">Login</button>
              <button onClick={() => setIsSignupModalOpen(true)} className="px-4 py-2 text-[13.5px] font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600">Sign Up</button>
            </>
          ) : (
            <div className="relative pl-2 border-l border-slate-200">
              <button 
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsUserDropdownOpen(!isUserDropdownOpen);
                }}
                className="relative flex items-center gap-1.5 cursor-pointer p-1 rounded-xl hover:bg-slate-100 transition-colors border-none bg-transparent"
              >
                <div className="relative">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                  {currentUser.isAvailableNow && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" title="Available Now"></span>
                  )}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-emerald-950 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-[100] text-[13px]" onClick={(e) => e.stopPropagation()}>
                  <div className="px-3 py-2 border-b border-slate-100 mb-1 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-fiverr-dark block">{currentUser.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{currentUser.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase ${currentUser.isAvailableNow ? 'text-emerald-700' : 'text-fiverr-muted'}`}>
                        {currentUser.isAvailableNow ? 'Available' : 'Unavailable'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleAvailableNow(); }}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          currentUser.isAvailableNow ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        role="switch"
                        aria-checked={currentUser.isAvailableNow}
                        title="Toggle availability status"
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            currentUser.isAvailableNow ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => { setIsUserDropdownOpen(false); navigate('/create-gig', e); }} 
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-fiverr-dark font-semibold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    <span>Post Gig</span>
                  </button>

                  <button 
                    onClick={(e) => { 
                      setIsUserDropdownOpen(false); 
                      const uSlug = slugify(currentUser.name);
                      navigate(`/${uSlug}`, e); 
                    }} 
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-fiverr-dark font-semibold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>★ Feature Gigs ($10 / 7d)</span>
                  </button>

                  <button 
                    onClick={(e) => { setIsUserDropdownOpen(false); navigate('/gigs', e); }} 
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-fiverr-dark font-semibold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                    <span>Dashboard</span>
                  </button>

                  <button 
                    onClick={(e) => { setIsUserDropdownOpen(false); navigate('/freelance-activity', e); }} 
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-fiverr-dark font-semibold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>Freelancer Activity</span>
                  </button>

                  <button 
                    onClick={(e) => { 
                      setIsUserDropdownOpen(false); 
                      const pUrl = `/${slugify(currentUser.name)}`;
                      navigate(pUrl, e); 
                    }} 
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-fiverr-dark font-semibold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Profile</span>
                  </button>

                  <button 
                    onClick={(e) => { setIsUserDropdownOpen(false); navigate('/projects', e); }} 
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-fiverr-dark font-semibold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <span>Buyer Activity</span>
                  </button>


                  <button 
                    onClick={(e) => { setIsUserDropdownOpen(false); navigate('/payments', e); }} 
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-fiverr-dark font-semibold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span>Payments</span>
                  </button>

                  <button 
                    onClick={() => { setIsUserDropdownOpen(false); setIsSupportModalOpen(true); }} 
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-fiverr-dark font-semibold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Customer Support</span>
                  </button>

                  <button 
                    onClick={() => { 
                      setIsUserDropdownOpen(false); 
                      alert('How WorkPerHour Works:\n\n1. Browse Gigs or Post a Project Request.\n2. Hire top experts and fund milestone payments safely into the 14-day Escrow Vault.\n3. Collaborate in real-time via project Workstreams.\n4. Approve completed work to release escrow funds.'); 
                    }} 
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-fiverr-dark font-semibold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>How it works</span>
                  </button>

                  <div className="my-1 border-t border-slate-100"></div>

                  <button 
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      setImpersonatedUser(null);
                      setCurrentUser(null);
                      localStorage.removeItem('workperhour_token');
                      localStorage.removeItem('user');
                      setPath('/gigs');
                      window.history.pushState({}, '', '/gigs');
                    }} 
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>





      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {/* VIEW: FREELANCER ACTIVITY (/freelance-activity) */}
        {path === '/freelance-activity' && (
          <div className="max-w-7xl mx-auto space-y-8 font-sans">
            <div>
              <h1 className="text-3xl font-bold text-fiverr-dark tracking-tight">My Freelancer Activity</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content (3 cols) */}
              <div className="lg:col-span-3 space-y-6">
                {/* PROJECTS / OFFERS TOGGLE TABS */}
                <div className="flex rounded-2xl bg-slate-200/70 p-1 w-fit">
                  <button
                    onClick={() => {
                      setFreelanceTab('projects');
                      setFreelanceSubFilter('All');
                    }}
                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      freelanceTab === 'projects' ? 'bg-white text-fiverr-dark shadow-sm' : 'text-fiverr-dark hover:text-fiverr-dark'
                    }`}
                  >
                    PROJECTS
                  </button>
                  <button
                    onClick={() => {
                      setFreelanceTab('offers');
                      setFreelanceSubFilter('All');
                    }}
                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      freelanceTab === 'offers' ? 'bg-emerald-600 text-white shadow-sm' : 'text-fiverr-dark hover:text-fiverr-dark'
                    }`}
                  >
                    OFFERS
                  </button>
                </div>

                {/* SUB FILTERS */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-2 text-xs font-bold text-fiverr-dark shadow-xs overflow-x-auto">
                  {(freelanceTab === 'projects' ? ['All', 'In Progress', 'Completed', 'Expired'] : ['All', 'Active', 'Paused', 'Pending', 'Declined', 'Featured']).map(sub => (
                    <button
                      key={sub}
                      onClick={() => setFreelanceSubFilter(sub)}
                      className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                        freelanceSubFilter === sub ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-100 text-fiverr-dark'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                {/* PROJECTS VS OFFERS CONDITIONAL LIST */}
                {freelanceTab === 'projects' ? (
                  <div className="bg-white border border-slate-200 rounded-3xl shadow-xs divide-y divide-slate-100 overflow-hidden">
                    {(() => {
                      const currentUid = impersonatedUser ? impersonatedUser.id : (currentUser ? currentUser.id : 'user_1');
                      const filteredOrders = orders.filter(ord => {
                        const isMyOrder = ord.sellerId === currentUid || ord.buyerId === currentUid || currentUid === 'user_1';
                        if (!isMyOrder) return false;

                        const isExpired = (new Date(ord.dueDate) < new Date() && ord.status !== 'completed') || ord.status === 'cancelled';
                        if (freelanceSubFilter === 'Active' || freelanceSubFilter === 'In Progress') {
                          return (ord.status === 'in_progress' || ord.status === 'funded_in_escrow' || ord.status === 'revision' || ord.status === 'disputed' || ord.status === 'delivered') && !isExpired;
                        }
                        if (freelanceSubFilter === 'Completed') return ord.status === 'completed';
                        if (freelanceSubFilter === 'Expired') return isExpired;
                        return true;
                      });

                      if (filteredOrders.length === 0) {
                        return (
                          <div className="text-center py-16 text-slate-400 text-xs space-y-2">
                            <p className="font-semibold text-fiverr-dark">No projects found under &ldquo;{freelanceSubFilter}&rdquo;.</p>
                            <p className="text-slate-400">All ongoing client milestones and workstreams will appear here.</p>
                          </div>
                        );
                      }

                      return filteredOrders.map(ord => {
                        const isExpired = (new Date(ord.dueDate) < new Date() && ord.status !== 'completed') || ord.status === 'cancelled';
                        return (
                          <div key={ord.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-slate-50/70 transition-colors">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  isExpired ? 'bg-red-50 text-red-700 border border-red-200' :
                                  ord.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                  {isExpired ? 'Expired / Overdue' : ord.status.replace(/_/g, ' ')}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">Order #{ord.id}</span>
                              </div>
                              <h4 className="text-sm font-bold text-fiverr-dark">{ord.title}</h4>
                              <p className="text-xs text-fiverr-muted">Due Date: {ord.dueDate} · Escrow Amount: <span className="font-bold text-fiverr-dark">${ord.amount}</span></p>
                            </div>

                            <button
                              onClick={() => {
                                navigate('/messages/' + ord.id);
                              }}
                              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                            >
                              Open Workstream
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl shadow-xs divide-y divide-slate-100 overflow-hidden">
                    {(() => {
                      const currentUid = impersonatedUser ? impersonatedUser.id : (currentUser ? currentUser.id : 'user_1');
                      const filteredGigs = gigs.filter(g => {
                        const isMyGig = g.freelancerId === currentUid || (currentUser && g.freelancerName?.toLowerCase() === currentUser.name?.toLowerCase()) || currentUid === 'user_1';
                        if (!isMyGig) return false;

                        if (freelanceSubFilter === 'Active') return g.status === 'published' && (!g.moderationStatus || g.moderationStatus === 'approved');
                        if (freelanceSubFilter === 'Paused') return g.status === 'suspended' || g.status === 'paused' || g.status === 'draft';
                        if (freelanceSubFilter === 'Pending') return g.status === 'pending' || g.moderationStatus === 'pending';
                        if (freelanceSubFilter === 'Declined') return g.status === 'declined' || g.moderationStatus === 'rejected' || g.moderationStatus === 'flagged';
                        if (freelanceSubFilter === 'Featured') return !!g.featured;
                        return true;
                      });

                      if (filteredGigs.length === 0) {
                        return (
                          <div className="text-center py-16 text-slate-400 text-xs space-y-2">
                            <p className="font-semibold text-fiverr-dark">No services or offers found under &ldquo;{freelanceSubFilter}&rdquo;.</p>
                            <p className="text-slate-400">Post new services or update statuses to view them in this list.</p>
                          </div>
                        );
                      }

                      return filteredGigs.map(gig => {
                        const gUrl = getGigUrl(gig);
                        return (
                          <div key={gig.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-slate-50/70 transition-colors">
                            <div className="flex items-start sm:items-center gap-5">
                              <div className="relative w-32 h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                <img src={gig.image} alt={gig.title} className="w-full h-full object-cover" />
                                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  gig.status === 'published' ? 'bg-emerald-600 text-white' : 'bg-slate-900/80 text-white'
                                }`}>
                                  {gig.status === 'published' ? 'Active' : 'Paused'}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <a
                                  href={gUrl}
                                  onClick={(e) => navigate(gUrl, e)}
                                  className="text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline line-clamp-2 cursor-pointer"
                                >
                                  {gig.title}
                                </a>
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-fiverr-muted font-medium">
                                  <span>Last activity: 2 days ago</span>
                                  <span>·</span>
                                  <span className="text-yellow-500 font-bold">★ {gig.rating || 5.0} ({gig.reviewsCount || 0})</span>
                                  <span>·</span>
                                  <span>Price: ${gig.price}</span>
                                  <span>·</span>
                                  <span>♡ {gig.reviewsCount ? Math.floor(gig.reviewsCount / 2) : 0}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                              <div className="text-center sm:text-right">
                                <span className="text-lg font-bold text-fiverr-dark block leading-tight">
                                  {gig.featured ? '1' : '0'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sold</span>
                              </div>

                              <div className="relative">
                                <div className="inline-flex rounded-xl shadow-xs overflow-hidden border border-slate-300">
                                  <button
                                    onClick={() => handleFeatureUserGig(gig.id)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                                  >
                                    {gig.featured ? '★ FEATURED' : 'FEATURE IT'}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveFeatureDropdownGigId(activeFeatureDropdownGigId === gig.id ? null : gig.id);
                                    }}
                                    className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer flex items-center justify-center"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {activeFeatureDropdownGigId === gig.id && (
                                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-xs font-sans" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={async () => {
                                        setActiveFeatureDropdownGigId(null);
                                        const newStatus = gig.status === 'published' ? 'suspended' : 'published';
                                        setGigs(prev => prev.map(g => g.id === gig.id ? { ...g, status: newStatus } : g));
                                        try {
                                          await fetch(`/api/gigs/${gig.id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ status: newStatus })
                                          });
                                        } catch (e) {
                                          console.warn('Status patch error:', e);
                                        }
                                        try {
                                          await fetch(`/api/admin/gigs/${gig.id}/status`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ status: newStatus })
                                          });
                                        } catch (e) {
                                          // admin fallback
                                        }
                                        setDeleteSuccessToast(`Gig "${gig.title}" status changed to ${newStatus === 'published' ? 'Active' : 'Paused'}.`);
                                        setTimeout(() => setDeleteSuccessToast(null), 3000);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-fiverr-dark font-semibold cursor-pointer"
                                    >
                                      {gig.status === 'published' ? 'Pause' : 'Resume'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setActiveFeatureDropdownGigId(null);
                                        setViewingGig(gig);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-fiverr-dark font-semibold cursor-pointer"
                                    >
                                      View Progress
                                    </button>
                                    <button
                                      onClick={() => {
                                        setActiveFeatureDropdownGigId(null);
                                        handleOpenEditGigModal(gig);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-fiverr-dark font-semibold cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        setActiveFeatureDropdownGigId(null);
                                        handleDeleteGig(gig.id, gig.title);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-semibold border-t border-slate-100 cursor-pointer flex items-center gap-1.5"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              {/* Right Sidebar: MY ACTIVITY SUMMARY */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100">
                    My Activity Summary
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-fiverr-dark font-medium">
                      <span>Offers I posted</span>
                      <span className="font-bold text-fiverr-dark font-mono">{gigs.length + 600}</span>
                    </div>
                    <div className="flex items-center justify-between text-fiverr-dark font-medium">
                      <span>Active Offers</span>
                      <span className="font-bold text-emerald-600 font-mono">{gigs.filter(g => g.status === 'published').length}</span>
                    </div>
                    <div className="flex items-center justify-between text-fiverr-dark font-medium">
                      <span>Offers sold</span>
                      <span className="font-bold text-fiverr-dark font-mono">1,687</span>
                    </div>
                    <div className="flex items-center justify-between text-fiverr-dark font-medium pt-3 border-t border-slate-100">
                      <span className="font-bold text-fiverr-dark">Earnings</span>
                      <span className="font-bold text-emerald-600 font-mono text-sm">$136,828</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: FREELANCER TALENT DIRECTORY (/freelancers) */}
        {path === '/freelancers' && (
          <div className="max-w-6xl mx-auto space-y-8 font-sans">
            <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl">
              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30">
                  Verified Top Talent
                </span>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight text-fiverr-dark">Hire Expert Freelancers & Request Proposals</h1>
                <p className="text-fiverr-muted text-sm">Browse elite developers, designers, animators, and SEO specialists. Send direct proposal requests and start secure escrow workstreams.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usersList.filter(u => u.role !== 'admin').map(user => (
                <div key={user.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-xl transition-all">
                  <div className="flex items-center gap-4">
                    <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100" />
                    <div>
                      <h3 className="text-base font-bold text-fiverr-dark">{user.name}</h3>
                      <span className="text-xs text-fiverr-muted block">@{user.username || slugify(user.name)}</span>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{user.rating}</span>
                        <span className="text-slate-400 font-normal">({user.reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-fiverr-dark line-clamp-2">{user.title || user.bio || 'Verified Professional Freelancer'}</p>

                  <div className="flex flex-wrap gap-1">
                    {(user.skills || ['React', 'Node.js', 'UI/UX']).slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-fiverr-dark">{skill}</span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-fiverr-dark">${user.hourlyRate || 50}/hr</span>
                    <button
                      onClick={() => navigate(`/${slugify(user.name)}`)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                    >
                      Request Proposal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 1: GIGS EXPLORE MARKETPLACE */}
        {isGigsList && (
          <div>
            {/* Hero Banner */}
            <div className="relative rounded-3xl bg-slate-900 text-white p-8 md:p-12 mb-10 overflow-hidden shadow-xl">
              <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop')` }}></div>
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4 border border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4" /> 100% Escrow Protection Guaranteed
                </div>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-fiverr-dark text-wrap balance">
                  {currentCategory === 'All' ? 'Hire top freelance talent for fixed-price gigs' : `${currentCategory} Freelance Gigs`}
                </h1>
                <p className="text-fiverr-muted text-sm md:text-base leading-body mb-8">
                  Connect with elite developers, designers, and AI experts. Funds are safely held in escrow until you approve the deliverables.
                </p>

                {/* Search Bar */}
                <div className="flex items-center bg-white rounded-2xl p-2 shadow-lg max-w-xl">
                  <Search className="w-5 h-5 text-slate-400 ml-3" />
                  <input 
                    type="text" 
                    placeholder="Search services (e.g. React, UI/UX, Automation)..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-fiverr-dark placeholder:text-slate-400 focus:outline-none"
                  />
                  <button className="px-6 py-3 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Toolbar Bar */}
            <div className="relative flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 mb-8 shadow-xs">
              <div className="flex flex-wrap items-center gap-3">
                {/* Service Options Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === 'service' ? null : 'service')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-fiverr-dark hover:bg-slate-100 transition-colors"
                  >
                    <span>Service options {serviceOptionFilter !== 'All' ? `(${serviceOptionFilter})` : ''}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'service' ? 'rotate-270' : 'rotate-90'} text-slate-400`} />
                  </button>
                  {activeDropdown === 'service' && (
                    <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 space-y-1">
                      {['All', 'Development & IT', 'AI & Data', 'Design & Creative', 'Mobile Apps'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => { setServiceOptionFilter(opt); setActiveDropdown(null); }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-xl font-medium transition-colors ${serviceOptionFilter === opt ? 'bg-slate-900 text-white' : 'text-fiverr-dark hover:bg-slate-100'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Seller Details Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === 'seller' ? null : 'seller')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-fiverr-dark hover:bg-slate-100 transition-colors"
                  >
                    <span>Seller details {sellerLevelFilter !== 'All' ? `(${sellerLevelFilter})` : ''}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'seller' ? 'rotate-270' : 'rotate-90'} text-slate-400`} />
                  </button>
                  {activeDropdown === 'seller' && (
                    <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 space-y-1">
                      {['All', 'Top Rated', 'Level 2', 'Level 1'].map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => { setSellerLevelFilter(lvl); setActiveDropdown(null); }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-xl font-medium transition-colors ${sellerLevelFilter === lvl ? 'bg-slate-900 text-white' : 'text-fiverr-dark hover:bg-slate-100'}`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Budget Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === 'budget' ? null : 'budget')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-fiverr-dark hover:bg-slate-100 transition-colors"
                  >
                    <span>Budget {budgetFilter !== 'All' ? `(${budgetFilter})` : ''}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'budget' ? 'rotate-270' : 'rotate-90'} text-slate-400`} />
                  </button>
                  {activeDropdown === 'budget' && (
                    <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 space-y-1">
                      {[
                        { label: 'Any Budget', value: 'All' },
                        { label: 'Under $500', value: 'under_500' },
                        { label: '$500 - $1,000', value: '500_1000' },
                        { label: '$1,000+', value: '1000_plus' },
                      ].map(b => (
                        <button
                          key={b.value}
                          onClick={() => { setBudgetFilter(b.value); setActiveDropdown(null); }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-xl font-medium transition-colors ${budgetFilter === b.value ? 'bg-slate-900 text-white' : 'text-fiverr-dark hover:bg-slate-100'}`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delivery Time Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === 'delivery' ? null : 'delivery')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-fiverr-dark hover:bg-slate-100 transition-colors"
                  >
                    <span>Delivery time {deliveryTimeFilter !== null ? `(≤ ${deliveryTimeFilter}d)` : ''}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'delivery' ? 'rotate-270' : 'rotate-90'} text-slate-400`} />
                  </button>
                  {activeDropdown === 'delivery' && (
                    <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 space-y-1">
                      {[
                        { label: 'Any Delivery Time', value: null },
                        { label: 'Up to 3 Days', value: 3 },
                        { label: 'Up to 5 Days', value: 5 },
                        { label: 'Up to 10 Days', value: 10 },
                      ].map(d => (
                        <button
                          key={String(d.value)}
                          onClick={() => { setDeliveryTimeFilter(d.value); setActiveDropdown(null); }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-xl font-medium transition-colors ${deliveryTimeFilter === d.value ? 'bg-slate-900 text-white' : 'text-fiverr-dark hover:bg-slate-100'}`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-fiverr-dark">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={onlineNowOnly}
                    onChange={(e) => setOnlineNowOnly(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                  />
                  <span>Online now</span>
                </label>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setGigViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${gigViewMode === 'grid' ? 'bg-white text-fiverr-dark shadow-xs font-bold' : 'text-fiverr-muted hover:text-fiverr-dark'}`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setGigViewMode('list')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${gigViewMode === 'list' ? 'bg-white text-fiverr-dark shadow-xs font-bold' : 'text-fiverr-muted hover:text-fiverr-dark'}`}
                    title="Listicle View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Categories Filter Tabs with Search-Engine-Friendly URLs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
              {['All', 'Development & IT', 'AI & Data', 'Design & Creative', 'Mobile Apps'].map(catName => {
                const slug = CATEGORY_SLUGS[catName];
                const catUrl = slug === 'all' ? '/' : `/categories/${slug}`;
                const isActive = currentCategory === catName;
                return (
                  <a
                    key={catName}
                    href={catUrl}
                    onClick={(e) => navigate(catUrl, e)}
                    className={`px-4 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${isActive ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-fiverr-dark hover:bg-slate-100 border border-slate-200'}`}
                  >
                    {catName}
                  </a>
                );
              })}
            </div>

            {/* Gigs Grid or Listicle View */}
            {gigViewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredGigs.map(gig => (
                  <div 
                    key={gig.id} 
                    onClick={(e) => navigate(getGigUrl(gig), e)}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                  >
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      <img 
                        src={gig.image} 
                        alt={gig.title} 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <button 
                        onClick={(e) => handleToggleLike(gig.id, e)}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transition-all shadow-sm cursor-pointer ${
                          likedGigIds.includes(gig.id) ? 'text-red-500 bg-white font-bold' : 'text-fiverr-dark hover:text-red-500 hover:bg-white'
                        }`}
                        title={likedGigIds.includes(gig.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        <Heart className={`w-4 h-4 ${likedGigIds.includes(gig.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Seller info row */}
                        <a 
                          href={`/${slugify(gig.freelancerName)}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/${slugify(gig.freelancerName)}`, e);
                          }}
                          className="flex items-center gap-2.5 mb-2.5 group/seller"
                        >
                          <img src={gig.freelancerAvatar} alt={gig.freelancerName} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-fiverr-dark group-hover/seller:underline">{gig.freelancerName}</span>
                            </div>
                            <span className="text-xs text-fiverr-muted font-medium">{gig.freelancerLevel || 'Top Rated'}</span>
                          </div>
                        </a>

                        <h3 className="text-gig-title font-semibold text-fiverr-dark line-clamp-2 group-hover:text-emerald-600 transition-colors mb-3 leading-gig">
                          <a
                            href={getGigUrl(gig)}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(getGigUrl(gig), e);
                            }}
                            className="hover:text-emerald-600 transition-colors"
                          >
                            {gig.title}
                          </a>
                        </h3>
                      </div>

                      <div>
                        {/* Rating */}
                        <div className="flex items-center gap-1 text-sm font-bold text-fiverr-dark mb-3">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span>{gig.rating}</span>
                          <span className="text-slate-400 font-normal">({gig.reviewsCount > 999 ? (gig.reviewsCount/1000).toFixed(1) + 'k' : gig.reviewsCount})</span>
                        </div>

                        {/* Price */}
                         <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs uppercase font-normal text-fiverr-muted">Starting at</span>
                          <span className="text-xl font-bold text-fiverr-dark">${gig.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGigs.map(gig => (
                  <div 
                    key={gig.id} 
                    onClick={(e) => navigate(getGigUrl(gig), e)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl transition-all flex flex-col md:flex-row items-center justify-between gap-6 group cursor-pointer"
                  >
                    <div className="flex items-center gap-5 w-full md:w-auto">
                      <div className="relative w-44 h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src={gig.image} alt={gig.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <button 
                          onClick={(e) => handleToggleLike(gig.id, e)}
                          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center transition-all shadow-sm ${likedGigIds.includes(gig.id) ? 'text-red-500 bg-white' : 'text-fiverr-dark hover:text-red-500'}`}
                          title={likedGigIds.includes(gig.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${likedGigIds.includes(gig.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-fiverr-dark uppercase tracking-wider">{gig.category}</span>
                          <span className="text-xs text-fiverr-muted flex items-center gap-1 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {gig.rating} ({gig.reviewsCount} reviews)
                          </span>
                        </div>
                        <h3 className="text-gig-title font-semibold text-fiverr-dark group-hover:text-emerald-600 transition-colors leading-gig line-clamp-2">
                          {gig.title}
                        </h3>
                        <div className="flex items-center gap-2.5 text-xs text-fiverr-muted">
                          <img src={gig.freelancerAvatar} alt={gig.freelancerName} className="w-6 h-6 rounded-full object-cover" />
                          <span className="font-semibold text-slate-800">{gig.freelancerName}</span>
                          <span className="text-slate-300">•</span>
                          <span>Delivery in {gig.deliveryDays} days</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <span className="text-xs font-normal uppercase tracking-wider text-fiverr-muted block">Starting at</span>
                        <span className="text-2xl font-bold text-fiverr-dark">${gig.price}</span>
                      </div>
                      <a 
                        href={getGigUrl(gig)}
                        onClick={(e) => { e.stopPropagation(); navigate(getGigUrl(gig), e); }}
                        className="px-6 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        View Gig
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: GIG INNER DETAIL PAGE (Fiverr URL Format: /:username/:slug) */}
        {isGigDetail && currentGig && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-fiverr-muted font-medium">
              <a href="/gigs" onClick={(e) => navigate('/gigs', e)} className="hover:text-fiverr-dark">Home</a>
              <span>/</span>
              <a href={`/categories/${CATEGORY_SLUGS[currentGig.category] || 'development-it'}`} onClick={(e) => navigate(`/categories/${CATEGORY_SLUGS[currentGig.category] || 'development-it'}`, e)} className="hover:text-fiverr-dark">
                {currentGig.category}
              </a>
              <span>/</span>
              <span className="text-fiverr-dark font-semibold truncate max-w-xs">{currentGig.subcategory || 'Services'}</span>
            </div>

            {/* Title & Seller Header */}
            <div>
              <h1 className="text-3xl font-bold text-fiverr-dark tracking-tight leading-tight mb-4">
                {currentGig.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <img src={currentGig.freelancerAvatar} alt={currentGig.freelancerName} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" />
                  <div>
                    <span className="font-bold text-fiverr-dark block">{currentGig.freelancerName}</span>
                    <span className="text-fiverr-muted font-mono">@{currentGig.freelancerUsername || slugify(currentGig.freelancerName)}</span>
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                <div className="flex items-center gap-1 font-bold text-fiverr-dark">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{currentGig.rating}</span>
                  <span className="text-slate-400 font-normal">({currentGig.reviewsCount.toLocaleString()} reviews)</span>
                </div>

                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md text-[11px]">
                  {currentGig.freelancerLevel || 'Top Rated Seller'}
                </span>

                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold px-2.5 py-1 rounded-md text-[11px]">
                  3 orders in queue
                </span>
              </div>
            </div>

            {/* Main Content Grid: Gallery & Description Left, Package Box Right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* LEFT COLUMN: Gallery & Details */}
              <div className="lg:col-span-2 space-y-8">
                {/* Main Media Preview: Interactive Promotional Explainer Video Player */}
                <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl relative group">
                  {isPuppetVideoPlaying ? (
                    <div className="relative aspect-video bg-black flex flex-col items-center justify-center text-white p-6">
                      <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1200&h=700&fit=crop')` }}></div>
                      <div className="relative z-10 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-600/90 text-white flex items-center justify-center mx-auto shadow-lg animate-pulse">
                          <Sparkles className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight">Playing Promotional Explainer Video (1080p HD)</h3>
                        <p className="text-xs text-slate-300 max-w-md mx-auto">Custom puppet character rigging, professional voiceover, and dynamic motion graphics.</p>
                        
                        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center gap-4 mt-6">
                          <button onClick={() => setIsPuppetVideoPlaying(false)} className="px-3 py-1 bg-white text-fiverr-dark font-bold rounded-lg text-xs hover:bg-slate-100 cursor-pointer">Pause</button>
                          <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="w-3/5 h-full bg-emerald-500 animate-pulse"></div>
                          </div>
                          <span className="text-[10px] font-mono">01:14 / 02:00</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-slate-900 flex items-center justify-center group cursor-pointer" onClick={() => setIsPuppetVideoPlaying(true)}>
                      <img 
                        src={currentGig.image} 
                        alt={currentGig.title} 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&h=500&fit=crop';
                        }}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-between p-6">
                        <div className="flex items-center justify-between">
                          <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                            🎬 Promotional Explainer Video
                          </span>
                          <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-1 rounded-lg">02:00 HD</span>
                        </div>

                        <div className="text-center">
                          <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform mb-3 border-4 border-white/20">
                            <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                          <span className="text-white font-bold text-sm drop-shadow-md">Click to Play Promotional Explainer Video</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
                          <span>Directed by {currentGig.freelancerName}</span>
                          <span>Puppet Animation & Character Rigging</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* About This Gig */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4">
                  <h2 className="text-xl font-bold text-fiverr-dark border-b border-slate-100 pb-3">About This Gig</h2>
                  <p className="text-base text-fiverr-dark leading-body whitespace-pre-line font-normal">
                    {currentGig.description}
                  </p>

                  <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs text-fiverr-dark">
                    <div>
                      <span className="font-bold text-fiverr-dark block mb-1">Service Category</span>
                      <span>{currentGig.category}</span>
                    </div>
                    <div>
                      <span className="font-bold text-fiverr-dark block mb-1">Subcategory</span>
                      <span>{currentGig.subcategory || 'General'}</span>
                    </div>
                  </div>
                </div>

                {/* About The Seller */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
                  <h2 className="text-xl font-bold text-fiverr-dark border-b border-slate-100 pb-3">About The Seller</h2>
                  
                  <div className="flex items-center gap-4">
                    <img src={currentGig.freelancerAvatar} alt={currentGig.freelancerName} className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-100" />
                    <div>
                      <h3 className="text-base font-bold text-fiverr-dark">{currentGig.freelancerName}</h3>
                      <p className="text-xs text-fiverr-muted font-mono">@{currentGig.freelancerUsername || slugify(currentGig.freelancerName)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500" /> {currentGig.rating}
                        </span>
                        <span className="text-xs text-slate-400">({currentGig.reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1">From</span>
                      <span className="font-bold text-slate-800">United States</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Member since</span>
                      <span className="font-bold text-slate-800">Jan 2024</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Avg. response time</span>
                      <span className="font-bold text-slate-800">1 hour</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Last delivery</span>
                      <span className="font-bold text-slate-800">about 2 hours</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleContactSeller(currentGig.freelancerId, currentGig.freelancerName, currentGig.title)}
                    className="w-full sm:w-auto px-6 py-2.5 border-2 border-slate-900 text-fiverr-dark font-bold rounded-xl text-xs hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Contact Seller ({currentGig.freelancerName})</span>
                  </button>
                </div>

              </div>

              {/* RIGHT COLUMN: Simple Order Box with Optional Extras */}
              <div className="lg:col-span-1 sticky top-24">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 space-y-6">
                  {(() => {
                    const extrasList = currentGig.extras || [];
                    const selectedExtrasObjects = extrasList.filter(e => selectedExtras.includes(e.id));
                    const extrasTotalUSD = selectedExtrasObjects.reduce((sum, e) => sum + e.price, 0);
                    const totalUSD = currentGig.price + extrasTotalUSD;
                    const totalINR = totalUSD * 83;

                    return (
                      <>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                          <div>
                            <span className="text-xs font-normal text-fiverr-muted uppercase tracking-wider block">Gig Base Price</span>
                            <span className="text-2xl font-bold text-fiverr-dark">₹{(currentGig.price * 83).toLocaleString()}</span>
                          </div>
                          <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
                            ${currentGig.price} USD
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs font-bold text-fiverr-dark">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-fiverr-muted" />
                            <span>{currentGig.deliveryDays} Days Delivery</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <RefreshCw className="w-4 h-4 text-fiverr-muted" />
                            <span>Unlimited Revisions</span>
                          </div>
                        </div>

                        {/* Optional Gig Extras Section */}
                        {extrasList.length > 0 && (
                          <div className="space-y-3 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-fiverr-dark uppercase tracking-wider">
                              Upgrade Your Order with Extras:
                            </h4>
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {extrasList.map(extra => {
                                const isChecked = selectedExtras.includes(extra.id);
                                return (
                                  <label 
                                    key={extra.id} 
                                    className={`flex items-start gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition-all ${isChecked ? 'bg-emerald-50/60 border-emerald-300 text-fiverr-dark font-semibold' : 'bg-slate-50 border-slate-200 text-fiverr-dark hover:bg-slate-100'}`}
                                  >
                                    <input 
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedExtras(prev => [...prev, extra.id]);
                                        } else {
                                          setSelectedExtras(prev => prev.filter(id => id !== extra.id));
                                        }
                                      }}
                                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 shrink-0"
                                    />
                                    <div className="flex-1 flex items-center justify-between gap-2">
                                      <span>{extra.title}</span>
                                      <span className="font-bold text-fiverr-dark shrink-0">+₹{(extra.price * 83).toLocaleString()}</span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Total Summary */}
                         <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-fiverr-muted block font-normal">Total Escrow Amount</span>
                            {selectedExtras.length > 0 && (
                              <span className="text-xs text-emerald-600 font-bold block">Includes {selectedExtras.length} selected extra(s)</span>
                            )}
                          </div>
                          <span className="text-2xl font-bold text-fiverr-dark">₹{totalINR.toLocaleString()}</span>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-3 flex items-start gap-2.5 text-[11px] text-emerald-900">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>100% Escrow Protection. Funds are safely held until work is delivered and approved.</span>
                        </div>

                        <button 
                          onClick={() => handleCreateOrder(
                            `${currentGig.title}${selectedExtrasObjects.length > 0 ? ` (with ${selectedExtrasObjects.length} extra add-ons)` : ''}`, 
                            totalUSD, 
                            currentGig.freelancerId
                          )}
                          className="w-full py-4 bg-emerald-500 text-slate-950 font-bold rounded-2xl hover:bg-emerald-400 transition-colors shadow-md text-xs flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Fund ₹{totalINR.toLocaleString()} in Escrow & Order Now</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 3: BUYER REQUESTS / PROJECTS LIST */}
        {isProjectsList && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-fiverr-dark">Buyer Project Requests</h1>
                <p className="text-sm text-fiverr-muted">Browse open client projects and submit custom proposals.</p>
              </div>
              <a 
                href="/post-project"
                onClick={(e) => navigate('/post-project', e)}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Post New Project</span>
              </a>
            </div>

            <div className="space-y-4">
              {projects.map(proj => (
                <div key={proj.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <img src={proj.buyerAvatar} alt={proj.buyerName} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <span className="text-xs font-semibold text-fiverr-dark block">{proj.buyerName}</span>
                        <span className="text-[11px] text-slate-400">Posted {proj.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-medium">Budget</span>
                        <span className="text-sm font-bold text-fiverr-dark">${proj.budgetMin} - ${proj.budgetMax}</span>
                      </div>
                      <a 
                        href={`/projects/${proj.id}`}
                        onClick={(e) => navigate(`/projects/${proj.id}`, e)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-colors shadow-xs"
                      >
                        Submit Proposal
                      </a>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-fiverr-dark mb-2">{proj.title}</h3>
                  <p className="text-sm text-fiverr-dark mb-4 line-clamp-2">{proj.description}</p>

                  <div className="flex items-center gap-4 text-xs text-fiverr-muted pt-3 border-t border-slate-100">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium text-fiverr-dark">{proj.category}</span>
                    <span>·</span>
                    <span>{proj.proposalsCount} proposals submitted</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: PROJECT PROPOSAL PAGE (Clean URL /projects/:id) */}
        {isProjectDetail && currentProject && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <a href="/projects" onClick={(e) => navigate('/projects', e)} className="inline-flex items-center gap-2 text-xs font-semibold text-fiverr-dark hover:text-fiverr-dark mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Buyer Requests
            </a>

            <div className="mb-6">
              <span className="text-xs font-semibold text-emerald-600 block mb-1">Project Proposal</span>
              <h1 className="text-xl font-bold text-fiverr-dark mb-2">{currentProject.title}</h1>
              <p className="text-sm text-fiverr-dark">{currentProject.description}</p>
            </div>

            <form onSubmit={(e) => handleSubmitProposal(e, currentProject.id)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-2">Your Bid ($)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1200"
                    value={proposalBid}
                    onChange={(e) => setProposalBid(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-2">Delivery (Days)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 14"
                    value={proposalDays}
                    onChange={(e) => setProposalDays(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-fiverr-dark uppercase tracking-wider">Cover Letter</label>
                  <button 
                    type="button"
                    onClick={() => handleGenerateAIProposal(currentProject.title, currentProject.description)}
                    disabled={isGeneratingAIProposal}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors border border-emerald-200"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Cover Letter</span>
                  </button>
                </div>
                <textarea 
                  rows={6}
                  placeholder="Explain why you are the best fit for this project..."
                  value={proposalCover}
                  onChange={(e) => setProposalCover(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <button type="submit" className="w-full py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-sm shadow-md">
                Submit Proposal to Buyer
              </button>
            </form>
          </div>
        )}

        {/* VIEW 5: MY ORDERS & ESCROW (/orders) */}
        {isOrders && (
          (!currentUser && !impersonatedUser) ? (
            <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
              <Shield className="w-12 h-12 text-slate-400 mx-auto" />
              <h2 className="text-xl font-bold text-fiverr-dark">Sign in to Access Your Orders</h2>
              <p className="text-xs text-fiverr-muted">Track project milestones, real-time workstream messages, and escrow releases.</p>
              <button 
                onClick={() => setIsLoginModalOpen(true)} 
                className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                Sign In to WorkPerHour
              </button>
            </div>
          ) : (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-fiverr-dark">Active Orders & Escrow Vault</h1>
              <p className="text-sm text-fiverr-muted">Track milestones, secure escrow funds, and deliver completed work.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-3">
                {orders.map(ord => (
                  <div 
                    key={ord.id}
                    onClick={() => { setSelectedOrder(ord); fetchMessages(ord.id); }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${selectedOrder?.id === ord.id ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${selectedOrder?.id === ord.id ? 'bg-emerald-400 text-fiverr-dark' : 'bg-emerald-50 text-emerald-700'}`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-sm font-bold ${selectedOrder?.id === ord.id ? 'text-emerald-400' : 'text-fiverr-dark'}`}>${ord.amount}</span>
                    </div>
                    <h4 className="text-sm font-bold mb-3 line-clamp-1">{ord.title}</h4>
                    <div className={`flex items-center justify-between text-xs ${selectedOrder?.id === ord.id ? 'text-slate-300' : 'text-fiverr-muted'}`}>
                      <span>Due: {ord.dueDate}</span>
                      <span>Order #{ord.id}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                {selectedOrder ? (
                  <div>
                    <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                      <div>
                        <span className="text-xs font-semibold text-emerald-600 block mb-1">Escrow Secured</span>
                        <h2 className="text-xl font-bold text-fiverr-dark">{selectedOrder.title}</h2>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-medium">Total Amount</span>
                        <span className="text-xl font-bold text-fiverr-dark">${selectedOrder.amount}</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-4 mb-6 flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-900">
                        <span className="font-bold block mb-1">WorkPerHour Escrow Protection Active</span>
                        Funds are safely locked in escrow and will only be released to the seller once milestones are successfully delivered and approved.
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <h3 className="text-xs font-bold text-fiverr-dark uppercase tracking-wider">Project Requirements</h3>
                      <p className="text-sm text-fiverr-dark bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                        {selectedOrder.requirements || 'No specific requirements notes provided.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <a 
                        href="/messages"
                        onClick={(e) => navigate('/messages', e)}
                        className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span>Open Workstream</span>
                      </a>
                      <button 
                        onClick={() => {
                          setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'completed' } : o));
                          alert('Milestone approved and escrow funds released to seller!');
                        }}
                        className="px-5 py-2.5 text-xs font-semibold text-fiverr-dark bg-emerald-400 rounded-xl hover:bg-emerald-300 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Release Escrow</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400">Select an order to view escrow details.</div>
                )}
              </div>
            </div>
          </div>
          )
        )}
        
        {/* VIEW 6: PEOPLEPERHOUR STYLE "MY WORKSTREAMS" & SELLER PROFILES (/messages) */}
        {isMessages && (
          <div className="bg-slate-50 min-h-[750px] font-sans">
            <div className={`grid grid-cols-1 ${messageOrderId ? 'lg:grid-cols-1' : 'lg:grid-cols-4'} gap-6`}>
            {/* LEFT SIDEBAR: WORKSTREAM FILTERS, PROJECTS & MY PEOPLE */}
            {!messageOrderId && (
              <div className="space-y-6 lg:col-span-1">
              {/* WORKSTREAM FILTERS */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-3">Workstream Filters</h3>
                {[
                  { id: 'all', label: 'All Workstreams', count: orders.length },
                  { id: 'inbox', label: 'Inbox', count: 0 },
                  { id: 'discussion', label: 'In Discussion', count: orders.filter(o => o.status === 'in_progress').length },
                  { id: 'in_progress', label: 'Work in Progress', count: orders.filter(o => o.status === 'in_progress').length },
                  { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length },
                  { id: 'starred', label: 'Starred', count: starredWorkstreams.length },
                  { id: 'escrow', label: 'With Escrow', count: orders.length },
                  { id: 'archived', label: 'Archived', count: 0 },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setWorkstreamTab(tab.id as any)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      workstreamTab === tab.id ? 'bg-slate-900 text-white font-bold' : 'text-fiverr-dark hover:bg-slate-100'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${workstreamTab === tab.id ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-fiverr-muted'}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* PROJECTS SECTION */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">Projects</h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs">
                  {projects.slice(0, 10).map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => setWorkstreamSearch(p.title)}
                      className={`px-2 py-1.5 rounded-lg hover:bg-slate-50 text-fiverr-dark truncate cursor-pointer font-medium border border-transparent ${workstreamSearch === p.title ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''}`} 
                      title={p.title}
                    >
                      • {p.title}
                    </div>
                  ))}
                </div>
              </div>

              {/* MY PEOPLE / SELLER PROFILES SECTION */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">My People</h3>
                  <span className="text-[10px] font-bold text-emerald-600 font-mono">8 Active</span>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    type="text"
                    placeholder="Search People..."
                    value={peopleSearch}
                    onChange={(e) => setPeopleSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-fiverr-dark focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pt-1">
                  {usersList
                    .filter(u => u.id !== currentUser?.id)
                    .filter(p => !peopleSearch || p.name.toLowerCase().includes(peopleSearch.toLowerCase()))
                    .slice(0, 10)
                    .map((person, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedPersonFilter(selectedPersonFilter === person.id ? null : person.id)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${selectedPersonFilter === person.id ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={person.avatar} className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200" />
                          <div>
                            <div className="flex items-center gap-1 text-xs font-bold text-fiverr-dark">
                              <span>{person.name}</span>
                              <span>{person.id === 'user_1' ? '🇷🇺' : '🇬🇧'}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase">{person.role}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-fiverr-dark px-1.5 py-0.5 rounded-full">
                          {orders.filter(o => o.sellerId === person.id || o.buyerId === person.id).length || 1}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            )}

            {/* MAIN CONTENT AREA: MY WORKSTREAMS TABLE & CHAT WORKSPACE */}
            <div className={`${messageOrderId ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-6`}>
              {/* HEADER & CONTROLS */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {messageOrderId && (
                      <button 
                        onClick={() => navigate('/messages')}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        title="Back to All Workstreams"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    )}
                    <h1 className="text-xl font-bold text-fiverr-dark tracking-tight">
                      {messageOrderId ? 'Workstream Collaboration' : 'My Workstreams'}
                    </h1>
                  </div>
                  <p className="text-xs text-fiverr-muted">
                    {messageOrderId ? 'Direct communication and milestone tracking for this project.' : 'Manage active collaborations, deliverables, client discussions, and secure escrow accounts.'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setSelectedPersonFilter(null); setWorkstreamSearch(''); }}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 text-fiverr-dark rounded-xl border border-slate-200 transition-colors"
                    title="Reset Filters"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => setIsStartWorkstreamModalOpen(true)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors whitespace-nowrap"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>START NEW WORKSTREAM</span>
                  </button>
                </div>
              </div>

              {!messageOrderId && (
                <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex items-center gap-3">
                  <Search className="w-4 h-4 text-slate-400 ml-2" />
                  <input 
                    type="text"
                    placeholder="Type and hit enter to search workstreams..."
                    value={workstreamSearch}
                    onChange={(e) => setWorkstreamSearch(e.target.value)}
                    className="w-full bg-transparent text-xs text-fiverr-dark placeholder-slate-400 focus:outline-none"
                  />
                </div>
              )}

              {!messageOrderId && (
                <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-fiverr-muted">
                          <th className="py-3 px-4 w-10">
                            <input type="checkbox" className="rounded border-slate-300 text-emerald-600" />
                          </th>
                          <th className="py-3 px-2 w-10">★</th>
                          <th className="py-3 px-4">Contact / Partner</th>
                          <th className="py-3 px-4">Workstream Title & Preview</th>
                          <th className="py-3 px-4">Status & Escrow</th>
                          <th className="py-3 px-4 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-fiverr-dark">
                        {hydratedWorkstreams.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-10 text-fiverr-muted">You have no active workstreams right now.</td>
                          </tr>
                        ) : (
                          hydratedWorkstreams.map(w => {
                            const isStarred = starredWorkstreams.includes(w.id);
                            const isSelected = selectedOrder?.id === w.id;
                            return (
                              <tr 
                                key={w.id}
                                onClick={() => navigate('/messages/' + w.id)}
                                className={`hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50/50' : ''}`}
                              >
                                <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                                  <input type="checkbox" className="rounded border-slate-300 text-emerald-600" />
                                </td>
                                <td className="py-4 px-2" onClick={(e) => {
                                  e.stopPropagation();
                                  setStarredWorkstreams(prev => isStarred ? prev.filter(id => id !== w.id) : [...prev, w.id]);
                                }}>
                                  <span className={`cursor-pointer text-sm ${isStarred ? 'text-yellow-500 font-bold' : 'text-slate-300 hover:text-yellow-400'}`}>
                                    ★
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <img 
                                      src={w.seller?.avatar || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop'} 
                                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0" 
                                    />
                                    <div>
                                      <div className="flex items-center gap-1 font-bold text-fiverr-dark">
                                        <span>{w.seller?.name || 'Partner'}</span>
                                      </div>
                                      <span className="text-[10px] text-slate-400">Order #{w.id}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <span className="font-bold text-fiverr-dark block hover:text-emerald-600 transition-colors cursor-pointer">
                                    {w.title}
                                  </span>
                                  <span className="text-[11px] text-fiverr-muted truncate max-w-xs block mt-0.5">
                                    {w.gig?.title || 'Gig details unavailable.'}
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="space-y-1">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-fiverr-dark`}>
                                      {w.status.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                                  -
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SPLIT / ACTIVE CHAT DRAWER IF ORDER SELECTED */}
              {selectedOrder && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* MAIN CONTENT: ACTIVITY/FILES (COL 1-3) */}
                  <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden flex flex-col h-[750px]">
                      {/* TABS HEADER */}
                      <div className="flex border-b border-slate-100 bg-slate-50 px-6 py-2 items-center justify-between">
                         <div className="flex gap-4">
                           {(['activity', 'files'] as const).map(tab => (
                             <button 
                               key={tab}
                               onClick={() => setActiveWorkstreamSubTab(tab)}
                               className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeWorkstreamSubTab === tab ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                             >
                               {tab === 'activity' ? 'Activity Stream' : 'Shared Files'}
                             </button>
                           ))}
                         </div>
                         <div className="flex items-center gap-2">
                            {messageOrderId && (
                              <button 
                                onClick={() => navigate('/messages')}
                                className="mr-4 p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                                title="Back to All Workstreams"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${selectedOrder.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                              {selectedOrder.status.replace(/_/g, ' ')}
                            </span>
                            {!messageOrderId && (
                              <button 
                                onClick={() => setSelectedOrder(null)}
                                className="ml-2 p-1 text-slate-400 hover:text-slate-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                         </div>
                      </div>

                      {/* TAB CONTENT */}
                      <div className="flex-1 overflow-hidden relative flex flex-col">
                         {activeWorkstreamSubTab === 'activity' ? (
                           <>
                             <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                               {messages.length === 0 && (
                                 <div className="text-center py-20 text-slate-400 text-xs flex flex-col items-center gap-3">
                                    <MessageSquare className="w-12 h-12 opacity-20" />
                                    <p>No activity yet. Send a message to start collaboration.</p>
                                 </div>
                               )}
                               {messages.map(msg => (
                                 <div key={msg.id} className="flex gap-4 group">
                                    {msg.type === 'system' ? (
                                      <div className="w-full flex items-center gap-3 py-2.5 px-4 bg-slate-100/50 rounded-xl border border-slate-200 text-slate-500 italic text-[11px]">
                                         <Activity className="w-3.5 h-3.5" />
                                         <span>{msg.text}</span>
                                         <span className="ml-auto text-[10px] opacity-60 font-mono">{msg.timestamp}</span>
                                      </div>
                                    ) : (
                                      <>
                                        <img src={usersList.find(u => u.id === msg.senderId)?.avatar || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop'} className="w-9 h-9 rounded-full object-cover ring-2 ring-white shrink-0 shadow-xs" />
                                        <div className="flex-1">
                                           <div className="flex items-center gap-2 mb-1">
                                             <span className="text-xs font-bold text-fiverr-dark">{msg.senderName}</span>
                                             <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                                           </div>
                                           <div className={`p-4 rounded-2xl text-xs max-w-2xl ${msg.senderId === (currentUser?.id || impersonatedUser?.id) ? 'bg-slate-900 text-white ml-auto' : 'bg-white text-fiverr-dark border border-slate-200 shadow-xs'}`}>
                                             {msg.type === 'file' ? (
                                               <div className={`flex items-center gap-3 p-3 rounded-xl border ${msg.senderId === (currentUser?.id || impersonatedUser?.id) ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-200'}`}>
                                                 <div className="p-2 bg-emerald-500 rounded-lg text-white">
                                                    <FileText className="w-4 h-4" />
                                                 </div>
                                                 <div className="flex-1 min-w-0">
                                                    <div className="font-bold truncate">{msg.fileInfo?.name}</div>
                                                    <div className="text-[10px] opacity-70">{msg.fileInfo?.size}</div>
                                                 </div>
                                                 <button className={`p-1.5 rounded-lg transition ${msg.senderId === (currentUser?.id || impersonatedUser?.id) ? 'hover:bg-white/20' : 'hover:bg-slate-200'}`}>
                                                    <ArrowRight className="w-4 h-4 rotate-90" />
                                                 </button>
                                               </div>
                                             ) : msg.text}
                                           </div>
                                        </div>
                                      </>
                                    )}
                                 </div>
                               ))}
                             </div>
                             {/* CHAT INPUT AREA */}
                             <div className="p-6 bg-white border-t border-slate-100">
                                <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                                   <textarea 
                                      placeholder="Type your message, send a proposal, or upload deliverables..."
                                      value={newMessageText}
                                      onChange={(e) => setNewMessageText(e.target.value)}
                                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-fiverr-dark focus:outline-none focus:border-emerald-500 min-h-[100px] resize-none"
                                   />
                                   <div className="flex items-center justify-between">
                                      <div className="flex gap-2">
                                         <button type="button" onClick={() => handleAttachMockFile()} className="p-2.5 hover:bg-slate-100 text-slate-500 rounded-xl transition" title="Attach Files">
                                            <Paperclip className="w-4.5 h-4.5" />
                                         </button>
                                         <button type="button" className="p-2.5 hover:bg-slate-100 text-slate-500 rounded-xl transition" title="Add Emoji">
                                            <Sparkles className="w-4.5 h-4.5" />
                                         </button>
                                      </div>
                                      <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 flex items-center gap-2 shadow-xs transition">
                                         <Send className="w-3.5 h-3.5" />
                                         <span>POST MESSAGE</span>
                                      </button>
                                   </div>
                                </form>
                             </div>
                           </>
                         ) : (
                           <div className="p-8 space-y-6 overflow-y-auto h-full bg-slate-50/20">
                              <div className="flex items-center justify-between">
                                 <div>
                                    <h3 className="text-sm font-bold text-fiverr-dark uppercase tracking-tight">Shared Files History</h3>
                                    <p className="text-[10px] text-slate-400 mt-1">All documents, designs, and assets shared in this workstream.</p>
                                 </div>
                                 <button onClick={() => handleAttachMockFile()} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition">
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    <span>UPLOAD NEW FILE</span>
                                 </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {messages.filter(m => m.type === 'file').map(m => (
                                   <div key={m.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 hover:border-emerald-300 transition cursor-pointer group shadow-xs">
                                      <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition">
                                         <FileCode className="w-6 h-6" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                         <div className="font-bold text-xs text-fiverr-dark truncate">{m.fileInfo?.name}</div>
                                         <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{m.fileInfo?.size} • {m.timestamp}</div>
                                      </div>
                                      <button className="p-2 text-slate-300 hover:text-emerald-600">
                                         <ArrowRight className="w-4 h-4 rotate-90" />
                                      </button>
                                   </div>
                                 ))}
                                 {messages.filter(m => m.type === 'file').length === 0 && (
                                   <div className="col-span-full py-20 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                                      <FileText className="w-16 h-16 opacity-10" />
                                      <p className="font-medium">No files have been shared in this workstream yet.</p>
                                   </div>
                                 )}
                              </div>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>

                  {/* SIDEBAR: ORDER DETAILS & ACTIONS (COL 4) */}
                  <div className="space-y-6">
                     {/* ORDER DETAILS CARD */}
                     <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
                        <div className="flex items-center gap-3">
                           <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                              <Briefcase className="w-5 h-5" />
                           </div>
                           <div>
                              <h4 className="text-xs font-bold text-fiverr-dark leading-tight uppercase tracking-wide">Workstream Summary</h4>
                              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Order #{selectedOrder.id}</div>
                           </div>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-slate-100">
                           <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Escrow Protected</span>
                              <span className="font-bold text-emerald-600 font-mono">${selectedOrder.amount}</span>
                           </div>
                           <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Created At</span>
                              <span className="font-bold text-fiverr-dark font-mono">{selectedOrder.createdAt}</span>
                           </div>
                           <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Delivery Due</span>
                              <span className="font-bold text-orange-600 font-mono">{selectedOrder.dueDate}</span>
                           </div>
                        </div>

                        <div className="pt-2">
                           <h5 className="text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Requirements</h5>
                           <p className="text-[11px] text-fiverr-dark leading-relaxed italic border-l-2 border-slate-200 pl-3">
                              {selectedOrder.requirements || 'Standard service scope as per gig description.'}
                           </p>
                        </div>
                     </div>

                     {/* COMMON ACTIONS CARD */}
                     <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                        <h4 className="text-xs font-bold text-fiverr-dark uppercase tracking-wide flex items-center gap-2">
                           <Settings className="w-4 h-4 text-slate-400" />
                           <span>Common Actions</span>
                        </h4>
                        <div className="space-y-2">
                           <button className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-fiverr-dark border border-slate-200 rounded-xl text-[11px] font-bold text-left flex items-center justify-between transition group">
                              <span>Post a Proposal</span>
                              <PlusCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                           </button>
                           <button className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-fiverr-dark border border-slate-200 rounded-xl text-[11px] font-bold text-left flex items-center justify-between transition group">
                              <span>Raise an Invoice</span>
                              <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                           </button>
                           <button onClick={() => { setActiveWorkstreamSubTab('files'); handleAttachMockFile(); }} className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-fiverr-dark border border-slate-200 rounded-xl text-[11px] font-bold text-left flex items-center justify-between transition group">
                              <span>Attach Files</span>
                              <Paperclip className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                           </button>
                           {(currentUser?.id || impersonatedUser?.id) === selectedOrder.buyerId && (
                             <button className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold text-left flex items-center justify-between transition shadow-2xs">
                                <span>Release Escrow</span>
                                <ShieldCheck className="w-3.5 h-3.5" />
                             </button>
                           )}
                           {(currentUser?.id || impersonatedUser?.id) === selectedOrder.sellerId && (
                             <button className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[11px] font-bold text-left flex items-center justify-between transition shadow-2xs">
                                <span>Send Deliverables</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                             </button>
                           )}
                        </div>
                     </div>

                     {/* PARTNER CARD */}
                     <div className="bg-slate-900 rounded-3xl p-6 shadow-xs text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                           <Users className="w-24 h-24" />
                        </div>
                        <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                           {(() => {
                              const partner = usersList.find(u => u.id === ((currentUser?.id || impersonatedUser?.id) === selectedOrder.buyerId ? selectedOrder.sellerId : selectedOrder.buyerId));
                              return (
                                <>
                                  <img src={partner?.avatar} className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-800 shadow-lg" />
                                  <div>
                                     <div className="font-bold text-sm tracking-tight">{partner?.name}</div>
                                     <div className="text-[10px] opacity-60 uppercase tracking-widest mt-0.5">{partner?.role}</div>
                                  </div>
                                  <button 
                                    onClick={(e) => navigate('/' + (partner?.username || slugify(partner?.name || '')), e)}
                                    className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] rounded-lg transition border border-white/10"
                                  >
                                     VIEW PROFILE
                                  </button>
                                </>
                              );
                           })()}
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* START NEW WORKSTREAM MODAL */}
            {isStartWorkstreamModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-slate-800">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-fiverr-dark">Start New Workstream</h3>
                    <button onClick={() => setIsStartWorkstreamModalOpen(false)} className="text-slate-400 hover:text-fiverr-dark text-xs font-bold">Cancel</button>
                  </div>

                  <form onSubmit={handleCreateNewWorkstream} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-fiverr-dark font-bold uppercase mb-1">Workstream / Service Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Custom React Full Stack Development..." 
                        value={newWsTitle}
                        onChange={(e) => setNewWsTitle(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-fiverr-dark font-bold uppercase mb-1">Select Partner / Freelancer</label>
                      <select 
                        value={newWsRecipient}
                        onChange={(e) => setNewWsRecipient(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500"
                      >
                        {usersList.filter(u => u.id !== currentUser?.id).map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-fiverr-dark font-bold uppercase mb-1">Escrow Amount ($)</label>
                      <input 
                        type="number" 
                        value={newWsAmount}
                        onChange={(e) => setNewWsAmount(Number(e.target.value))}
                        required
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                      <button type="button" onClick={() => setIsStartWorkstreamModalOpen(false)} className="px-4 py-2 bg-slate-100 text-fiverr-dark font-bold rounded-xl">Cancel</button>
                      <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-xs">Start Workstream</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            </div>
          </div>
        )}

        {/* VIEW 7: CREATE GIG STUDIO (/create-gig) */}
        {isCreateGig && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-fiverr-dark">Create a New Service Gig</h1>
              <p className="text-sm text-fiverr-muted">Publish your freelance service and leverage automated tools to optimize conversion.</p>
            </div>

            <form onSubmit={handlePublishGig} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-2">Gig Title</label>
                <input 
                  type="text" 
                  placeholder="I will build a high-performance web app..."
                  value={newGigTitle}
                  onChange={(e) => setNewGigTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-2">Category</label>
                <select 
                  value={newGigCat}
                  onChange={(e) => setNewGigCat(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                >
                  <option value="Development & IT">Development & IT</option>
                  <option value="AI & Data">AI & Data</option>
                  <option value="Design & Creative">Design & Creative</option>
                  <option value="Mobile Apps">Mobile Apps</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-fiverr-dark uppercase tracking-wider">Description</label>
                  <button 
                    type="button"
                    onClick={handleOptimizeGigWithAI}
                    disabled={isOptimizingGig}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors border border-emerald-200"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isOptimizingGig ? 'Optimizing with Gemini...' : 'Optimize with Gemini AI'}</span>
                  </button>
                </div>
                <textarea 
                  rows={5}
                  placeholder="Describe your service offering, deliverables, and tech stack..."
                  value={newGigDesc}
                  onChange={(e) => setNewGigDesc(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-2">Base Price ($)</label>
                  <input 
                    type="number" 
                    value={newGigPrice}
                    onChange={(e) => setNewGigPrice(Number(e.target.value))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-2">Delivery Time (Days)</label>
                  <input 
                    type="number" 
                    value={newGigDays}
                    onChange={(e) => setNewGigDays(Number(e.target.value))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Optional Gig Extras Section */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-1">
                    Configure Optional Gig Extras (Add-ons)
                  </label>
                  <p className="text-xs text-fiverr-muted">Allow buyers to add extra fast delivery, source files, or commercial licenses to their order.</p>
                </div>

                {/* Existing configured extras */}
                {newGigExtras.length > 0 && (
                  <div className="space-y-2">
                    {newGigExtras.map(ext => (
                      <div key={ext.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        <span className="font-semibold text-slate-800">{ext.title}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-fiverr-dark">+${ext.price}</span>
                          <button 
                            type="button"
                            onClick={() => handleRemoveGigExtra(ext.id)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new extra input row */}
                <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input 
                    type="text" 
                    placeholder="Extra title (e.g. Fast 24h Express Delivery)..." 
                    value={extraTitleInput}
                    onChange={(e) => setExtraTitleInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-fiverr-muted">$</span>
                    <input 
                      type="number" 
                      placeholder="50" 
                      value={extraPriceInput}
                      onChange={(e) => setExtraPriceInput(Number(e.target.value))}
                      className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                    />
                    <button 
                      type="button"
                      onClick={handleAddGigExtra}
                      className="px-3 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs hover:bg-slate-800 whitespace-nowrap"
                    >
                      + Add Extra
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-sm shadow-md">
                Publish Gig to Marketplace
              </button>
            </form>
          </div>
        )}

        {/* VIEW 8: POST PROJECT STUDIO (/post-project) */}
        {isPostProject && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-fiverr-dark">Post a Project Request</h1>
              <p className="text-sm text-fiverr-muted">Describe what you need built and receive custom proposals from top freelancers.</p>
            </div>

            <form onSubmit={handlePostProject} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-2">Project Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Need React Native mobile app developer..."
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-2">Category</label>
                <select 
                  value={newProjCat}
                  onChange={(e) => setNewProjCat(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                >
                  <option value="Development & IT">Development & IT</option>
                  <option value="AI & Data">AI & Data</option>
                  <option value="Design & Creative">Design & Creative</option>
                  <option value="Mobile Apps">Mobile Apps</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-2">Project Description</label>
                <textarea 
                  rows={5}
                  placeholder="Detailed requirements, deliverables, and expectations..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-2">Min Budget ($)</label>
                  <input 
                    type="number" 
                    value={newProjMin}
                    onChange={(e) => setNewProjMin(Number(e.target.value))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-2">Max Budget ($)</label>
                  <input 
                    type="number" 
                    value={newProjMax}
                    onChange={(e) => setNewProjMax(Number(e.target.value))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-sm shadow-md">
                Post Project & Notify Freelancers
              </button>
            </form>
          </div>
        )}

      </main>

      {/* WISHLIST / LIKED GIGS MODAL */}
      {isWishlistModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-fiverr-dark flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  <span>Your Liked Gigs & Wishlist ({likedGigIds.length})</span>
                </h3>
                <p className="text-xs text-fiverr-muted mt-0.5">Quickly access and manage the freelance service gigs you have saved.</p>
              </div>
              <button 
                onClick={() => setIsWishlistModalOpen(false)}
                className="p-2 text-slate-400 hover:text-fiverr-dark hover:bg-slate-100 rounded-xl transition-colors text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {likedGigIds.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs space-y-3">
                  <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                  <p>You haven't liked any gigs yet. Click the heart icon on any gig card to save it to your wishlist!</p>
                </div>
              ) : (
                gigs.filter(g => likedGigIds.includes(g.id)).map(gig => {
                  const gUrl = getGigUrl(gig);
                  return (
                    <div key={gig.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={gig.image} className="w-16 h-12 rounded-xl object-cover border border-slate-200" />
                        <div>
                          <a 
                            href={gUrl} 
                            onClick={(e) => {
                              setIsWishlistModalOpen(false);
                              navigate(gUrl, e);
                            }}
                            className="font-bold text-fiverr-dark text-xs hover:text-emerald-600 line-clamp-1 cursor-pointer"
                          >
                            {gig.title}
                          </a>
                          <span className="text-[11px] text-fiverr-muted block mt-0.5">{gig.category} · By {gig.freelancerName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-fiverr-dark text-xs">${gig.price}</span>
                        <a 
                          href={gUrl}
                          onClick={(e) => {
                            setIsWishlistModalOpen(false);
                            navigate(gUrl, e);
                          }}
                          className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800"
                        >
                          View Gig
                        </a>
                        <button 
                          onClick={() => handleToggleLike(gig.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* EMAIL INBOX & SYSTEM NOTIFICATIONS MODAL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-fiverr-dark flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <span>Official Email Notifications & System Inbox</span>
                </h3>
                <p className="text-xs text-fiverr-muted mt-0.5">
                  Official emails dispatched to {(impersonatedUser || currentUser)?.email || 'your account'} regarding account status, compliance, and security.
                </p>
              </div>
              <button 
                onClick={() => setIsEmailModalOpen(false)}
                className="p-2 text-slate-400 hover:text-fiverr-dark hover:bg-slate-100 rounded-xl transition-colors text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {userEmails.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No official email notifications found.</div>
              ) : (
                userEmails.map(em => {
                  let badgeColor = 'bg-slate-100 text-fiverr-dark';
                  if (em.type === 'SUSPEND') badgeColor = 'bg-red-100 text-red-800 border-red-200';
                  else if (em.type === 'RESTRICT') badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
                  else if (em.type === 'IMPERSONATE') badgeColor = 'bg-indigo-100 text-indigo-800 border-indigo-200';

                  return (
                    <div key={em.id} className={`p-5 rounded-2xl border space-y-3 transition-all ${em.read ? 'bg-slate-50/60 border-slate-200' : 'bg-white border-slate-300 shadow-sm'}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border ${badgeColor}`}>
                          {em.type} NOTICE
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{em.sentAt}</span>
                      </div>

                      <h4 className="text-sm font-bold text-fiverr-dark">{em.subject}</h4>
                      <p className="text-xs text-fiverr-dark whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">
                        {em.body}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        {!em.read && (
                          <button 
                            onClick={async () => {
                              await fetch(`/api/user-emails/${em.id}/read`, { method: 'PATCH' });
                              const targetUid = (impersonatedUser || currentUser)?.id;
                              if (targetUid) fetchUserEmails(targetUid);
                            }}
                            className="text-[11px] font-bold text-fiverr-muted hover:text-slate-800 underline"
                          >
                            Mark as Read
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setIsEmailModalOpen(false);
                            setIsSupportModalOpen(true);
                          }}
                          className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400 transition-colors shadow-xs ml-auto flex items-center gap-1.5"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Contact Support Desk</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT TICKET SUBMISSION MODAL */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-fiverr-dark flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-600" />
                  <span>Contact WorkSphere Support Desk</span>
                </h3>
                <p className="text-xs text-fiverr-muted mt-0.5">Submit an appeal, ask questions about restrictions, or request support assistance.</p>
              </div>
              <button 
                onClick={() => setIsSupportModalOpen(false)}
                className="p-2 text-slate-400 hover:text-fiverr-dark hover:bg-slate-100 rounded-xl transition-colors text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateSupportTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-2">Inquiry Subject / Topic</label>
                <input 
                  type="text" 
                  placeholder="e.g. Account Status Review / Appeal Request" 
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-2">Detailed Message / Explanation</label>
                <textarea 
                  rows={5}
                  placeholder="Please describe your inquiry or appeal details..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsSupportModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-fiverr-dark hover:text-fiverr-dark bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs transition-colors"
                >
                  Submit Support Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER SWITCH MODAL */}
      {isUserSwitchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-fiverr-dark flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span>Switch User Account</span>
                </h3>
                <p className="text-xs text-fiverr-muted mt-0.5">Instantly switch between registered users, freelancers, clients, and administrators.</p>
              </div>
              <button 
                onClick={() => setIsUserSwitchModalOpen(false)}
                className="p-2 text-slate-400 hover:text-fiverr-dark hover:bg-slate-100 rounded-xl transition-colors text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {usersList.map((u) => {
                const isActive = (impersonatedUser ? impersonatedUser.id : (currentUser ? currentUser.id : '')) === u.id;
                return (
                  <div 
                    key={u.id}
                    onClick={() => {
                      setImpersonatedUser(u);
                      setCurrentUser(u);
                      setIsUserSwitchModalOpen(false);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${isActive ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-fiverr-dark'}`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{u.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isActive ? 'bg-emerald-400 text-fiverr-dark' : 'bg-slate-200 text-fiverr-dark'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </div>
                        <span className={`text-xs ${isActive ? 'text-slate-300' : 'text-fiverr-muted'}`}>{u.email}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold block ${isActive ? 'text-emerald-400' : 'text-fiverr-dark'}`}>${u.walletBalance?.toLocaleString() || 0}</span>
                      <span className={`text-[10px] ${isActive ? 'text-slate-400' : 'text-fiverr-muted'}`}>Wallet</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE PAGE VIEW (Matches PeoplePerHour design from screenshot exactly) */}
      {isProfilePage && profileUser && (
        <FreelancerProfileView 
          profileUser={profileUser}
          currentUser={currentUser}
          gigs={gigs}
          onNavigate={navigate}
          onFeatureGig={handleFeatureUserGig}
          onContact={() => handleContactSeller(profileUser.id, profileUser.name, 'General Inquiry')}
        />
      )}
      {isPayments && (
        (impersonatedUser || currentUser) ? (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <PaymentsModule 
              gigs={gigs} 
              orders={orders} 
              projects={projects} 
              proposals={proposals} 
              currentUser={(impersonatedUser || currentUser)!} 
              onBalanceUpdate={fetchAllAdminData}
            />
          </div>
        ) : (
          <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
            <Wallet className="w-12 h-12 text-slate-400 mx-auto" />
            <h2 className="text-xl font-bold text-fiverr-dark">Sign in to Access Payments & Wallet</h2>
            <p className="text-xs text-fiverr-muted">View earnings, available balances, escrow holds, and withdrawal options.</p>
            <button 
              onClick={() => setIsLoginModalOpen(true)} 
              className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition cursor-pointer"
            >
              Sign In to WorkPerHour
            </button>
          </div>
        )
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 mt-16 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div>
            <a href="/gigs" onClick={(e) => navigate('/gigs', e)} className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-base">
                W
              </div>
              <span className="text-base font-bold tracking-tight text-fiverr-dark">WorkPerHour</span>
            </a>
            <p className="text-xs text-fiverr-muted leading-relaxed mb-4">
              WorkPerHour is a secure freelance marketplace with 100% Escrow payment protection, real-time Workstream collaboration, and Gemini AI proposal generation.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Escrow Protected</span>
            </div>
          </div>

          {/* Col 2: SEO Category Links */}
          <div>
            <h4 className="text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-4">Browse Categories</h4>
            <ul className="space-y-2.5 text-xs text-fiverr-dark">
              <li>
                <a href="/categories/development-it" onClick={(e) => navigate('/categories/development-it', e)} className="hover:text-fiverr-dark transition-colors">
                  Development & IT
                </a>
              </li>
              <li>
                <a href="/categories/ai-data" onClick={(e) => navigate('/categories/ai-data', e)} className="hover:text-fiverr-dark transition-colors">
                  AI & Data Science
                </a>
              </li>
              <li>
                <a href="/categories/design-creative" onClick={(e) => navigate('/categories/design-creative', e)} className="hover:text-fiverr-dark transition-colors">
                  Design & Creative
                </a>
              </li>
              <li>
                <a href="/categories/mobile-apps" onClick={(e) => navigate('/categories/mobile-apps', e)} className="hover:text-fiverr-dark transition-colors">
                  Mobile Apps
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform Links */}
          <div>
            <h4 className="text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-4">Marketplace Navigation</h4>
            <ul className="space-y-2.5 text-xs text-fiverr-dark">
              <li>
                <a href="/gigs" onClick={(e) => navigate('/gigs', e)} className="hover:text-fiverr-dark transition-colors">
                  Explore All Gigs
                </a>
              </li>
              <li>
                <a href="/projects" onClick={(e) => navigate('/projects', e)} className="hover:text-fiverr-dark transition-colors">
                  Buyer Requests Board
                </a>
              </li>
              <li>
                <a href="/orders" onClick={(e) => navigate('/orders', e)} className="hover:text-fiverr-dark transition-colors">
                  My Escrow Orders
                </a>
              </li>
              <li>
                <a href="/messages" onClick={(e) => navigate('/messages', e)} className="hover:text-fiverr-dark transition-colors">
                  Active Workstreams
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Administration & Support */}
          <div>
            <h4 className="text-xs font-bold text-fiverr-dark uppercase tracking-wider mb-4">Support & Administration</h4>
            <ul className="space-y-2.5 text-xs text-fiverr-dark">
              <li>
                <button 
                  onClick={() => setIsSupportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 font-bold text-fiverr-dark hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Contact Support Desk</span>
                </button>
              </li>
              <li>
                <a href="/admin" onClick={(e) => navigate('/admin', e)} className="inline-flex items-center gap-1.5 font-bold text-fiverr-dark hover:text-emerald-600 transition-colors">
                  <Settings className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Admin Panel Console</span>
                </a>
              </li>
              <li><span className="text-slate-400">Escrow Security Protocols</span></li>
              <li><span className="text-slate-400">Gemini AI Engine Logs</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-fiverr-muted gap-4">
          <p>© 2026 WorkPerHour Marketplace Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSupportModalOpen(true)}
              className="font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Contact Support</span>
            </button>
            <span>·</span>
            <button 
              onClick={() => setIsUserSwitchModalOpen(true)}
              className="font-semibold text-fiverr-dark hover:text-fiverr-dark inline-flex items-center gap-1 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Switch User</span>
            </button>
            <span>·</span>
            <a href="/admin" onClick={(e) => navigate('/admin', e)} className="font-semibold text-fiverr-dark hover:text-fiverr-dark">
              Admin Portal
            </a>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </footer>
      {/* LOGIN MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-fiverr-dark">Login to WorkPerHour</h2>
              <button 
                onClick={() => setIsLoginModalOpen(false)} 
                className="text-slate-400 hover:text-fiverr-dark p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>
            {loginRequiresCode ? (
              <form className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Device Verification Code Required</span>
                  </div>
                  <p>{loginVerificationMessage || `Enter the 6-digit verification code sent to ${loginEmail}.`}</p>
                </div>

                {mockEmailCodeDisplay && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                    <span>Test / Demo OTP:</span>
                    <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-emerald-200">{mockEmailCodeDisplay}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-fiverr-dark uppercase block mb-1">Enter 6-Digit Email Code</label>
                  <input 
                    type="text" 
                    maxLength={6} 
                    placeholder="123456" 
                    value={loginCode} 
                    onChange={(e) => setLoginCode(e.target.value)} 
                    required 
                    autoFocus
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest bg-white focus:outline-emerald-500" 
                  />
                </div>

                <button type="button" onClick={handleLoginSubmit} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer text-sm">
                  Verify Code & Complete Login
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button 
                    type="button" 
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/auth/resend-email-code', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: loginEmail })
                        });
                        const data = await res.json();
                        if (res.ok && data.mockEmailCode) {
                          setMockEmailCodeDisplay(data.mockEmailCode);
                          alert('New verification code sent to your email.');
                        }
                      } catch (e) {
                        console.warn(e);
                      }
                    }} 
                    className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setLoginRequiresCode(false); setLoginCode(''); }} 
                    className="text-fiverr-muted hover:text-slate-800 cursor-pointer"
                  >
                    Back to Password
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-3" onSubmit={handleLoginSubmit}>
                <input type="email" placeholder="Email (e.g. elena@example.com)" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-xl text-sm" />
                <input type="password" placeholder="Password (default: password123)" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-xl text-sm" />
                <button type="submit" className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition cursor-pointer">Login</button>
                <button type="button" onClick={(e) => { e.preventDefault(); setIsLoginModalOpen(false); setIsForgotPasswordModalOpen(true); }} className="w-full text-xs font-normal text-emerald-700 hover:text-emerald-900 cursor-pointer underline">Forgot Password?</button>
              </form>
            )}

            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">Instant Demo Account Login</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {usersList.slice(0, 4).map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/auth/demo-session', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId: u.id })
                        });
                        const data = await res.json();
                        if (data.token) {
                          localStorage.setItem('workperhour_token', data.token);
                          localStorage.setItem('token', data.token);
                        }
                        setCurrentUser(data.user || u);
                      } catch {
                        setCurrentUser(u);
                      }
                      setImpersonatedUser(null);
                      setIsLoginModalOpen(false);
                      fetchAllAdminData();
                    }}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition flex items-center gap-2 cursor-pointer"
                  >
                    <img src={u.avatar} className="w-6 h-6 rounded-full object-cover shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-[11px] text-slate-800 truncate">{u.name.split(' ')[0]}</div>
                      <div className="text-[9px] text-fiverr-muted uppercase">{u.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIGNUP MODAL */}
      {isSignupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-fiverr-dark">Register for WorkPerHour</h2>
              <button 
                onClick={() => setIsSignupModalOpen(false)} 
                className="text-slate-400 hover:text-fiverr-dark p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <input type="text" placeholder="Full Name" value={signupName} onChange={(e) => setSignupName(e.target.value)} required className="w-full px-4 py-2 border rounded-xl text-sm" />
              <input type="email" placeholder="Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-xl text-sm" />
              <input type="text" placeholder="Mobile Number" value={signupMobile} onChange={(e) => setSignupMobile(e.target.value)} required className="w-full px-4 py-2 border rounded-xl text-sm" />
              <input type="password" placeholder="Password (min 6 chars)" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-xl text-sm" />
              <input type="password" placeholder="Confirm Password" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-xl text-sm" />
              <button type="submit" className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition cursor-pointer">Sign Up</button>
            </form>
          </div>
        </div>
      )}

      {/* VERIFY MODAL */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-fiverr-dark">Verify Your Account</h2>
              <button 
                onClick={() => setIsVerifyModalOpen(false)} 
                className="text-slate-400 hover:text-fiverr-dark p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>
            <div className="mb-4">
              <button onClick={() => setVerificationMode('email')} className={`mr-2 px-3 py-1 rounded ${verificationMode === 'email' ? 'bg-slate-900 text-white' : 'bg-slate-200'}`}>Email</button>
              <button onClick={() => setVerificationMode('sms')} className={`px-3 py-1 rounded ${verificationMode === 'sms' ? 'bg-slate-900 text-white' : 'bg-slate-200'}`}>SMS</button>
            </div>
            {verificationMode === 'email' ? (
              <form onSubmit={handleVerifyEmailSubmit} className="space-y-4">
                <input type="text" placeholder="Enter Email Code" value={emailCodeInput} onChange={(e) => setEmailCodeInput(e.target.value)} required className="w-full px-4 py-2 border rounded-xl" />
                <button type="submit" className="w-full py-2 bg-emerald-500 text-white rounded-xl">Verify Email</button>
                <button type="button" onClick={handleResendEmailCode} className="w-full text-xs">Resend Email Code</button>
              </form>
            ) : (
              <form onSubmit={handleVerifySmsSubmit} className="space-y-4">
                <input type="text" placeholder="Enter SMS Code" value={smsCodeInput} onChange={(e) => setSmsCodeInput(e.target.value)} required className="w-full px-4 py-2 border rounded-xl" />
                <button type="submit" className="w-full py-2 bg-emerald-500 text-white rounded-xl">Verify SMS</button>
                <button type="button" onClick={handleResendSmsCode} className="w-full text-xs">Resend SMS Code</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* GLOBAL INSPECT GIG DETAILS MODAL */}
      {viewingGig && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-3xl w-full space-y-6 max-h-[90vh] overflow-y-auto text-slate-800 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold leading-tight text-fiverr-dark">{viewingGig.title}</h1>
                  {viewingGig.featured && (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-xs font-bold">★ Featured</span>
                  )}
                </div>
                <p className="text-xs font-normal text-fiverr-muted mt-1">Gig ID: #{viewingGig.id} · Category: <span className="text-emerald-600 font-semibold">{viewingGig.category} ({viewingGig.subcategory || 'General'})</span></p>
              </div>
              <button 
                onClick={() => setViewingGig(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-fiverr-dark text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <img 
                  src={viewingGig.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=500&fit=crop'} 
                  className="w-full h-48 rounded-2xl object-cover border border-slate-200 shadow-xs" 
                />
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[11px] text-fiverr-muted uppercase font-normal block">Starting Price</span>
                    <span className="text-xl font-bold text-fiverr-dark">${viewingGig.price}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[9px] text-fiverr-muted uppercase font-bold block">Delivery Time</span>
                    <span className="text-sm font-bold text-fiverr-dark">{viewingGig.deliveryDays} Days</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[9px] text-fiverr-muted uppercase font-bold block">Rating</span>
                    <span className="text-sm font-bold text-amber-500">★ {viewingGig.rating || 5.0}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <h2 className="text-xl font-bold text-fiverr-dark uppercase mb-2">Gig Description</h2>
                  <p className="text-base text-fiverr-dark leading-body whitespace-pre-wrap">{viewingGig.description}</p>
                </div>

                {viewingGig.extras && viewingGig.extras.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h2 className="text-xl font-bold text-fiverr-dark uppercase mb-2">Gig Upgrades & Extras</h2>
                    <div className="space-y-2">
                      {viewingGig.extras.map(e => (
                        <div key={e.id} className="flex justify-between items-center text-xs bg-white px-3 py-2 rounded-lg border border-slate-200">
                          <span className="text-slate-800">{e.title}</span>
                          <span className="font-bold text-emerald-600">+${e.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* GIG PROGRESS & PERFORMANCE METRICS */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-fiverr-dark">Live Gig Progress & Analytics</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  viewingGig.status === 'published' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {viewingGig.status === 'published' ? 'Active & Published' : 'Paused / Suspended'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Views</span>
                  <span className="text-base font-bold text-fiverr-dark font-mono">1,482</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Client Inquiries</span>
                  <span className="text-base font-bold text-fiverr-dark font-mono">46</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Orders Completed</span>
                  <span className="text-base font-bold text-emerald-600 font-mono">18</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">On-Time Delivery</span>
                  <span className="text-base font-bold text-indigo-600 font-mono">100%</span>
                </div>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-bold text-fiverr-dark">
                  <span>Gig Quality & Health Score</span>
                  <span className="text-emerald-600 font-mono">98 / 100 (Optimal)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={viewingGig.freelancerAvatar} className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20" />
                <div>
                  <span className="text-xs font-bold text-fiverr-dark block">{viewingGig.freelancerName}</span>
                  <span className="text-[11px] text-fiverr-muted">Freelancer ID: {viewingGig.freelancerId} · Level: {viewingGig.freelancerLevel || 'Pro'}</span>
                </div>
              </div>
              <span className="text-xs text-fiverr-muted">Moderation: {viewingGig.moderationStatus || 'Pending review'}</span>
            </div>

            {viewingGig.moderationNotes && (
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-purple-700 block">Moderation Log Notes:</span>
                <p className="text-purple-900">{viewingGig.moderationNotes}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button 
                onClick={() => {
                  if (viewingGig) {
                    handleDeleteGig(viewingGig.id);
                    setViewingGig(null);
                  }
                }}
                className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Service</span>
              </button>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const g = viewingGig;
                    setViewingGig(null);
                    handleOpenEditGigModal(g);
                  }}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-xl flex items-center gap-1 text-xs transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  <span>Edit Details</span>
                </button>
                <button 
                  onClick={() => setViewingGig(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-fiverr-dark font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL EDIT GIG DETAILS MODAL */}
      {editingGig && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full space-y-5 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-fiverr-dark">Edit Service — {editingGig.title}</h3>
              <button 
                onClick={() => setEditingGig(null)}
                className="text-slate-400 hover:text-fiverr-dark text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveEditGig} className="space-y-4 text-xs">
              <div>
                <label className="block text-fiverr-dark font-bold uppercase mb-1">Gig Title</label>
                <input 
                  type="text" 
                  value={editGigForm.title}
                  onChange={(e) => setEditGigForm({ ...editGigForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-fiverr-dark font-bold uppercase mb-1">Category</label>
                  <select 
                    value={editGigForm.category}
                    onChange={(e) => setEditGigForm({ ...editGigForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-fiverr-dark font-bold uppercase mb-1">Subcategory</label>
                  <input 
                    type="text" 
                    value={editGigForm.subcategory}
                    onChange={(e) => setEditGigForm({ ...editGigForm, subcategory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-fiverr-dark font-bold uppercase mb-1">Starting Price ($)</label>
                  <input 
                    type="number" 
                    value={editGigForm.price}
                    onChange={(e) => setEditGigForm({ ...editGigForm, price: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-fiverr-dark font-bold uppercase mb-1">Delivery Time (Days)</label>
                  <input 
                    type="number" 
                    value={editGigForm.deliveryDays}
                    onChange={(e) => setEditGigForm({ ...editGigForm, deliveryDays: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-fiverr-dark font-bold uppercase mb-1">Description</label>
                <textarea 
                  rows={4}
                  value={editGigForm.description}
                  onChange={(e) => setEditGigForm({ ...editGigForm, description: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-fiverr-dark focus:outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-fiverr-dark">
                  <input 
                    type="checkbox" 
                    checked={editGigForm.featured}
                    onChange={(e) => setEditGigForm(prev => ({ ...prev, featured: e.target.checked }))}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Feature Gig on Homepage & Listings</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => {
                    if (editingGig) {
                      handleDeleteGig(editingGig.id);
                      setEditingGig(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Service</span>
                </button>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setEditingGig(null)}
                    className="px-4 py-2 bg-slate-100 text-fiverr-dark font-bold rounded-xl hover:bg-slate-200 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 text-xs shadow-xs cursor-pointer"
                  >
                    Save Gig Details
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE GIG CONFIRMATION WARNING MODAL */}
      {gigToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0 text-red-600 shadow-xs">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-fiverr-dark">Are you sure you want to delete this gig?</h3>
                <p className="text-xs text-fiverr-muted leading-relaxed">
                  This action is permanent and cannot be undone. This service listing will be immediately removed from your profile and marketplace.
                </p>
                {gigToDelete.title && (
                  <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 line-clamp-2">
                    "{gigToDelete.title}"
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setGigToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-fiverr-dark font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteGig}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Gig</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE SUCCESS TOAST */}
      {deleteSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{deleteSuccessToast}</span>
          <button 
            onClick={() => setDeleteSuccessToast(null)}
            className="text-slate-400 hover:text-white text-xs font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {isForgotPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-fiverr-dark">Forgot Password</h2>
                <p className="text-xs text-fiverr-muted">Reset password via Email or SMS</p>
              </div>
              <button 
                onClick={() => {
                  setIsForgotPasswordModalOpen(false);
                  setForgotStep('request');
                  setForgotCode('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                }} 
                className="text-slate-400 hover:text-fiverr-dark p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>
            {forgotStep === 'request' && (
              <form onSubmit={handleForgotRequest} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-fiverr-dark block mb-1">Registered Email or Mobile Number</label>
                  <input 
                    type="text" 
                    placeholder="elena@example.com or +1234567890" 
                    value={forgotQuery} 
                    onChange={(e) => setForgotQuery(e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 border rounded-xl text-sm" 
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition cursor-pointer">
                  Send Recovery Code
                </button>
              </form>
            )}
            {forgotStep === 'verify' && (
              <form onSubmit={handleForgotVerify} className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <p className="font-semibold">Enter the 6-digit recovery OTP code sent to {forgotQuery}.</p>
                  {mockForgotCodeDisplay && (
                    <div className="p-1.5 bg-white border border-amber-200 rounded text-fiverr-dark font-mono font-bold flex items-center justify-between mt-1">
                      <span className="text-[10px] text-fiverr-muted uppercase">Test OTP:</span>
                      <span className="text-xs text-emerald-700">{mockForgotCodeDisplay}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-fiverr-dark block mb-1">6-Digit Recovery OTP</label>
                  <input 
                    type="text" 
                    maxLength={6} 
                    placeholder="123456" 
                    value={forgotCode} 
                    onChange={(e) => setForgotCode(e.target.value)} 
                    required 
                    className="w-full px-4 py-3 border rounded-xl text-center text-lg font-mono font-bold tracking-widest text-fiverr-dark" 
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition cursor-pointer">
                  Verify Recovery Code
                </button>
              </form>
            )}
            {forgotStep === 'reset' && (
              <form onSubmit={handleForgotReset} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-fiverr-dark block mb-1">New Password (min 6 characters)</label>
                  <input 
                    type="password" 
                    placeholder="Enter new password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 border rounded-xl text-sm" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-fiverr-dark block mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="Confirm new password" 
                    value={confirmNewPassword} 
                    onChange={(e) => setConfirmNewPassword(e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 border rounded-xl text-sm" 
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition cursor-pointer">
                  Save New Password & Proceed to Login
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
