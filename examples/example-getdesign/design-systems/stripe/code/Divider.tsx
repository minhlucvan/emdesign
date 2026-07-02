import React from 'react';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
}

/* ---- Component ---- */

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  style,
  ...props
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <hr
      role="separator"
      aria-orientation={orientation}
      style={{
        margin: 0,
        border: 'none',
        backgroundColor: 'var(--color-border)',
        ...(isHorizontal
          ? { width: '100%', height: '1px' }
          : { width: '1px', height: 'auto', alignSelf: 'stretch' }),
        ...style,
      }}
      {...props}
    />
  );
};

export default Divider;
