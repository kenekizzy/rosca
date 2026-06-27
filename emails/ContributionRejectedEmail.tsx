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

export interface ContributionRejectedEmailProps {
  to: string
  memberName: string
  groupName: string
  amount: number
  cycleNumber: number
  rejectionNote?: string
  dashboardUrl: string
}

export default function ContributionRejectedEmail({
  memberName,
  groupName,
  amount,
  cycleNumber,
  rejectionNote,
  dashboardUrl,
}: ContributionRejectedEmailProps) {
  const formattedAmount = `₦${amount.toLocaleString()}`

  return (
    <Html>
      <Head />
      <Preview>
        Action required: your contribution to {groupName} was rejected
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>AjoFlow</Heading>
          </Section>

          <Section style={content}>
            <Text style={badge}>✕ Rejected</Text>
            <Heading style={h1}>Contribution Rejected</Heading>
            <Text style={text}>Hi {memberName},</Text>
            <Text style={text}>
              Your contribution to <strong>{groupName}</strong> for Cycle {cycleNumber} has been
              rejected. Please resubmit with the correct payment evidence.
            </Text>

            <Section style={detailsBox}>
              <Text style={detailRow}>
                <strong>Group:</strong> {groupName}
              </Text>
              <Text style={detailRow}>
                <strong>Cycle:</strong> {cycleNumber}
              </Text>
              <Text style={detailRow}>
                <strong>Amount:</strong> {formattedAmount}
              </Text>
              {rejectionNote && (
                <Text style={detailRow}>
                  <strong>Reason:</strong> {rejectionNote}
                </Text>
              )}
            </Section>

            <Button style={button} href={dashboardUrl}>
              Resubmit Contribution
            </Button>

            <Text style={muted}>
              Upload a clear image or screenshot of your payment confirmation. Contact your group
              owner if you need assistance.
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

const badge = {
  backgroundColor: '#fee2e2',
  borderRadius: '999px',
  color: '#dc2626',
  display: 'inline-block',
  fontSize: '13px',
  fontWeight: '600',
  padding: '4px 12px',
  margin: '0 0 16px',
}

const h1 = { color: '#1f2937', fontSize: '22px', fontWeight: '700', margin: '0 0 16px' }

const text = { color: '#374151', fontSize: '15px', lineHeight: '24px', margin: '0 0 16px' }

const detailsBox = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '0 0 24px',
}

const detailRow = { color: '#374151', fontSize: '14px', margin: '0 0 8px' }

const button = {
  backgroundColor: '#dc2626',
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
