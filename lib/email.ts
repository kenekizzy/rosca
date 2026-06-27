import React from 'react'
import { Resend } from 'resend'
import { render } from '@react-email/render'

import InvitationEmail, { type InvitationEmailProps } from '@/emails/InvitationEmail'
import ContributionReminderEmail, {
  type ContributionReminderEmailProps,
} from '@/emails/ContributionReminderEmail'
import ContributionApprovedEmail, {
  type ContributionApprovedEmailProps,
} from '@/emails/ContributionApprovedEmail'
import ContributionRejectedEmail, {
  type ContributionRejectedEmailProps,
} from '@/emails/ContributionRejectedEmail'
import PenaltyEmail, { type PenaltyEmailProps } from '@/emails/PenaltyEmail'
import GovernanceVoteEmail, { type GovernanceVoteEmailProps } from '@/emails/GovernanceVoteEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? 'AjoFlow <onboarding@resend.dev>'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

type SendResult = { success: boolean }

async function sendRendered(
  to: string,
  subject: string,
  element: React.ReactElement,
): Promise<SendResult> {
  try {
    const html = await render(element)
    const { error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) throw error
    return { success: true }
  } catch (err) {
    console.error('[email]', err)
    return { success: false }
  }
}

export async function sendInvitationEmail(props: InvitationEmailProps): Promise<SendResult> {
  return sendRendered(
    props.to,
    `You've been invited to join ${props.groupName} on AjoFlow`,
    React.createElement(InvitationEmail, props),
  )
}

export async function sendContributionReminderEmail(
  props: ContributionReminderEmailProps,
): Promise<SendResult> {
  return sendRendered(
    props.to,
    `Reminder: your contribution to ${props.groupName} is due on ${props.dueDate}`,
    React.createElement(ContributionReminderEmail, props),
  )
}

export async function sendContributionApprovedEmail(
  props: ContributionApprovedEmailProps,
): Promise<SendResult> {
  return sendRendered(
    props.to,
    `Your contribution to ${props.groupName} has been approved`,
    React.createElement(ContributionApprovedEmail, props),
  )
}

export async function sendContributionRejectedEmail(
  props: ContributionRejectedEmailProps,
): Promise<SendResult> {
  return sendRendered(
    props.to,
    `Action required: your contribution to ${props.groupName} was rejected`,
    React.createElement(ContributionRejectedEmail, props),
  )
}

export async function sendPenaltyEmail(props: PenaltyEmailProps): Promise<SendResult> {
  return sendRendered(
    props.to,
    `A penalty has been applied to your ${props.groupName} account`,
    React.createElement(PenaltyEmail, props),
  )
}

export async function sendGovernanceVoteEmail(
  props: GovernanceVoteEmailProps,
): Promise<SendResult> {
  return sendRendered(
    props.to,
    `Vote required: ${props.proposalType} — ${props.groupName}`,
    React.createElement(GovernanceVoteEmail, props),
  )
}
