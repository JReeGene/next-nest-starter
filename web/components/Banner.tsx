import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import React from 'react'
import styles from '../styles/Banner.module.css'

type Props = {
  type: 'default' | 'success' | 'error'
  onClose: (event: React.MouseEvent) => void
}

export default function Banner({
  children,
  type = 'default',
  onClose,
}: React.PropsWithChildren<Props>): React.ReactElement {
  return (
    <div className={classNames(styles.container, styles[type])}>
      {children}
      <FontAwesomeIcon
        icon={faTimes}
        className={styles.closeIcon}
        onClick={onClose}
      />
    </div>
  )
}
