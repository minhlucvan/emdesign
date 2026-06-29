// Sample component with deliberately hardcoded design decisions, used by
// extract.test.ts. Mix of near-duplicate dark colors, a sufficiently distant
// dark color, a single rare red value, repeated spacing and inline utility
// classes (bg-surface / text-accent).
export function Card() {
  return (
    <div
      style={{
        backgroundColor: '#0a0a0a',
        borderColor: '#1a1a1a',
        padding: '16px',
      }}
      className="bg-surface text-accent"
    >
      <span style={{ color: '#0a0a0a' }}>a</span>
      <span style={{ color: '#0a0a0a' }}>b</span>
      <span style={{ background: '#0b0b0b' }}>c</span>
      <span style={{ borderColor: '#1a1a1a', margin: '16px' }}>d</span>
      <span style={{ color: '#ff0000' }}>rare</span>
    </div>
  );
}
