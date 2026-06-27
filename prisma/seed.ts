import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  GroupStatus,
  MembershipStatus,
  UserRole,
  CycleStatus,
  ContributionStatus,
  PaymentMethod,
  PenaltyType,
  PenaltyStatus,
  InvitationStatus,
  NotificationType,
  ProposalType,
  ProposalStatus,
  VoteChoice,
} from '../generated/prisma/enums'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ─────────────────────────────────────────────
// USERS — all @yopmail.com, Password@123
// ─────────────────────────────────────────────

const USERS = [
  { id: 'user-kene',    name: 'Kene Ibe',        email: 'kene.ibe@yopmail.com' },
  { id: 'user-chioma',  name: 'Chioma Okafor',    email: 'chioma.okafor@yopmail.com' },
  { id: 'user-emeka',   name: 'Emeka Nwosu',      email: 'emeka.nwosu@yopmail.com' },
  { id: 'user-aisha',   name: 'Aisha Bello',      email: 'aisha.bello@yopmail.com' },
  { id: 'user-tunde',   name: 'Tunde Adeyemi',    email: 'tunde.adeyemi@yopmail.com' },
  { id: 'user-ngozi',   name: 'Ngozi Eze',        email: 'ngozi.eze@yopmail.com' },
  { id: 'user-david',   name: 'David Mensah',     email: 'david.mensah@yopmail.com' },
  { id: 'user-sarah',   name: 'Sarah Yusuf',      email: 'sarah.yusuf@yopmail.com' },
  { id: 'user-ola',     name: 'Ola Bakare',       email: 'ola.bakare@yopmail.com' },
  { id: 'user-taiwo',   name: 'Taiwo Adewale',    email: 'taiwo.adewale@yopmail.com' },
  { id: 'user-helen',   name: 'Helen Adeyemi',    email: 'helen.adeyemi@yopmail.com' },
  { id: 'user-paul',    name: 'Paul Okon',        email: 'paul.okon@yopmail.com' },
  { id: 'user-amaka',   name: 'Amaka Osei',       email: 'amaka.osei@yopmail.com' },
  { id: 'user-fatima',  name: 'Fatima Sule',      email: 'fatima.sule@yopmail.com' },
  { id: 'user-biodun',  name: 'Biodun Salami',    email: 'biodun.salami@yopmail.com' },
]

// ─────────────────────────────────────────────
// GROUP MEMBERSHIP LAYOUTS
// ─────────────────────────────────────────────

// Group 1: Family Ajo (ACTIVE) — 6 members, starts April 30, 2026
// Kene is in position 3 (receives Cycle 3)
const G1_MEMBERS = [
  { userId: 'user-chioma', position: 1, role: UserRole.OWNER },
  { userId: 'user-emeka',  position: 2, role: UserRole.MEMBER },
  { userId: 'user-kene',   position: 3, role: UserRole.MEMBER },
  { userId: 'user-aisha',  position: 4, role: UserRole.MEMBER },
  { userId: 'user-tunde',  position: 5, role: UserRole.MEMBER },
  { userId: 'user-ngozi',  position: 6, role: UserRole.MEMBER },
]

// Group 2: Friends Ajo (ACTIVE) — 5 members, starts May 31, 2026
// Kene is in position 2
const G2_MEMBERS = [
  { userId: 'user-david',  position: 1, role: UserRole.OWNER },
  { userId: 'user-kene',   position: 2, role: UserRole.MEMBER },
  { userId: 'user-sarah',  position: 3, role: UserRole.MEMBER },
  { userId: 'user-ola',    position: 4, role: UserRole.MEMBER },
  { userId: 'user-taiwo',  position: 5, role: UserRole.MEMBER },
]

