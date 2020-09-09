import classNames from 'classnames'
import React from 'react'
import styles from '../styles/Input.module.css'

type Props = React.InputHTMLAttributes<HTMLInputElement>

function Input(
  { children, className, ...inputProps }: Props,
  ref: React.Ref<HTMLInputElement>,
): React.ReactElement {
  return (
    <input
      className={classNames(styles.input, className)}
      ref={ref}
      {...inputProps}
    >
      {children}
    </input>
  )
}

export default React.forwardRef<HTMLInputElement, Props>(Input)
