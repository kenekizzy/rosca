// Types

export type GroupStatus = "draft" | "pending" | "active" | "completed" | "archived";

export type ContributionStatus = "paid" | "pending" | "overdue" | "approved" | "rejected";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  status: GroupStatus;
  contributionAmount: number;
  totalMembers: number;
  currentCycle: number;
  totalCycles: number;
  currentRecipient: string | null;
  nextRecipient: string | null;
  startDate: string;
  nextDueDate: string | null;
  healthScore?: number;
  membersPaidThisCycle?: number;
};

export type Contribution = {
  id: string;
  groupId: string;
  groupName: string;
  amount: number;
  dueDate: string;
  status: ContributionStatus;
  cycle: number;
};

export type DashboardStats = {
  totalGroups: number;
  activeGroups: number;
  monthlyCommitment: number;
  upcomingContributions: number;
  upcomingPayouts: number;
  creditAccess: number;
};

export type GroupContribution = {
  id: string;
  memberName: string;
  paymentMethod: string;
  date: string;
  amount: number;
  status: 'approved' | 'pending' | 'overdue' | 'rejected';
};

export type PayoutMember = {
  position: number;
  name: string;
  contributionStatus: 'paid' | 'pending';
};

export type ContributionHealth = {
  onTime: number;
  late: number;
  penalties: number;
  approvalRate: number;
};

// Current logged-in user

export const currentUser: User = {
  id: "user-1",
  name: "Kene Ibe",
  email: "kene.ibe@email.com",
  avatar: null,
};

// Groups

export const groups: Group[] = [
  {
    id: "group-1",
    name: "Family Ajo",
    description: "Family savings group",
    status: "active",
    contributionAmount: 20000,
    totalMembers: 12,
    currentCycle: 5,
    totalCycles: 8,
    currentRecipient: "Chioma Obi",
    nextRecipient: "Emeka Eze",
    startDate: "2025-01-05",
    nextDueDate: "2026-07-05",
    healthScore: 98,
    membersPaidThisCycle: 10,
  },
  {
    id: "group-2",
    name: "Friends Ajo",
    description: "Friends savings group",
    status: "active",
    contributionAmount: 15000,
    totalMembers: 10,
    currentCycle: 3,
    totalCycles: 6,
    currentRecipient: "David Mensah",
    nextRecipient: "Sarah Yusuf",
    startDate: "2025-07-05",
    nextDueDate: "2026-07-05",
    healthScore: 94,
    membersPaidThisCycle: 8,
  },
  {
    id: "group-3",
    name: "Office Savings Circle",
    description: "Workplace savings circle",
    status: "active",
    contributionAmount: 10000,
    totalMembers: 15,
    currentCycle: 7,
    totalCycles: 12,
    currentRecipient: "Helen Adeyemi",
    nextRecipient: "Paul Okon",
    startDate: "2024-12-01",
    nextDueDate: "2026-07-10",
    healthScore: 91,
    membersPaidThisCycle: 12,
  },
  {
    id: "group-4",
    name: "Market Women Adapta",
    description: "Market women cooperative savings",
    status: "pending",
    contributionAmount: 5000,
    totalMembers: 20,
    currentCycle: 0,
    totalCycles: 20,
    currentRecipient: null,
    nextRecipient: null,
    startDate: "2026-08-01",
    nextDueDate: null,
  },
  {
    id: "group-5",
    name: "Alumni Elects",
    description: "Alumni association savings",
    status: "completed",
    contributionAmount: 25000,
    totalMembers: 8,
    currentCycle: 8,
    totalCycles: 8,
    currentRecipient: null,
    nextRecipient: null,
    startDate: "2025-01-01",
    nextDueDate: null,
  },
];

// Upcoming contributions

export const contributions: Contribution[] = [
  {
    id: "contrib-1",
    groupId: "group-2",
    groupName: "Friends Ajo",
    amount: 15000,
    dueDate: "2026-06-10",
    status: "pending",
    cycle: 3,
  },
  {
    id: "contrib-2",
    groupId: "group-3",
    groupName: "Office Savings Circle",
    amount: 10000,
    dueDate: "2026-06-12",
    status: "pending",
    cycle: 7,
  },
  {
    id: "contrib-3",
    groupId: "group-1",
    groupName: "Family Ajo",
    amount: 20000,
    dueDate: "2026-06-05",
    status: "paid",
    cycle: 5,
  },
];

