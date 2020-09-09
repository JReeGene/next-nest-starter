import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import Banner from '../components/Banner'
import Button from '../components/Button'
import Input from '../components/Input'
import Layout from '../components/Layout'
import Panel from '../components/Panel'
import api, { ApiError } from '../lib/api'
import useAuth, { AuthOptions } from '../lib/auth'
import styles from '../styles/Login.module.css'

const authOptions: AuthOptions = {
  redirectLoggedIn: '/',
}

function Login(): React.ReactElement {
  const authContext = useAuth(authOptions)
  const router = useRouter()

  let { next } = router.query
  if (Array.isArray(next)) next = next[0]
  const query = next ? { next } : undefined

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    let user
    try {
      user = await api.login(email, password)
    } catch (error) {
      if (error instanceof ApiError) {
        setError(
          error.message === 'Unauthorized'
            ? 'Invalid email or password'
            : error.message,
        )
        return
      }
      throw error
    } finally {
      setSubmitting(false)
    }

    authContext.login(user)
    await router.push((next as string) || '/')
  }

  return (
    <Layout title="Log in" next={next}>
      <div className={styles.container}>
        <Panel title="Log in">
          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
            <Button color="green" disabled={submitting}>
              Log in
            </Button>
            <div className={styles.register}>
              <span>Don&apos;t have an account yet? </span>
              <Link href={{ pathname: '/register', query }}>
                <a className={styles.registerLink}>Sign up</a>
              </Link>
            </div>
          </form>
        </Panel>
        {error && (
          <Banner type="error" onClose={() => setError('')}>
            {error}
          </Banner>
        )}
      </div>
    </Layout>
  )
}

Login.getInitialProps = async () => ({ authOptions })

export default Login
