import React from 'react'
import styles from '../styles/Panel.module.css'

type Props = {
  title?: string
}

export default function Panel({
  children,
  title,
}: React.PropsWithChildren<Props>): React.ReactElement {
  return (
    <div className={styles.panel}>
      {title && <h1 className={styles.title}>{title}</h1>}
      {children}
    </div>
  )
}
