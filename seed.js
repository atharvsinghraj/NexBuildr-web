// ═══════════════════════════════════════════════════════════════
// NexBuildr Firebase Seed Script
// Run this in browser console at nexbuildr.pages.dev (while logged in)
// It will create sample users, posts, tasks, and leaderboard data
// ═══════════════════════════════════════════════════════════════

(async function seedNexBuildr() {
  const db = firebase.firestore();
  const fv = firebase.firestore.FieldValue;
  const auth = firebase.auth();
  const myUid = auth.currentUser?.uid;

  if (!myUid) { console.error('Not logged in!'); return; }
  console.log('Seeding NexBuildr for uid:', myUid);

  const batch1 = db.batch();

  // ── Sample Posts ──
  const posts = [
    { title: 'Building EdTech for Tier-2 Cities', content: 'We are working on a platform that helps students in tier-2 cities access quality education. Looking for co-founders and early users. The problem is real and the market is huge.', sector: 'Education', authorName: 'Arjun Mehta', authorHandle: 'arjunm', likes: [], views: [], userId: myUid, createdAt: fv.serverTimestamp() },
    { title: 'Why Most Student Startups Fail', content: 'After talking to 50+ student founders, the #1 reason startups fail is not product or market — it is the founding team. You need someone who executes, not just ideates.', sector: 'General', authorName: 'Priya Sharma', authorHandle: 'priyas', likes: [], views: [], userId: myUid, createdAt: fv.serverTimestamp() },
    { title: 'Got our first 100 users in 7 days', content: 'No ads. No budget. Just a WhatsApp group, 3 friends, and a working MVP. Here is exactly how we did it step by step.', sector: 'Growth', authorName: 'Rohan Kumar', authorHandle: 'rohank', likes: [], views: [], userId: myUid, createdAt: fv.serverTimestamp() },
    { title: 'HealthTech MVP ready - need feedback', content: 'Built a symptom checker for rural India with offline support and local language support. Would love feedback from the community before launching.', sector: 'Healthcare', authorName: 'Sneha Patel', authorHandle: 'snehap', likes: [], views: [], userId: myUid, createdAt: fv.serverTimestamp() },
    { title: 'Raised ₹15L from friends and family', content: 'Not a VC round. Not a startup incubator. Just convinced 5 people who believed in us. Here is what I learned about raising from people who know you.', sector: 'Funding', authorName: 'Vivek Singh', authorHandle: 'viveks', likes: [], views: [], userId: myUid, createdAt: fv.serverTimestamp() },
    { title: 'AgriTech idea - connecting farmers to buyers', content: 'Farmers in my village sell produce at 30% of market price. I want to fix this with a simple app. Currently prototyping. Who wants to help?', sector: 'Agriculture', authorName: 'Kavya Reddy', authorHandle: 'kavyar', likes: [], views: [], userId: myUid, createdAt: fv.serverTimestamp() },
    { title: 'How I validated my idea in 48 hours', content: 'Posted in 10 Facebook groups, created a Google Form, and got 200 responses. Validation does not need months of market research. Here is the playbook.', sector: 'General', authorName: 'Dev Joshi', authorHandle: 'devj', likes: [], views: [], userId: myUid, createdAt: fv.serverTimestamp() },
    { title: 'Building in public — Week 3 update', content: 'Users: 47 → 120. Revenue: ₹0 → ₹2,400. Lessons: charge earlier, talk to users daily, ship fast. This week we added 3 features and killed 2.', sector: 'Technology', authorName: 'Ishaan Nair', authorHandle: 'ishaann', likes: [], views: [], userId: myUid, createdAt: fv.serverTimestamp() },
  ];
  posts.forEach(p => batch1.set(db.collection('posts').doc(), p));

  // ── Sample Startups ──
  const startups = [
    { name: 'LearnLocal', tagline: 'Vernacular education for Tier-2 India', sector: 'Education', stage: 'MVP', views: 142, userId: myUid, founderName: 'Arjun Mehta', tags: 'edtech,vernacular,india', createdAt: fv.serverTimestamp() },
    { name: 'FarmConnect', tagline: 'Direct farmer to buyer marketplace', sector: 'Agriculture', stage: 'Idea', views: 98, userId: myUid, founderName: 'Kavya Reddy', tags: 'agritech,marketplace,farmers', createdAt: fv.serverTimestamp() },
    { name: 'MedReach', tagline: 'Healthcare access for rural India', sector: 'Healthcare', stage: 'Growing', views: 210, userId: myUid, founderName: 'Sneha Patel', tags: 'healthtech,rural,offline', createdAt: fv.serverTimestamp() },
    { name: 'BuildFlow', tagline: 'Project management for student teams', sector: 'Technology', stage: 'MVP', views: 175, userId: myUid, founderName: 'Rohan Kumar', tags: 'saas,students,productivity', createdAt: fv.serverTimestamp() },
  ];
  startups.forEach(s => batch1.set(db.collection('startups').doc(), s));

  await batch1.commit();
  console.log('✅ Posts and Startups seeded');

  // ── Sample Global Messages ──
  const batch2 = db.batch();
  const msgs = [
    { senderId: myUid, senderName: 'You', senderPhoto: '', message: 'Hey everyone! Excited to be part of NexBuildr 🚀', timestamp: fv.serverTimestamp() },
    { senderId: 'sample1', senderName: 'Priya Sharma', senderPhoto: '', message: 'Welcome! Great platform to connect with builders.', timestamp: fv.serverTimestamp() },
    { senderId: 'sample2', senderName: 'Rohan Kumar', senderPhoto: '', message: 'Anyone working on EdTech? Would love to connect!', timestamp: fv.serverTimestamp() },
    { senderId: 'sample3', senderName: 'Dev Joshi', senderPhoto: '', message: 'Just launched my MVP — 47 users in first week!', timestamp: fv.serverTimestamp() },
  ];
  msgs.forEach(m => batch2.set(db.collection('globalMessages').doc(), m));
  await batch2.commit();
  console.log('✅ Global messages seeded');

  // ── Update current user profile with good data ──
  await db.collection('users').doc(myUid).set({
    coins: 50,
    streak: 3,
    connectionCount: 5,
    followerCount: 12,
    followingCount: 8,
    bpProgress: { 'task-1': 'done', 'task-2': 'active' },
    lastActive: new Date().toDateString(),
  }, { merge: true });

  // ── Sample Co-founder Posts ──
  const batch3 = db.batch();
  const cfPosts = [
    { userId: myUid, founderName: 'Arjun Mehta', founderPhoto: '', founderHandle: 'arjunm', startup: 'LearnLocal', role: 'Developer', stage: 'MVP', industry: 'Education', equity: '15', commit: 'Full-time', location: 'Remote', contact: 'chat', skills: ['React', 'Node.js', 'Firebase'], desc: 'Building vernacular education platform for tier-2 cities. Need a strong developer who loves education and impact.', applicants: 3, createdAt: fv.serverTimestamp() },
    { userId: myUid, founderName: 'Kavya Reddy', founderPhoto: '', founderHandle: 'kavyar', startup: 'FarmConnect', role: 'Marketer', stage: 'Idea', industry: 'Agriculture', equity: '20', commit: 'Part-time', location: 'Hyderabad', contact: 'chat', skills: ['Digital Marketing', 'Content', 'Social Media'], desc: 'Connecting farmers directly to buyers. Need someone to handle growth and community.', applicants: 1, createdAt: fv.serverTimestamp() },
    { userId: myUid, founderName: 'Rohan Kumar', founderPhoto: '', founderHandle: 'rohank', startup: 'BuildFlow', role: 'Designer', stage: 'MVP', industry: 'Technology', equity: '10', commit: 'Flexible', location: 'Remote', contact: 'chat', skills: ['Figma', 'UI/UX', 'Product Design'], desc: 'SaaS for student project teams. Need a designer to improve our dashboard and onboarding flow.', applicants: 5, createdAt: fv.serverTimestamp() },
  ];
  cfPosts.forEach(p => batch3.set(db.collection('cofounderPosts').doc(), p));
  await batch3.commit();
  console.log('✅ Co-founder posts seeded');

  console.log('🎉 All seed data created! Refresh the page.');
})();
