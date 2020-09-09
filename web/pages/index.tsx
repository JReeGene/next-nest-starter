import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import React from 'react'
import Layout from '../components/Layout'
import styles from '../styles/Home.module.css'

export default function Home(): React.ReactElement {
  const router = useRouter()
  const { logout } = router.query

  async function removeLogoutBanner() {
    await router.replace(router.pathname, undefined, { shallow: true })
  }

  return (
    <Layout>
      {logout && (
        <div className={styles.logout}>
          <span className={styles.spacer} />
          <span>You have been logged out.</span>
          <span className={styles.close} onClick={removeLogoutBanner}>
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </span>
        </div>
      )}
      <div className={styles.hero}>
        <h1 className={styles.title}>Your tagline</h1>
        <div className={styles.searchbar}>Searchbar goes here</div>
      </div>
    </Layout>
  )
}
