import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Heading, Text, Stack, Card, Badge } from './index';

/** A single row in the dashboard payments table */
const TableRow: React.FC<{
  desc: string;
  amount: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
}> = ({ desc, amount, status, date }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 100px 120px',
      gap: 'var(--space-md)',
      padding: 'var(--space-sm) var(--space-md)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      alignItems: 'center',
    }}
  >
    <Text
      variant="body"
      style={{
        fontFeatureSettings: '"ss01"',
        color: 'var(--color-on-primary)',
        fontSize: 'var(--font-size-body-tabular)',
        margin: 0,
      }}
    >
      {desc}
    </Text>
    <Text
      variant="body"
      style={{
        fontFeatureSettings: '"tnum"',
        color: 'var(--color-on-primary)',
        fontSize: 'var(--font-size-body-tabular)',
        textAlign: 'right',
        margin: 0,
      }}
    >
      {amount}
    </Text>
    <Badge
      variant={
        status === 'success'
          ? 'accent'
          : status === 'pending'
            ? 'warn'
            : 'danger'
      }
    >
      {status}
    </Badge>
    <Text
      variant="caption"
      style={{
        color: 'rgba(255,255,255,0.5)',
        margin: 0,
        textAlign: 'right',
      }}
    >
      {date}
    </Text>
  </div>
);

/* ---- Dashboard Mockup ---- */

export const DashboardMockupSection: React.FC = () => (
  <div
    style={{
      fontFamily: 'var(--font-sans)',
      WebkitFontSmoothing: 'antialiased',
      padding: 'var(--space-huge) var(--space-xxl)',
      maxWidth: '1100px',
      margin: '0 auto',
    }}
  >
    <Heading level={2}>Dashboard Mockup</Heading>
    <Text
      variant="body"
      style={{
        color: 'var(--color-ink-mute)',
        marginTop: 'var(--space-sm)',
        marginBottom: 'var(--space-xxl)',
      }}
    >
      Dark-app dashboard surface — the brand's featured tier and product UI use
      deep navy canvas with tabular money type.
    </Text>

    <div
      style={{
        backgroundColor: 'var(--color-brand-dark-900)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-raised)',
      }}
    >
      {/* Dashboard Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-xl) var(--space-xxl)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Stack direction="row" gap="xl" align="center">
          <Heading
            level={6}
            style={{
              color: 'var(--color-on-primary)',
              margin: 0,
              fontSize: 'var(--font-size-heading-sm)',
              letterSpacing: 'var(--letter-spacing-heading-sm)',
            }}
          >
            Stripe
          </Heading>
          <Text
            variant="body"
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 'var(--font-size-body-tabular)',
              margin: 0,
            }}
          >
            Payments
          </Text>
          <Text
            variant="body"
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 'var(--font-size-body-tabular)',
              margin: 0,
            }}
          >
            Balance
          </Text>
          <Text
            variant="body"
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 'var(--font-size-body-tabular)',
              margin: 0,
            }}
          >
            Reports
          </Text>
        </Stack>
        <Stack direction="row" gap="md" align="center">
          <Text
            variant="caption"
            style={{
              color: 'rgba(255,255,255,0.5)',
              margin: 0,
            }}
          >
            test@example.com
          </Text>
          <Button
            variant="primary"
            size="sm"
            style={{
              backgroundColor: 'var(--color-brand-dark-900)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'var(--color-on-primary)',
            }}
          >
            Settings
          </Button>
        </Stack>
      </div>

      {/* Balance Card */}
      <div
        style={{
          padding: 'var(--space-xl) var(--space-xxl)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 'var(--space-xl)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div>
          <Text
            variant="caption"
            style={{
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--letter-spacing-micro-cap)',
              fontSize: 'var(--font-size-micro-cap)',
              margin: 0,
              marginBottom: 'var(--space-xs)',
            }}
          >
            Available balance
          </Text>
          <Heading
            level={2}
            style={{
              color: 'var(--color-on-primary)',
              fontFeatureSettings: '"tnum"',
              margin: 0,
            }}
          >
            $24,850.00
          </Heading>
        </div>
        <div>
          <Text
            variant="caption"
            style={{
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--letter-spacing-micro-cap)',
              fontSize: 'var(--font-size-micro-cap)',
              margin: 0,
              marginBottom: 'var(--space-xs)',
            }}
          >
            Pending
          </Text>
          <Heading
            level={2}
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontFeatureSettings: '"tnum"',
              margin: 0,
            }}
          >
            $3,210.00
          </Heading>
        </div>
        <div>
          <Text
            variant="caption"
            style={{
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--letter-spacing-micro-cap)',
              fontSize: 'var(--font-size-micro-cap)',
              margin: 0,
              marginBottom: 'var(--space-xs)',
            }}
          >
            Payouts
          </Text>
          <Heading
            level={2}
            style={{
              color: 'var(--color-primary-soft)',
              fontFeatureSettings: '"tnum"',
              margin: 0,
            }}
          >
            View
          </Heading>
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: 'var(--space-md) var(--space-xxl) var(--space-xl)' }}>
        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 100px 120px',
            gap: 'var(--space-md)',
            padding: 'var(--space-sm) var(--space-md)',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <Text
            variant="caption"
            style={{
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              fontSize: 'var(--font-size-micro-cap)',
              letterSpacing: '0.5px',
              margin: 0,
            }}
          >
            Description
          </Text>
          <Text
            variant="caption"
            style={{
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              fontSize: 'var(--font-size-micro-cap)',
              letterSpacing: '0.5px',
              textAlign: 'right',
              margin: 0,
            }}
          >
            Amount
          </Text>
          <Text
            variant="caption"
            style={{
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              fontSize: 'var(--font-size-micro-cap)',
              letterSpacing: '0.5px',
              margin: 0,
            }}
          >
            Status
          </Text>
          <Text
            variant="caption"
            style={{
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              fontSize: 'var(--font-size-micro-cap)',
              letterSpacing: '0.5px',
              textAlign: 'right',
              margin: 0,
            }}
          >
            Date
          </Text>
        </div>

        <TableRow
          desc="Stripe Subscription — acct_1M..."
          amount="$45.00"
          status="success"
          date="Jul 1, 2025"
        />
        <TableRow
          desc="One-time payment — invoice_9K..."
          amount="$2,400.00"
          status="success"
          date="Jun 30, 2025"
        />
        <TableRow
          desc="Refund — charge_4F..."
          amount="−$120.00"
          status="success"
          date="Jun 29, 2025"
        />
        <TableRow
          desc="Transfer — payout_8D..."
          amount="$1,250.00"
          status="pending"
          date="Jun 28, 2025"
        />
        <TableRow
          desc="Failed charge — card_6H..."
          amount="$89.00"
          status="failed"
          date="Jun 27, 2025"
        />
      </div>

      {/* Bottom action bar */}
      <div
        style={{
          padding: 'var(--space-lg) var(--space-xxl)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          variant="caption"
          style={{
            color: 'rgba(255,255,255,0.4)',
            margin: 0,
            fontSize: 'var(--font-size-caption)',
          }}
        >
          1–5 of 128 transactions
        </Text>
        <Stack direction="row" gap="sm">
          <Button
            variant="secondary"
            size="sm"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'var(--color-on-primary)',
            }}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'var(--color-on-primary)',
            }}
          >
            Next
          </Button>
        </Stack>
      </div>
    </div>
  </div>
);

const meta: Meta = {
  title: 'Design System/stripe/Dashboard Mockup',
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => <DashboardMockupSection />,
};