// Dashboard summary stats

export const dashboardStats: DashboardStats = {
  totalGroups: 5,
  activeGroups: 3,
  monthlyCommitment: 45000,
  upcomingContributions: 2,
  upcomingPayouts: 1,
  creditAccess: 96,
};

// Payout order per group

export const payoutOrders: Record<string, PayoutMember[]> = {
  "group-1": [
    { position: 1, name: "Chioma Okafor", contributionStatus: "paid" },
    { position: 2, name: "Emeka Nwosu", contributionStatus: "paid" },
    { position: 3, name: "Aisha Bello", contributionStatus: "paid" },
    { position: 4, name: "Tunde Adeyemi", contributionStatus: "paid" },
    { position: 5, name: "Ngozi Eze", contributionStatus: "paid" },
    { position: 6, name: "Kene Ibe", contributionStatus: "paid" },
    { position: 7, name: "Funke Cole", contributionStatus: "paid" },
    { position: 8, name: "Ada Okonkwo", contributionStatus: "paid" },
    { position: 9, name: "Bayo Adesanya", contributionStatus: "paid" },
    { position: 10, name: "Chidi Nwosu", contributionStatus: "paid" },
    { position: 11, name: "Dayo Peters", contributionStatus: "pending" },
    { position: 12, name: "Sola Ibrahim", contributionStatus: "pending" },
  ],
  "group-2": [
    { position: 1, name: "David Mensah", contributionStatus: "paid" },
    { position: 2, name: "Sarah Yusuf", contributionStatus: "paid" },
    { position: 3, name: "Ola Bakare", contributionStatus: "paid" },
    { position: 4, name: "Taiwo Adewale", contributionStatus: "paid" },
    { position: 5, name: "Ngozi Eze", contributionStatus: "paid" },
    { position: 6, name: "Kene Ibe", contributionStatus: "paid" },
    { position: 7, name: "Amaka Osei", contributionStatus: "paid" },
    { position: 8, name: "Emeka Nwosu", contributionStatus: "paid" },
    { position: 9, name: "Fatima Sule", contributionStatus: "pending" },
    { position: 10, name: "Jide Adeyemi", contributionStatus: "pending" },
  ],
  "group-3": [
    { position: 1, name: "Helen Adeyemi", contributionStatus: "paid" },
    { position: 2, name: "Paul Okon", contributionStatus: "paid" },
    { position: 3, name: "Tunde Bakare", contributionStatus: "paid" },
    { position: 4, name: "Amaka Obi", contributionStatus: "paid" },
    { position: 5, name: "Seun Afolabi", contributionStatus: "paid" },
    { position: 6, name: "Kene Ibe", contributionStatus: "paid" },
    { position: 7, name: "Chidinma Eze", contributionStatus: "paid" },
    { position: 8, name: "Biodun Salami", contributionStatus: "paid" },
    { position: 9, name: "Nkechi Okafor", contributionStatus: "paid" },
    { position: 10, name: "Rotimi Cole", contributionStatus: "paid" },
    { position: 11, name: "Yetunde Musa", contributionStatus: "paid" },
    { position: 12, name: "Adaeze Nwosu", contributionStatus: "paid" },
    { position: 13, name: "Chukwudi Eze", contributionStatus: "pending" },
    { position: 14, name: "Folake Adesanya", contributionStatus: "pending" },
    { position: 15, name: "Gbenga Okonkwo", contributionStatus: "pending" },
  ],
};

// Contributions per group (current cycle)

