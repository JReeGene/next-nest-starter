import Link from 'next/link'
import React from 'react'
import Layout from '../components/Layout'
import styles from '../styles/Errors.module.css'

export default function Error(): React.ReactElement {
  return (
    <Layout title="Error">
      <div className={styles.container}>
        <h1 className={styles.heading}>Error</h1>
        <div className={styles.body}>
          <span>An error occurred! Please try again later.</span>
          <Link href="/">
            <a className={styles.link}> Go back home.</a>
          </Link>
        </div>
      </div>
    </Layout>
  )
}
