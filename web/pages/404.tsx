import Link from 'next/link'
import React from 'react'
import Layout from '../components/Layout'
import styles from '../styles/Errors.module.css'

export default function NotFound(): React.ReactElement {
  return (
    <Layout title="Not found">
      <div className={styles.container}>
        <h1 className={styles.heading}>Not found!</h1>
        <div className={styles.body}>
          <span>
            The link you followed may be broken, or the page may have been
            removed.
          </span>
          <Link href="/">
            <a className={styles.link}> Go back home.</a>
          </Link>
        </div>
      </div>
    </Layout>
  )
}