export const groupContributions: Record<string, GroupContribution[]> = {
  "group-1": [
    { id: "gc-1-1",  memberName: "Chioma Okafor",   paymentMethod: "Bank Transfer", date: "2026-06-02", amount: 20000, status: "approved" },
    { id: "gc-1-2",  memberName: "Emeka Nwosu",      paymentMethod: "Opay",          date: "2026-06-03", amount: 20000, status: "approved" },
    { id: "gc-1-3",  memberName: "Aisha Bello",      paymentMethod: "PalmPay",       date: "2026-06-04", amount: 20000, status: "approved" },
    { id: "gc-1-4",  memberName: "Tunde Adeyemi",    paymentMethod: "Moniepoint",    date: "2026-06-04", amount: 20000, status: "approved" },
    { id: "gc-1-5",  memberName: "Ngozi Eze",        paymentMethod: "Bank Transfer", date: "2026-06-05", amount: 20000, status: "approved" },
    { id: "gc-1-6",  memberName: "Kene Ibe",         paymentMethod: "Opay",          date: "2026-06-05", amount: 20000, status: "approved" },
    { id: "gc-1-7",  memberName: "Funke Cole",       paymentMethod: "Moniepoint",    date: "2026-06-06", amount: 20000, status: "approved" },
    { id: "gc-1-8",  memberName: "Ada Okonkwo",      paymentMethod: "PalmPay",       date: "2026-06-07", amount: 20000, status: "approved" },
    { id: "gc-1-9",  memberName: "Bayo Adesanya",    paymentMethod: "Bank Transfer", date: "2026-06-07", amount: 20000, status: "approved" },
    { id: "gc-1-10", memberName: "Chidi Nwosu",      paymentMethod: "Opay",          date: "2026-06-08", amount: 20000, status: "approved" },
    { id: "gc-1-11", memberName: "Dayo Peters",      paymentMethod: "PalmPay",       date: "2026-06-09", amount: 20000, status: "pending"  },
    { id: "gc-1-12", memberName: "Sola Ibrahim",     paymentMethod: "Bank Transfer", date: "2026-06-09", amount: 20000, status: "overdue"  },
  ],
  "group-2": [
    { id: "gc-2-1", memberName: "David Mensah",   paymentMethod: "Bank Transfer", date: "2026-06-01", amount: 15000, status: "approved" },
    { id: "gc-2-2", memberName: "Sarah Yusuf",    paymentMethod: "Opay",          date: "2026-06-02", amount: 15000, status: "approved" },
    { id: "gc-2-3", memberName: "Ola Bakare",     paymentMethod: "PalmPay",       date: "2026-06-03", amount: 15000, status: "approved" },
    { id: "gc-2-4", memberName: "Taiwo Adewale",  paymentMethod: "Moniepoint",    date: "2026-06-04", amount: 15000, status: "approved" },
    { id: "gc-2-5", memberName: "Ngozi Eze",      paymentMethod: "Bank Transfer", date: "2026-06-04", amount: 15000, status: "approved" },
    { id: "gc-2-6", memberName: "Kene Ibe",       paymentMethod: "Opay",          date: "2026-06-05", amount: 15000, status: "approved" },
    { id: "gc-2-7", memberName: "Amaka Osei",     paymentMethod: "PalmPay",       date: "2026-06-06", amount: 15000, status: "approved" },
    { id: "gc-2-8", memberName: "Emeka Nwosu",    paymentMethod: "Bank Transfer", date: "2026-06-07", amount: 15000, status: "approved" },
    { id: "gc-2-9", memberName: "Fatima Sule",    paymentMethod: "Moniepoint",    date: "2026-06-08", amount: 15000, status: "pending"  },
    { id: "gc-2-10", memberName: "Jide Adeyemi",  paymentMethod: "Bank Transfer", date: "2026-06-09", amount: 15000, status: "overdue"  },
  ],
  "group-3": [
    { id: "gc-3-1",  memberName: "Helen Adeyemi",   paymentMethod: "Bank Transfer", date: "2026-06-01", amount: 10000, status: "approved" },
    { id: "gc-3-2",  memberName: "Paul Okon",        paymentMethod: "Opay",          date: "2026-06-02", amount: 10000, status: "approved" },
    { id: "gc-3-3",  memberName: "Tunde Bakare",     paymentMethod: "PalmPay",       date: "2026-06-02", amount: 10000, status: "approved" },
    { id: "gc-3-4",  memberName: "Amaka Obi",        paymentMethod: "Moniepoint",    date: "2026-06-03", amount: 10000, status: "approved" },
    { id: "gc-3-5",  memberName: "Seun Afolabi",     paymentMethod: "Bank Transfer", date: "2026-06-03", amount: 10000, status: "approved" },
    { id: "gc-3-6",  memberName: "Kene Ibe",         paymentMethod: "Opay",          date: "2026-06-04", amount: 10000, status: "approved" },
    { id: "gc-3-7",  memberName: "Chidinma Eze",     paymentMethod: "PalmPay",       date: "2026-06-05", amount: 10000, status: "approved" },
    { id: "gc-3-8",  memberName: "Biodun Salami",    paymentMethod: "Bank Transfer", date: "2026-06-05", amount: 10000, status: "approved" },
    { id: "gc-3-9",  memberName: "Nkechi Okafor",    paymentMethod: "Moniepoint",    date: "2026-06-06", amount: 10000, status: "approved" },
    { id: "gc-3-10", memberName: "Rotimi Cole",      paymentMethod: "Opay",          date: "2026-06-06", amount: 10000, status: "approved" },
    { id: "gc-3-11", memberName: "Yetunde Musa",     paymentMethod: "PalmPay",       date: "2026-06-07", amount: 10000, status: "approved" },
    { id: "gc-3-12", memberName: "Adaeze Nwosu",     paymentMethod: "Bank Transfer", date: "2026-06-07", amount: 10000, status: "approved" },
    { id: "gc-3-13", memberName: "Chukwudi Eze",     paymentMethod: "Moniepoint",    date: "2026-06-08", amount: 10000, status: "pending"  },
    { id: "gc-3-14", memberName: "Folake Adesanya",  paymentMethod: "Bank Transfer", date: "2026-06-09", amount: 10000, status: "pending"  },
    { id: "gc-3-15", memberName: "Gbenga Okonkwo",   paymentMethod: "Opay",          date: "2026-06-09", amount: 10000, status: "overdue"  },
  ],
};