// Group 3: Office Circle (ACTIVE) — 8 members, starts June 30, 2026
// Kene is in position 4, cycle 1 is UPCOMING (starts June 30)
const G3_MEMBERS = [
  { userId: 'user-helen',  position: 1, role: UserRole.OWNER },
  { userId: 'user-paul',   position: 2, role: UserRole.MEMBER },
  { userId: 'user-amaka',  position: 3, role: UserRole.MEMBER },
  { userId: 'user-kene',   position: 4, role: UserRole.MEMBER },
  { userId: 'user-fatima', position: 5, role: UserRole.MEMBER },
  { userId: 'user-biodun', position: 6, role: UserRole.MEMBER },
  { userId: 'user-emeka',  position: 7, role: UserRole.MEMBER },
  { userId: 'user-ngozi',  position: 8, role: UserRole.MEMBER },
]

// Group 4: Market Women Adapta (PENDING_MEMBERS) — Kene is owner
const G4_INVITED = ['user-chioma', 'user-david', 'user-aisha', 'user-tunde', 'user-helen', 'user-sarah']

// ─────────────────────────────────────────────
// DATE HELPERS
// ─────────────────────────────────────────────

function eom(year: number, month: number): Date {
  // End of month: first day of next month minus 1 day
  return new Date(year, month, 0) // month is 1-indexed here, Date uses 0-indexed month
}

// End-of-month dates
const APR_30 = new Date('2026-04-30')
const MAY_31 = new Date('2026-05-31')
const JUN_30 = new Date('2026-06-30')
const JUL_31 = new Date('2026-07-31')
const AUG_31 = new Date('2026-08-31')
const SEP_30 = new Date('2026-09-30')
const OCT_31 = new Date('2026-10-31')
const NOV_30 = new Date('2026-11-30')

// ─────────────────────────────────────────────
// CLEAN SLATE — delete all in reverse order
// ─────────────────────────────────────────────

