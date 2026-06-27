import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

export interface ContributionReminderEmailProps {
  to: string
  memberName: string
  groupName: string
  amount: number
  dueDate: string
  dashboardUrl: string
}

export default function ContributionReminderEmail({
  memberName,
  groupName,
  amount,
  dueDate,
  dashboardUrl,
}: ContributionReminderEmailProps) {
  const formattedAmount = `₦${amount.toLocaleString()}`

  return (
    <Html>
      <Head />
      <Preview>
        {formattedAmount} contribution due for {groupName} on {dueDate}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>AjoFlow</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Contribution Reminder</Heading>
            <Text style={text}>Hi {memberName},</Text>
            <Text style={text}>
              Your contribution to <strong>{groupName}</strong> is due soon. Please submit your
              payment evidence before the due date to avoid penalties.
            </Text>

            <Section style={detailsBox}>
              <Text style={detailRow}>
                <strong>Group:</strong> {groupName}
              </Text>
              <Text style={detailRow}>
                <strong>Amount Due:</strong> {formattedAmount}
              </Text>
              <Text style={detailRow}>
                <strong>Due Date:</strong> {dueDate}
              </Text>
            </Section>

            <Button style={button} href={dashboardUrl}>
              Submit Contribution
            </Button>

            <Text style={muted}>
              Log in to AjoFlow to upload your payment evidence. Late payments may incur a penalty
              as defined in your group rules.
            </Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>AjoFlow &mdash; Trusted Savings Groups</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = { backgroundColor: '#f9fafb', fontFamily: 'Arial, sans-serif' }

const container = { margin: '0 auto', padding: '20px 0', maxWidth: '560px' }

const header = {
  backgroundColor: '#15803d',
  borderRadius: '8px 8px 0 0',
  padding: '24px 32px',
}

const logo = { color: '#ffffff', fontSize: '24px', fontWeight: '700', margin: '0' }

const content = {
  backgroundColor: '#ffffff',
  borderRadius: '0 0 8px 8px',
  padding: '32px',
}

const h1 = { color: '#1f2937', fontSize: '22px', fontWeight: '700', margin: '0 0 16px' }

const text = { color: '#374151', fontSize: '15px', lineHeight: '24px', margin: '0 0 16px' }

const detailsBox = {
  backgroundColor: '#fefce8',
  border: '1px solid #fde68a',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '0 0 24px',
}

const detailRow = { color: '#374151', fontSize: '14px', margin: '0 0 8px' }

const button = {
  backgroundColor: '#15803d',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'block',
  fontSize: '15px',
  fontWeight: '600',
  padding: '12px 24px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  margin: '0 0 24px',
}

const muted = { color: '#6b7280', fontSize: '13px', lineHeight: '20px', margin: '0' }

const hr = { borderColor: '#e5e7eb', margin: '24px 0 16px' }

const footer = { color: '#9ca3af', fontSize: '12px', textAlign: 'center' as const, margin: '0' }