// Contribution health

export const contributionHealth: ContributionHealth = {
  onTime: 42,
  late: 3,
  penalties: 1,
  approvalRate: 96,
}

// ─────────────────────────────────────────────
// Contribution records (for /dashboard/contributions)
// ─────────────────────────────────────────────

export type ContributionRecord = {
  id: string
  groupId: string
  groupName: string
  cycleNumber: number
  amount: number
  dueDate: string
  status: 'pending' | 'approved' | 'under_review' | 'rejected'
  recipientName: string | null
  paymentMethod: string | null
  submittedAt: string | null
}

export const contributionRecords: ContributionRecord[] = [
  // Pending — shows in "Due now" banner
  {
    id: 'cr-1', groupId: 'group-1', groupName: 'Family Ajo',
    cycleNumber: 4, amount: 20000, dueDate: '2026-07-01', status: 'pending',
    recipientName: 'Emeka Eze', paymentMethod: null, submittedAt: null,
  },
  // History
  {
    id: 'cr-2', groupId: 'group-1', groupName: 'Family Ajo',
    cycleNumber: 3, amount: 20000, dueDate: '2026-06-05', status: 'approved',
    recipientName: 'Chioma Obi', paymentMethod: 'Opay', submittedAt: '2026-06-02',
  },
  {
    id: 'cr-3', groupId: 'group-2', groupName: 'Friends Ajo',
    cycleNumber: 2, amount: 15000, dueDate: '2026-06-10', status: 'under_review',
    recipientName: 'David Mensah', paymentMethod: 'Bank Transfer', submittedAt: '2026-06-04',
  },
  {
    id: 'cr-4', groupId: 'group-3', groupName: 'Office Savings Circle',
    cycleNumber: 7, amount: 10000, dueDate: '2026-06-10', status: 'rejected',
    recipientName: 'Helen Adeyemi', paymentMethod: 'Moniepoint', submittedAt: '2026-06-01',
  },
  {
    id: 'cr-5', groupId: 'group-1', groupName: 'Family Ajo',
    cycleNumber: 2, amount: 20000, dueDate: '2026-05-05', status: 'approved',
    recipientName: 'Ada Okonkwo', paymentMethod: 'Cash', submittedAt: '2026-05-03',
  },
  {
    id: 'cr-6', groupId: 'group-2', groupName: 'Friends Ajo',
    cycleNumber: 1, amount: 15000, dueDate: '2026-04-10', status: 'approved',
    recipientName: 'Ola Bakare', paymentMethod: 'PalmPay', submittedAt: '2026-04-09',
  },
  {
    id: 'cr-7', groupId: 'group-3', groupName: 'Office Savings Circle',
    cycleNumber: 6, amount: 10000, dueDate: '2026-05-10', status: 'approved',
    recipientName: 'Paul Okon', paymentMethod: 'Bank Transfer', submittedAt: '2026-05-08',
  },
];

