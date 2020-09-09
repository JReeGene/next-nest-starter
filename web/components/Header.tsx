import { faUserCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import api from '../lib/api'
import useAuth from '../lib/auth'
import styles from '../styles/Header.module.css'

type Props = {
  next?: string
}

export default function Header({ next }: Props): React.ReactElement {
  const authContext = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const query = next ? { next } : undefined

  async function logout() {
    await api.logout()
    await router.push({ pathname: '/', query: { logout: true } })
    authContext.logout()
  }

  return (
    <header className={styles.container}>
      <Link href="/">
        <a className={styles.brand}>
          <img src="/logo.png" alt="Logo" className={styles.logo} />
          <span className={styles.name}>Next-Nest-Starter</span>
        </a>
      </Link>
      <div className={styles.menu}>
        <div className={classNames(styles.menuItem, styles.desktop)}>
          <Link href="/">
            <a className={styles.link}>First link</a>
          </Link>
        </div>
        <span className={classNames(styles.menuItem, styles.desktop)}>
          <Link href="/">
            <a className={styles.link}>Second link</a>
          </Link>
        </span>
        {authContext.user ? (
          <div className={styles.menuItem}>
            <FontAwesomeIcon
              icon={faUserCircle}
              size="2x"
              className={styles.userMenuIcon}
              onClick={() => setShowUserMenu(!showUserMenu)}
            />
            {showUserMenu && (
              <div className={styles.userMenu}>
                <Link href="/profile">
                  <a className={styles.userMenuItem}>Profile</a>
                </Link>
                <div className={styles.userMenuItem} onClick={logout}>
                  Log out
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={styles.menuItem}>
              <Link href={{ pathname: '/login', query }}>
                <a className={classNames(styles.link, styles.login)}>Log in</a>
              </Link>
            </div>
            <div className={styles.menuItem}>
              <Link href={{ pathname: '/register', query }}>
                <a className={classNames(styles.link, styles.register)}>
                  Sign up
                </a>
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
