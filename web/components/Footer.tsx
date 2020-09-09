import Link from 'next/link'
import React from 'react'
import styles from '../styles/Footer.module.css'

export default function Footer(): React.ReactElement {
  return (
    <footer className={styles.container}>
      <Link href="/">
        <a>Home</a>
      </Link>
      <Link href="/about">
        <a>About</a>
      </Link>
      <Link href="/">
        <a>First link</a>
      </Link>
      <Link href="/">
        <a>Second link</a>
      </Link>
      <div>&copy; {new Date().getFullYear()}</div>
    </footer>
  )
}