// ─────────────────────────────────────────────
// Cycles (for /dashboard/cycles)
// ─────────────────────────────────────────────

export type FeaturedCycleMember = {
  id: string
  name: string
  isCurrentUser: boolean
  amount: number
  status: 'approved' | 'pending' | 'overdue'
}

export type FeaturedCycle = {
  groupId: string
  groupName: string
  cycleNumber: number
  totalCycles: number
  recipientName: string
  dueDate: string
  contributionsReceived: number
  totalContributions: number
  amountReceived: number
  totalAmount: number
  members: FeaturedCycleMember[]
}

export type UpcomingCycle = {
  id: string
  groupId: string
  groupName: string
  cycleNumber: number
  totalCycles: number
  recipientName: string
  dueDate: string
  status: 'active' | 'upcoming'
}

export type CycleStats = {
  activeCycles: number
  activeGroupsCount: number
  payoutPosition: number
  payoutGroupName: string
  nextPayoutDate: string
  nextPayoutTotal: number
}

export const cycleStats: CycleStats = {
  activeCycles: 3,
  activeGroupsCount: 3,
  payoutPosition: 5,
  payoutGroupName: 'Family Ajo',
  nextPayoutDate: '2026-08-01',
  nextPayoutTotal: 160000,
}

export const featuredCycles: FeaturedCycle[] = [
  {
    groupId: 'group-1',
    groupName: 'Family Ajo',
    cycleNumber: 4,
    totalCycles: 8,
    recipientName: 'Chioma Okafor',
    dueDate: '2026-07-01',
    contributionsReceived: 6,
    totalContributions: 8,
    amountReceived: 120000,
    totalAmount: 160000,
    members: [
      { id: 'fc-1-1', name: 'Kene Ibe',       isCurrentUser: true,  amount: 20000, status: 'approved' },
      { id: 'fc-1-2', name: 'Emeka Nwosu',    isCurrentUser: false, amount: 20000, status: 'approved' },
      { id: 'fc-1-3', name: 'Ngozi Eze',      isCurrentUser: false, amount: 20000, status: 'approved' },
      { id: 'fc-1-4', name: 'Tunde Idowu',    isCurrentUser: false, amount: 20000, status: 'pending'  },
      { id: 'fc-1-5', name: 'Amara Musa',     isCurrentUser: false, amount: 20000, status: 'overdue'  },
      { id: 'fc-1-6', name: 'Chioma Okafor',  isCurrentUser: false, amount: 20000, status: 'approved' },
      { id: 'fc-1-7', name: 'Ada Okonkwo',    isCurrentUser: false, amount: 20000, status: 'approved' },
      { id: 'fc-1-8', name: 'Bayo Adesanya',  isCurrentUser: false, amount: 20000, status: 'pending'  },
    ],
  },
  {
    groupId: 'group-2',
    groupName: 'Friends Ajo',
    cycleNumber: 2,
    totalCycles: 6,
    recipientName: 'Zainab Yusuf',
    dueDate: '2026-07-05',
    contributionsReceived: 7,
    totalContributions: 10,
    amountReceived: 105000,
    totalAmount: 150000,
    members: [
      { id: 'fc-2-1',  name: 'Kene Ibe',       isCurrentUser: true,  amount: 15000, status: 'approved' },
      { id: 'fc-2-2',  name: 'Zainab Yusuf',   isCurrentUser: false, amount: 15000, status: 'approved' },
      { id: 'fc-2-3',  name: 'David Mensah',   isCurrentUser: false, amount: 15000, status: 'approved' },
      { id: 'fc-2-4',  name: 'Sarah Yusuf',    isCurrentUser: false, amount: 15000, status: 'approved' },
      { id: 'fc-2-5',  name: 'Ola Bakare',     isCurrentUser: false, amount: 15000, status: 'approved' },
      { id: 'fc-2-6',  name: 'Taiwo Adewale',  isCurrentUser: false, amount: 15000, status: 'approved' },
      { id: 'fc-2-7',  name: 'Amaka Osei',     isCurrentUser: false, amount: 15000, status: 'approved' },
      { id: 'fc-2-8',  name: 'Emeka Nwosu',    isCurrentUser: false, amount: 15000, status: 'pending'  },
      { id: 'fc-2-9',  name: 'Fatima Sule',    isCurrentUser: false, amount: 15000, status: 'pending'  },
      { id: 'fc-2-10', name: 'Jide Adeyemi',   isCurrentUser: false, amount: 15000, status: 'overdue'  },
    ],
  },
  {
    groupId: 'group-3',
    groupName: 'Office Savings Circle',
    cycleNumber: 7,
    totalCycles: 12,
    recipientName: 'Paul Okoro',
    dueDate: '2026-07-03',
    contributionsReceived: 10,
    totalContributions: 15,
    amountReceived: 100000,
    totalAmount: 150000,
    members: [
      { id: 'fc-3-1',  name: 'Kene Ibe',        isCurrentUser: true,  amount: 10000, status: 'approved' },
      { id: 'fc-3-2',  name: 'Paul Okoro',       isCurrentUser: false, amount: 10000, status: 'approved' },
      { id: 'fc-3-3',  name: 'Helen Adeyemi',    isCurrentUser: false, amount: 10000, status: 'approved' },
      { id: 'fc-3-4',  name: 'Tunde Bakare',     isCurrentUser: false, amount: 10000, status: 'approved' },
      { id: 'fc-3-5',  name: 'Amaka Obi',        isCurrentUser: false, amount: 10000, status: 'approved' },
      { id: 'fc-3-6',  name: 'Seun Afolabi',     isCurrentUser: false, amount: 10000, status: 'approved' },
      { id: 'fc-3-7',  name: 'Chidinma Eze',     isCurrentUser: false, amount: 10000, status: 'approved' },
      { id: 'fc-3-8',  name: 'Biodun Salami',    isCurrentUser: false, amount: 10000, status: 'approved' },
      { id: 'fc-3-9',  name: 'Nkechi Okafor',    isCurrentUser: false, amount: 10000, status: 'approved' },
      { id: 'fc-3-10', name: 'Rotimi Cole',      isCurrentUser: false, amount: 10000, status: 'approved' },
      { id: 'fc-3-11', name: 'Yetunde Musa',     isCurrentUser: false, amount: 10000, status: 'pending'  },
      { id: 'fc-3-12', name: 'Adaeze Nwosu',     isCurrentUser: false, amount: 10000, status: 'pending'  },
      { id: 'fc-3-13', name: 'Chukwudi Eze',     isCurrentUser: false, amount: 10000, status: 'pending'  },
      { id: 'fc-3-14', name: 'Folake Adesanya',  isCurrentUser: false, amount: 10000, status: 'overdue'  },
      { id: 'fc-3-15', name: 'Gbenga Okonkwo',   isCurrentUser: false, amount: 10000, status: 'overdue'  },
    ],
  },
]

