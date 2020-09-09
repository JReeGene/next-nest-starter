import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useRef, useState } from 'react'
import Banner from '../components/Banner'
import Button from '../components/Button'
import Input from '../components/Input'
import Layout from '../components/Layout'
import Panel from '../components/Panel'
import api, { ApiError } from '../lib/api'
import useAuth, { AuthOptions } from '../lib/auth'
import styles from '../styles/Register.module.css'

const authOptions: AuthOptions = {
  redirectLoggedIn: '/',
}

function Register(): React.ReactElement {
  const authContext = useAuth(authOptions)
  const router = useRouter()

  let { next } = router.query
  if (Array.isArray(next)) next = next[0]
  const query = next ? { next } : undefined

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const passwordConfirmationInputRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  function handlePasswordConfirmationChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    event.target.setCustomValidity('')
    setPasswordConfirmation(event.target.value)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password !== passwordConfirmation) {
      passwordConfirmationInputRef.current?.setCustomValidity(
        'Passwords must match',
      )
      event.currentTarget.reportValidity()
      return
    }

    setSubmitting(true)

    let user
    try {
      user = await api.register({
        firstName,
        lastName,
        email,
        password,
      })
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
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
    <Layout title="Sign up" next={next}>
      <div className={styles.container}>
        <Panel title="Sign up">
          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              name="firstName"
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
            <Input
              name="lastName"
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
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
            <Input
              name="passwordConfirmation"
              type="password"
              placeholder="Confirm password"
              value={passwordConfirmation}
              onChange={handlePasswordConfirmationChange}
              ref={passwordConfirmationInputRef}
              minLength={8}
              required
            />
            <Button color="green" disabled={submitting}>
              Sign up
            </Button>
            <div className={styles.login}>
              <span>Already have an account? </span>
              <Link href={{ pathname: '/login', query }}>
                <a className={styles.loginLink}>Log in</a>
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

Register.getInitialProps = async () => ({ authOptions })

export default Register
