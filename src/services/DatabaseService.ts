
// Perfect Demo Seed Configuration
export const Users = [
  { 
    id: 'user-1', name: 'Elena Rostova', email: 'elena@example.com', role: 'user', 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop', 
    title: 'Full Stack Dev', rating: 4.9, reviewsCount: 142, hourlyRate: 50, earned: 15000, 
    completedJobs: 45, bio: 'Expert in React/Node.', skills: ['React', 'Node.js'], 
    status: 'active' as 'active', verified: true, walletBalance: 1000, createdAt: '2026-01-01' 
  },
  { 
    id: 'user-2', name: 'Marcus Vance', email: 'marcus@example.com', role: 'user', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', 
    title: 'Creative Designer', rating: 4.8, reviewsCount: 88, hourlyRate: 40, earned: 8000, 
    completedJobs: 30, bio: 'UI/UX specialist.', skills: ['Figma', 'CSS'], 
    status: 'active' as 'active', verified: true, walletBalance: 500, createdAt: '2026-02-01' 
  },
  { 
    id: 'user-admin', name: 'Admin Chief', email: 'admin@workperhour.com', role: 'super_admin', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', 
    title: 'Admin', rating: 5.0, reviewsCount: 0, hourlyRate: 0, earned: 0, 
    completedJobs: 0, bio: 'Platform Admin', skills: [], 
    status: 'active' as 'active', verified: true, walletBalance: 0, createdAt: '2026-01-01' 
  }
];

export const Gigs = [
  { 
    id: 'gig-1', title: 'Promotional Puppet Video', freelancerId: 'user-1',
    freelancerName: 'Elena Rostova', freelancerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    category: 'Video', description: 'Puppet video creation.', price: 450, deliveryDays: 5,
    rating: 4.9, reviewsCount: 124, image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&h=500&fit=crop',
    status: 'published' as 'published', featured: true
  }
];

export const Workstreams = [
  { id: 'ws-1', title: 'Puppet Video Production', gigId: 'gig-1', buyerId: 'user-2', sellerId: 'user-1', status: 'in_progress' }
];

export function getHydratedWorkstreams(userId: string) {
  const user = Users.find(u => u.id === userId);
  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
  
  return Workstreams
    .filter(w => isAdmin || w.buyerId === userId || w.sellerId === userId)
    .map(w => {
      const gig = Gigs.find(g => g.id === w.gigId);
      const buyer = Users.find(u => u.id === w.buyerId);
      const seller = Users.find(u => u.id === w.sellerId);
      return { ...w, gig, buyer, seller };
    });
}
