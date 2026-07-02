import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Heading, Text, Stack, Input } from './index';

/**
 * FormElements section — a visual catalog of form input elements
 * in the Figma design system, rendered on the signature lime
 * color-block section surface used for the contact form.
 *
 * Composition: mono uppercase eyebrow -> h2 heading -> responsive
 * grid of form fields (text inputs, textarea) -> submit CTA.
 * Every value traces back to var(--token-*).
 */
const FormElements = () => {
  return (
    <section
      style={{
        backgroundColor: 'var(--color-block-lime)',
        borderRadius: 'var(--rounded-lg)',
        padding: 'var(--spacing-xxl)',
        fontFeatureSettings: '"kern"',
      }}
    >
      {/* Inner content container */}
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        {/* Section header: eyebrow + heading + description */}
        <Stack gap="md" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <Text variant="caption">06 — Form Elements</Text>
          <Heading level={2} style={{ color: 'var(--color-ink)' }}>
            We&apos;d love to hear from you
          </Heading>
          <Text
            variant="body"
            as="p"
            style={{
              fontSize: 'var(--font-size-body-lg)',
              fontWeight: 'var(--font-weight-body-lg)',
              lineHeight: 'var(--line-height-body-lg)',
              letterSpacing: 'var(--letter-spacing-body-lg)',
              maxWidth: '600px',
              color: 'var(--color-ink)',
            }}
          >
            Tell us about your project, ask a question, or just say hello.
            Our team typically responds within one business day.
          </Text>
        </Stack>

        {/* Two-column grid of form fields */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--spacing-lg)',
          }}
        >
          {/* First name */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-xxs)',
            }}
          >
            <Text variant="caption">First Name</Text>
            <Input placeholder="First name" />
          </div>

          {/* Last name */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-xxs)',
            }}
          >
            <Text variant="caption">Last Name</Text>
            <Input placeholder="Last name" />
          </div>

          {/* Email — full width */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-xxs)',
              gridColumn: '1 / -1',
            }}
          >
            <Text variant="caption">Email</Text>
            <Input placeholder="you@example.com" type="email" />
          </div>

          {/* Company */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-xxs)',
            }}
          >
            <Text variant="caption">Company</Text>
            <Input placeholder="Company name" />
          </div>

          {/* Role */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-xxs)',
            }}
          >
            <Text variant="caption">Role</Text>
            <Input placeholder="e.g. Product Designer" />
          </div>

          {/* Message textarea — full width */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-xxs)',
              gridColumn: '1 / -1',
            }}
          >
            <Text variant="caption">Message</Text>
            <textarea
              placeholder="Tell us more about your needs..."
              style={{
                backgroundColor: 'var(--color-canvas)',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-body)',
                lineHeight: 'var(--line-height-body)',
                letterSpacing: 'var(--letter-spacing-body)',
                padding: '12px 14px',
                borderRadius: 'var(--rounded-md)',
                border: '1px solid var(--color-hairline)',
                outline: 'none',
                width: '100%',
                minHeight: '120px',
                boxSizing: 'border-box',
                resize: 'vertical',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                fontFeatureSettings: '"kern"',
              }}
            />
          </div>
        </div>

        {/* Submit CTA right-aligned */}
        <div
          style={{
            marginTop: 'var(--spacing-xl)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="primary" size="md">
            Send message
          </Button>
        </div>
      </div>
    </section>
  );
};

FormElements.displayName = 'FormElements';

const meta: Meta<typeof FormElements> = {
  title: 'Design System/figma/FormElements',
  component: FormElements,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof FormElements>;

export const Default: Story = {};