export const upcomingCycles: UpcomingCycle[] = [
  {
    id: 'uc-1',
    groupId: 'group-2',
    groupName: 'Friends Ajo',
    cycleNumber: 2,
    totalCycles: 6,
    recipientName: 'Zainab Yusuf',
    dueDate: '2026-07-05',
    status: 'active',
  },
  {
    id: 'uc-2',
    groupId: 'group-3',
    groupName: 'Office Savings Circle',
    cycleNumber: 7,
    totalCycles: 12,
    recipientName: 'Paul Okoro',
    dueDate: '2026-07-03',
    status: 'active',
  },
  {
    id: 'uc-3',
    groupId: 'group-1',
    groupName: 'Family Ajo',
    cycleNumber: 5,
    totalCycles: 8,
    recipientName: 'Emeka Nwosu',
    dueDate: '2026-08-01',
    status: 'upcoming',
  },
]

// ─────────────────────────────────────────────
// Notifications (for /dashboard/notifications)
// ─────────────────────────────────────────────

export type NotificationType =
  | 'contribution_due'
  | 'governance_vote'
  | 'contribution_rejected'
  | 'contribution_approved'
  | 'member_joined'
  | 'cycle_completed'

export type NotificationItem = {
  id: string
  type: NotificationType
  groupId: string
  groupName: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

// ─────────────────────────────────────────────
// Settings (for /dashboard/settings)
// ─────────────────────────────────────────────

export type NotificationPreferences = {
  contributionReminders: boolean
  contributionApprovals: boolean
  governanceVotes: boolean
  penaltyAlerts: boolean
  emailNotifications: boolean
}

export type SettingsUser = {
  name: string
  email: string
  phone: string
  location: string
  notificationPreferences: NotificationPreferences
}

export const settingsUser: SettingsUser = {
  name: 'Kene Obi',
  email: 'kene@example.com',
  phone: '+234 800 000 0000',
  location: 'Lagos, Nigeria',
  notificationPreferences: {
    contributionReminders: true,
    contributionApprovals: true,
    governanceVotes: true,
    penaltyAlerts: false,
    emailNotifications: true,
  },
}

// ─────────────────────────────────────────────

export const notificationItems: NotificationItem[] = [
  // Today (2026-06-11) — unread
  {
    id: 'notif-1',
    type: 'contribution_due',
    groupId: 'group-1',
    groupName: 'Family Ajo',
    title: 'Contribution due in 8 days — Family Ajo',
    message: 'Your ₦20,000 contribution for Cycle 4 is due Jul 1, 2026. **Chioma Okafor** is the recipient.',
    isRead: false,
    createdAt: '2026-06-11T09:00:00',
  },
  {
    id: 'notif-2',
    type: 'governance_vote',
    groupId: 'group-2',
    groupName: 'Friends Ajo',
    title: 'Governance vote required — Friends Ajo',
    message: '**Tunde Idowu** proposed removing **Amara Musa** from the group. Your vote is needed. Expires in 6 days.',
    isRead: false,
    createdAt: '2026-06-11T06:00:00',
  },
  {
    id: 'notif-3',
    type: 'contribution_rejected',
    groupId: 'group-3',
    groupName: 'Office Savings Circle',
    title: 'Contribution rejected — Office Savings Circle',
    message: 'Your ₦10,000 submission for Cycle 7 was rejected. Reason: "Receipt is not legible." Please re-upload.',
    isRead: false,
    createdAt: '2026-06-11T03:00:00',
  },
  // Yesterday (2026-06-10) — read
  {
    id: 'notif-4',
    type: 'contribution_approved',
    groupId: 'group-1',
    groupName: 'Family Ajo',
    title: 'Contribution approved — Family Ajo',
    message: 'Your ₦20,000 contribution for Cycle 3 has been approved by **Chioma Okafor**.',
    isRead: true,
    createdAt: '2026-06-10T14:00:00',
  },
  {
    id: 'notif-5',
    type: 'member_joined',
    groupId: 'group-3',
    groupName: 'Office Savings Circle',
    title: 'New member joined — Office Savings Circle',
    message: '**Paul Okoro** accepted the invitation and joined the group. Payout position: **#11**.',
    isRead: true,
    createdAt: '2026-06-10T10:00:00',
  },
  // Earlier
  {
    id: 'notif-6',
    type: 'cycle_completed',
    groupId: 'group-1',
    groupName: 'Family Ajo',
    title: 'Cycle 3 completed — Family Ajo',
    message: 'All 8 contributions were received. ₦160,000 was paid out to **Kene Ibe** (you!).',
    isRead: true,
    createdAt: '2026-06-03T12:00:00',
  },
];
