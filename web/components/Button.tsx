import classNames from 'classnames'
import React from 'react'
import styles from '../styles/Button.module.css'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'green' | 'red'
}

function Button(
  { children, className, color, ...buttonProps }: Props,
  ref: React.Ref<HTMLButtonElement>,
): React.ReactElement {
  return (
    <button
      className={classNames(styles.button, color && styles[color], className)}
      ref={ref}
      {...buttonProps}
    >
      {children}
    </button>
  )
}

export default React.forwardRef<HTMLButtonElement, Props>(Button)
