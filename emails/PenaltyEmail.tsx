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

export interface PenaltyEmailProps {
  to: string
  memberName: string
  groupName: string
  penaltyAmount: number
  reason: string
  dashboardUrl: string
}

export default function PenaltyEmail({
  memberName,
  groupName,
  penaltyAmount,
  reason,
  dashboardUrl,
}: PenaltyEmailProps) {
  const formattedAmount = `₦${penaltyAmount.toLocaleString()}`

  return (
    <Html>
      <Head />
      <Preview>
        A penalty of {formattedAmount} has been applied to your {groupName} account
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>AjoFlow</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Penalty Applied</Heading>
            <Text style={text}>Hi {memberName},</Text>
            <Text style={text}>
              A penalty has been applied to your account for <strong>{groupName}</strong>. Please
              review the details below and settle the penalty at your earliest convenience.
            </Text>

            <Section style={detailsBox}>
              <Text style={detailRow}>
                <strong>Group:</strong> {groupName}
              </Text>
              <Text style={detailRow}>
                <strong>Penalty Amount:</strong> {formattedAmount}
              </Text>
              <Text style={detailRow}>
                <strong>Reason:</strong> {reason}
              </Text>
            </Section>

            <Button style={button} href={dashboardUrl}>
              View Details
            </Button>

            <Text style={muted}>
              Penalty fees are defined in your group rules and must be settled to remain in good
              standing. Contact your group owner if you have questions.
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
  backgroundColor: '#fff7ed',
  border: '1px solid #fed7aa',
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