async function cleanDb() {
  console.log('  → Cleaning database...')
  await prisma.activityLog.deleteMany()
  await prisma.vote.deleteMany()
  await prisma.proposal.deleteMany()
  await prisma.penalty.deleteMany()
  await prisma.contributionEvidence.deleteMany()
  await prisma.contribution.deleteMany()
  await prisma.cycle.deleteMany()
  await prisma.invitation.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.membership.deleteMany()
  await prisma.group.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

async function main() {
  console.log('Seeding database...')
  await cleanDb()

  // ── USERS ──────────────────────────────────
  console.log('  → Users')
  const passwordHash = await bcrypt.hash('Password@123', 10)
  const defaultPrefs = {
    contributionReminders: true,
    contributionApprovals: true,
    governanceVotes: true,
    penaltyAlerts: true,
    emailNotifications: false,
  }

  for (const u of USERS) {
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: new Date(),
        passwordHash,
        notificationPrefs: defaultPrefs,
      },
    })
  }

  // ── GROUP 1: Family Ajo (ACTIVE) ────────────
  console.log('  → Group 1: Family Ajo')
  await prisma.group.create({
    data: {
      id: 'group-1',
      name: 'Family Ajo',
      description: 'Monthly family savings group',
      contributionAmount: 20000,
      memberCount: 6,
      startDate: APR_30,
      gracePeriodDays: 7,
      penaltyType: PenaltyType.FIXED,
      penaltyValue: 1000,
      status: GroupStatus.ACTIVE,
    },
  })

  for (const m of G1_MEMBERS) {
    await prisma.membership.create({
      data: {
        id: `g1-mem-${m.position}`,
        userId: m.userId,
        groupId: 'group-1',
        role: m.role,
        payoutPosition: m.position,
        status: MembershipStatus.ACTIVE,
        rulesAcceptedAt: new Date('2026-04-15'),
        penaltiesAcceptedAt: new Date('2026-04-15'),
      },
    })
  }

  // Cycle 1: April 30 - May 31 (COMPLETED, Chioma received)
  await prisma.cycle.create({
    data: {
      id: 'g1-cycle-1',
      groupId: 'group-1',
      recipientUserId: 'user-chioma',
      cycleNumber: 1,
      startDate: APR_30,
      endDate: MAY_31,
      dueDate: MAY_31,
      status: CycleStatus.COMPLETED,
    },
  })
  for (const m of G1_MEMBERS) {
    await prisma.contribution.create({
      data: {
        id: `g1-c1-${m.position}`,
        cycleId: 'g1-cycle-1',
        contributorId: m.userId,
        amount: 20000,
        status: ContributionStatus.APPROVED,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        submittedAt: new Date('2026-05-28'),
        reviewedAt: new Date('2026-05-29'),
        reviewedById: 'user-chioma',
      },
    })
  }

  // Cycle 2: May 31 - June 30 (ACTIVE, Emeka receiving)
  await prisma.cycle.create({
    data: {
      id: 'g1-cycle-2',
      groupId: 'group-1',
      recipientUserId: 'user-emeka',
      cycleNumber: 2,
      startDate: MAY_31,
      endDate: JUN_30,
      dueDate: JUN_30,
      status: CycleStatus.ACTIVE,
    },
  })
  const g1c2Statuses: Record<string, { status: ContributionStatus; method?: PaymentMethod }> = {
    'user-chioma': { status: ContributionStatus.APPROVED, method: PaymentMethod.BANK_TRANSFER },
    'user-emeka':  { status: ContributionStatus.APPROVED, method: PaymentMethod.OPAY },
    'user-kene':   { status: ContributionStatus.APPROVED, method: PaymentMethod.PALMPAY },
    'user-aisha':  { status: ContributionStatus.APPROVED, method: PaymentMethod.MONIEPOINT },
    'user-tunde':  { status: ContributionStatus.PENDING },
    'user-ngozi':  { status: ContributionStatus.OVERDUE },
  }
  for (const m of G1_MEMBERS) {
    const c = g1c2Statuses[m.userId]
    await prisma.contribution.create({
      data: {
        id: `g1-c2-${m.position}`,
        cycleId: 'g1-cycle-2',
        contributorId: m.userId,
        amount: 20000,
        status: c.status,
        paymentMethod: c.method ?? null,
        submittedAt: c.method ? new Date('2026-06-18') : null,
        reviewedAt: c.status === ContributionStatus.APPROVED ? new Date('2026-06-19') : null,
        reviewedById: c.status === ContributionStatus.APPROVED ? 'user-emeka' : null,
      },
    })
  }

  // Cycles 3-6: UPCOMING
  const g1UpcomingDates = [
    { start: JUN_30, end: JUL_31, due: JUL_31 },
    { start: JUL_31, end: AUG_31, due: AUG_31 },
    { start: AUG_31, end: SEP_30, due: SEP_30 },
    { start: SEP_30, end: OCT_31, due: OCT_31 },
  ]
  for (let i = 0; i < g1UpcomingDates.length; i++) {
    const cn = i + 3
    const d = g1UpcomingDates[i]
    await prisma.cycle.create({
      data: {
        id: `g1-cycle-${cn}`,
        groupId: 'group-1',
        recipientUserId: G1_MEMBERS[cn - 1].userId,
        cycleNumber: cn,
        startDate: d.start,
        endDate: d.end,
        dueDate: d.due,
        status: CycleStatus.UPCOMING,
      },
    })
  }

  // ── GROUP 2: Friends Ajo (ACTIVE) ────────────
  console.log('  → Group 2: Friends Ajo')
  await prisma.group.create({
    data: {
      id: 'group-2',
      name: 'Friends Ajo',
      description: 'Monthly savings with close friends',
      contributionAmount: 15000,
      memberCount: 5,
      startDate: MAY_31,
      gracePeriodDays: 7,
      penaltyType: PenaltyType.FIXED,
      penaltyValue: 500,
      status: GroupStatus.ACTIVE,
    },
  })
  for (const m of G2_MEMBERS) {
    await prisma.membership.create({
      data: {
        id: `g2-mem-${m.position}`,
        userId: m.userId,
        groupId: 'group-2',
        role: m.role,
        payoutPosition: m.position,
        status: MembershipStatus.ACTIVE,
        rulesAcceptedAt: new Date('2026-05-15'),
        penaltiesAcceptedAt: new Date('2026-05-15'),
      },
    })
  }

  // Cycle 1: May 31 - June 30 (ACTIVE, David receiving)
  await prisma.cycle.create({
    data: {
      id: 'g2-cycle-1',
      groupId: 'group-2',
      recipientUserId: 'user-david',
      cycleNumber: 1,
      startDate: MAY_31,
      endDate: JUN_30,
      dueDate: JUN_30,
      status: CycleStatus.ACTIVE,
    },
  })
  const g2c1Statuses: Record<string, { status: ContributionStatus; method?: PaymentMethod }> = {
    'user-david': { status: ContributionStatus.APPROVED, method: PaymentMethod.BANK_TRANSFER },
    'user-kene':  { status: ContributionStatus.APPROVED, method: PaymentMethod.OPAY },
    'user-sarah': { status: ContributionStatus.APPROVED, method: PaymentMethod.PALMPAY },
    'user-ola':   { status: ContributionStatus.PENDING },
    'user-taiwo': { status: ContributionStatus.OVERDUE },
  }
  for (const m of G2_MEMBERS) {
    const c = g2c1Statuses[m.userId]
    await prisma.contribution.create({
      data: {
        id: `g2-c1-${m.position}`,
        cycleId: 'g2-cycle-1',
        contributorId: m.userId,
        amount: 15000,
        status: c.status,
        paymentMethod: c.method ?? null,
        submittedAt: c.method ? new Date('2026-06-17') : null,
        reviewedAt: c.status === ContributionStatus.APPROVED ? new Date('2026-06-18') : null,
        reviewedById: c.status === ContributionStatus.APPROVED ? 'user-david' : null,
      },
    })
  }

  // Cycles 2-5: UPCOMING
  const g2UpcomingDates = [
    { start: JUN_30, end: JUL_31, due: JUL_31 },
    { start: JUL_31, end: AUG_31, due: AUG_31 },
    { start: AUG_31, end: SEP_30, due: SEP_30 },
    { start: SEP_30, end: OCT_31, due: OCT_31 },
  ]
  for (let i = 0; i < g2UpcomingDates.length; i++) {
    const cn = i + 2
    const d = g2UpcomingDates[i]
    await prisma.cycle.create({
      data: {
        id: `g2-cycle-${cn}`,
        groupId: 'group-2',
        recipientUserId: G2_MEMBERS[cn - 1].userId,
        cycleNumber: cn,
        startDate: d.start,
        endDate: d.end,
        dueDate: d.due,
        status: CycleStatus.UPCOMING,
      },
    })
  }

  // ── GROUP 3: Office Circle (ACTIVE) ──────────
  console.log('  → Group 3: Office Circle')
  await prisma.group.create({
    data: {
      id: 'group-3',
      name: 'Office Circle',
      description: 'Workplace savings circle',
      contributionAmount: 10000,
      memberCount: 8,
      startDate: JUN_30,
      gracePeriodDays: 5,
      penaltyType: PenaltyType.FIXED,
      penaltyValue: 500,
      status: GroupStatus.ACTIVE,
    },
  })
  for (const m of G3_MEMBERS) {
    await prisma.membership.create({
      data: {
        id: `g3-mem-${m.position}`,
        userId: m.userId,
        groupId: 'group-3',
        role: m.role,
        payoutPosition: m.position,
        status: MembershipStatus.ACTIVE,
        rulesAcceptedAt: new Date('2026-06-10'),
        penaltiesAcceptedAt: new Date('2026-06-10'),
      },
    })
  }

  // Cycles 1-8: All UPCOMING (group starts June 30)
  const g3Dates = [
    { start: JUN_30, end: JUL_31, due: JUL_31 },
    { start: JUL_31, end: AUG_31, due: AUG_31 },
    { start: AUG_31, end: SEP_30, due: SEP_30 },
    { start: SEP_30, end: OCT_31, due: OCT_31 },
    { start: OCT_31, end: NOV_30, due: NOV_30 },
    { start: NOV_30, end: new Date('2027-01-31'), due: new Date('2027-01-31') },
    { start: new Date('2027-01-31'), end: new Date('2027-02-28'), due: new Date('2027-02-28') },
    { start: new Date('2027-02-28'), end: new Date('2027-03-31'), due: new Date('2027-03-31') },
  ]
  for (let i = 0; i < G3_MEMBERS.length; i++) {
    const d = g3Dates[i]
    await prisma.cycle.create({
      data: {
        id: `g3-cycle-${i + 1}`,
        groupId: 'group-3',
        recipientUserId: G3_MEMBERS[i].userId,
        cycleNumber: i + 1,
        startDate: d.start,
        endDate: d.end,
        dueDate: d.due,
        status: CycleStatus.UPCOMING,
      },
    })
  }

  // ── GROUP 4: Market Women Adapta (PENDING) ──
  console.log('  → Group 4: Market Women Adapta')
  await prisma.group.create({
    data: {
      id: 'group-4',
      name: 'Market Women Adapta',
      description: 'Community savings for market women',
      contributionAmount: 5000,
      memberCount: 7,
      startDate: AUG_31,
      gracePeriodDays: 5,
      penaltyType: PenaltyType.FIXED,
      penaltyValue: 250,
      status: GroupStatus.PENDING_MEMBERS,
    },
  })
  await prisma.membership.create({
    data: {
      id: 'g4-mem-owner',
      userId: 'user-kene',
      groupId: 'group-4',
      role: UserRole.OWNER,
      status: MembershipStatus.ACTIVE,
      rulesAcceptedAt: new Date('2026-06-20'),
      penaltiesAcceptedAt: new Date('2026-06-20'),
    },
  })
  for (let i = 0; i < G4_INVITED.length; i++) {
    await prisma.membership.create({
      data: {
        id: `g4-mem-${i + 2}`,
        userId: G4_INVITED[i],
        groupId: 'group-4',
        role: UserRole.MEMBER,
        status: MembershipStatus.INVITED,
      },
    })
    const userEmail = USERS.find((u) => u.id === G4_INVITED[i])!.email
    await prisma.invitation.create({
      data: {
        id: `inv-g4-${i + 1}`,
        groupId: 'group-4',
        email: userEmail,
        token: `inv-g4-tok-${i + 1}`,
        status: i < 2 ? InvitationStatus.ACCEPTED : InvitationStatus.PENDING,
        expiresAt: new Date('2026-07-20'),
      },
    })
  }

  // ── PENALTY (Ngozi, Group 1 Cycle 2 overdue) ─
  console.log('  → Penalties')
  await prisma.penalty.create({
    data: {
      id: 'penalty-1',
      membershipId: 'g1-mem-6',
      cycleId: 'g1-cycle-2',
      amount: 1000,
      reason: 'Overdue contribution — missed grace period',
      status: PenaltyStatus.PENDING,
      appliedAt: new Date('2026-06-20'),
    },
  })
  // Taiwo, Group 2 Cycle 1 overdue
  await prisma.penalty.create({
    data: {
      id: 'penalty-2',
      membershipId: 'g2-mem-5',
      cycleId: 'g2-cycle-1',
      amount: 500,
      reason: 'Overdue contribution — missed grace period',
      status: PenaltyStatus.PENDING,
      appliedAt: new Date('2026-06-20'),
    },
  })

  // ── PROPOSAL (payout order change in Group 1) ─
  console.log('  → Proposals')
  await prisma.proposal.create({
    data: {
      id: 'proposal-1',
      groupId: 'group-1',
      proposerId: 'user-chioma',
      type: ProposalType.CHANGE_PAYOUT_ORDER,
      metadata: {
        reason: 'Tunde requested to swap position with Ngozi due to a financial need.',
        swaps: [{ from: { userId: 'user-tunde', position: 5 }, to: { userId: 'user-ngozi', position: 6 } }],
      },
      status: ProposalStatus.PENDING,
      expiresAt: new Date('2026-06-29'),
      createdAt: new Date('2026-06-22'),
    },
  })
  // Partial votes so far
  for (const voterId of ['user-chioma', 'user-emeka', 'user-kene']) {
    await prisma.vote.create({
      data: {
        id: `vote-p1-${voterId}`,
        proposalId: 'proposal-1',
        voterId,
        vote: VoteChoice.APPROVE,
        votedAt: new Date('2026-06-22'),
      },
    })
  }

  // ── NOTIFICATIONS (for kene + relevant members) ─
  console.log('  → Notifications')

  const notifData = [
    // Kene — today (June 22)
    {
      id: 'notif-1',
      userId: 'user-kene',
      groupId: 'group-1',
      type: NotificationType.CONTRIBUTION_DUE,
      title: 'Contribution due soon',
      message: 'Your ₦20,000 contribution to **Family Ajo** is due on 30 Jun 2026.',
      isRead: false,
      actionUrl: '/dashboard/contributions',
      createdAt: new Date('2026-06-22T08:00:00Z'),
    },
    {
      id: 'notif-2',
      userId: 'user-kene',
      groupId: 'group-2',
      type: NotificationType.CONTRIBUTION_DUE,
      title: 'Contribution due soon',
      message: 'Your ₦15,000 contribution to **Friends Ajo** is due on 30 Jun 2026.',
      isRead: false,
      actionUrl: '/dashboard/contributions',
      createdAt: new Date('2026-06-22T08:05:00Z'),
    },
    // Kene — yesterday (June 21)
    {
      id: 'notif-3',
      userId: 'user-kene',
      groupId: 'group-1',
      type: NotificationType.CONTRIBUTION_APPROVED,
      title: 'Contribution approved',
      message: '**Emeka Nwosu** approved your ₦20,000 contribution to Family Ajo.',
      isRead: true,
      actionUrl: '/dashboard/contributions',
      createdAt: new Date('2026-06-21T14:30:00Z'),
    },
    {
      id: 'notif-4',
      userId: 'user-kene',
      groupId: 'group-2',
      type: NotificationType.CONTRIBUTION_APPROVED,
      title: 'Contribution approved',
      message: '**David Mensah** approved your ₦15,000 contribution to Friends Ajo.',
      isRead: false,
      actionUrl: '/dashboard/contributions',
      createdAt: new Date('2026-06-21T15:00:00Z'),
    },
    // Kene — June 22 (governance)
    {
      id: 'notif-5',
      userId: 'user-kene',
      groupId: 'group-1',
      type: NotificationType.PROPOSAL_CREATED,
      title: 'New governance proposal',
      message: '**Chioma Okafor** raised a payout order change proposal in Family Ajo. Your vote is needed.',
      isRead: false,
      actionUrl: '/dashboard/groups',
      createdAt: new Date('2026-06-22T09:00:00Z'),
    },
    // Kene — earlier
    {
      id: 'notif-6',
      userId: 'user-kene',
      groupId: 'group-1',
      type: NotificationType.PAYOUT_UPCOMING,
      title: 'Your payout is coming up',
      message: 'You are scheduled to receive ₦100,000 from **Family Ajo** in Cycle 3 (Jul 2026).',
      isRead: false,
      actionUrl: '/dashboard/cycles',
      createdAt: new Date('2026-06-19T10:00:00Z'),
    },
    {
      id: 'notif-7',
      userId: 'user-kene',
      groupId: 'group-4',
      type: NotificationType.MEMBER_JOINED,
      title: 'Group created',
      message: 'You created **Market Women Adapta**. Invitations have been sent to 6 members.',
      isRead: true,
      actionUrl: '/dashboard/groups',
      createdAt: new Date('2026-06-20T11:00:00Z'),
    },
    // Ngozi — penalty notification (only for group members)
    {
      id: 'notif-8',
      userId: 'user-ngozi',
      groupId: 'group-1',
      type: NotificationType.PENALTY_APPLIED,
      title: 'Penalty applied',
      message: 'A ₦1,000 penalty has been applied to your account in **Family Ajo** for an overdue contribution.',
      isRead: false,
      actionUrl: '/dashboard/groups',
      createdAt: new Date('2026-06-20T09:00:00Z'),
    },
    // Chioma — proposal she created + vote cast
    {
      id: 'notif-9',
      userId: 'user-chioma',
      groupId: 'group-1',
      type: NotificationType.PROPOSAL_CREATED,
      title: 'Proposal submitted',
      message: 'Your payout order change proposal in **Family Ajo** is now open for voting.',
      isRead: true,
      actionUrl: '/dashboard/groups',
      createdAt: new Date('2026-06-22T09:05:00Z'),
    },
    // Emeka — contribution due reminder
    {
      id: 'notif-10',
      userId: 'user-emeka',
      groupId: 'group-1',
      type: NotificationType.CONTRIBUTION_DUE,
      title: 'Contribution due soon',
      message: 'Your ₦20,000 contribution to **Family Ajo** is due on 30 Jun 2026.',
      isRead: false,
      actionUrl: '/dashboard/contributions',
      createdAt: new Date('2026-06-22T08:00:00Z'),
    },
  ]

  for (const n of notifData) {
    await prisma.notification.create({ data: n })
  }

  // ── ACTIVITY LOGS ───────────────────────────
  console.log('  → Activity logs')
  await prisma.activityLog.createMany({
    data: [
      { id: 'log-1',  groupId: 'group-1', actorId: 'user-chioma', actionType: 'GROUP_CREATED',          description: 'Chioma Okafor created Family Ajo.',                            createdAt: new Date('2026-04-15') },
      { id: 'log-2',  groupId: 'group-1', actorId: 'user-kene',   actionType: 'CONTRIBUTION_SUBMITTED',  description: 'Kene Ibe submitted ₦20,000 for Cycle 2.',                       createdAt: new Date('2026-06-18') },
      { id: 'log-3',  groupId: 'group-1', actorId: 'user-emeka',  actionType: 'CONTRIBUTION_APPROVED',   description: 'Emeka Nwosu approved Kene Ibe\'s contribution.',                 createdAt: new Date('2026-06-19') },
      { id: 'log-4',  groupId: 'group-1', actorId: 'user-ngozi',  actionType: 'PENALTY_APPLIED',         description: 'Ngozi Eze received a ₦1,000 penalty for overdue contribution.', createdAt: new Date('2026-06-20') },
      { id: 'log-5',  groupId: 'group-1', actorId: 'user-chioma', actionType: 'PROPOSAL_CREATED',        description: 'Chioma Okafor raised a payout order change proposal.',           createdAt: new Date('2026-06-22') },
      { id: 'log-6',  groupId: 'group-2', actorId: 'user-david',  actionType: 'GROUP_CREATED',           description: 'David Mensah created Friends Ajo.',                             createdAt: new Date('2026-05-15') },
      { id: 'log-7',  groupId: 'group-2', actorId: 'user-kene',   actionType: 'CONTRIBUTION_SUBMITTED',  description: 'Kene Ibe submitted ₦15,000 for Cycle 1.',                       createdAt: new Date('2026-06-17') },
      { id: 'log-8',  groupId: 'group-2', actorId: 'user-david',  actionType: 'CONTRIBUTION_APPROVED',   description: 'David Mensah approved Kene Ibe\'s contribution.',                createdAt: new Date('2026-06-18') },
      { id: 'log-9',  groupId: 'group-3', actorId: 'user-helen',  actionType: 'GROUP_CREATED',           description: 'Helen Adeyemi created Office Circle.',                          createdAt: new Date('2026-06-10') },
      { id: 'log-10', groupId: 'group-4', actorId: 'user-kene',   actionType: 'GROUP_CREATED',           description: 'Kene Ibe created Market Women Adapta.',                         createdAt: new Date('2026-06-20') },
    ],
  })

  console.log('Seed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
