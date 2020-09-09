import React, { useRef, useState } from 'react'
import Banner from '../components/Banner'
import Button from '../components/Button'
import Input from '../components/Input'
import Layout from '../components/Layout'
import Panel from '../components/Panel'
import api, { ApiError } from '../lib/api'
import useAuth, { AuthOptions } from '../lib/auth'
import styles from '../styles/Profile.module.css'
import User from '../types/User'

const authOptions: AuthOptions = {
  redirectLoggedOut: '/login?next=/profile',
}

type BannerState = {
  type: 'success' | 'error'
  message: string
}

function Profile(): React.ReactElement {
  const authContext = useAuth(authOptions)
  if (!authContext.user)
    throw new Error('Rendered protected page while logged out')
  const profile: User = authContext.user

  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bannerState, setBannerState] = useState<BannerState | null>(null)
  const passwordConfirmationInputRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState(profile.firstName)
  const [lastName, setLastName] = useState(profile.lastName)
  const [email, setEmail] = useState(profile.email)
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  function handlePasswordConfirmationChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    event.target.setCustomValidity('')
    setPasswordConfirmation(event.target.value)
  }

  function cancelEditing() {
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setEmail(profile.email)
    setPassword('')
    setPasswordConfirmation('')

    setBannerState(null)
    setEditing(false)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBannerState(null)

    if (password !== passwordConfirmation) {
      passwordConfirmationInputRef.current?.setCustomValidity(
        'Passwords must match',
      )
      event.currentTarget.reportValidity()
      return
    }

    setSubmitting(true)

    let updatedUser
    try {
      updatedUser = await api.updateUser(profile.id, {
        firstName,
        lastName,
        email,
        password: password || undefined,
      })
      setBannerState({
        type: 'success',
        message: 'Successfully updated profile',
      })
    } catch (error) {
      if (error instanceof ApiError) {
        setBannerState({
          type: 'error',
          message: error.message,
        })
        return
      }
      throw error
    } finally {
      setSubmitting(false)
    }

    authContext.login(updatedUser)
    setEditing(false)
  }

  return (
    <Layout title="Profile">
      <div className={styles.container}>
        <Panel title={`${editing ? 'Edit ' : ''}Profile`}>
          {editing ? (
            <div className={styles.content}>
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
                />
                <Input
                  name="passwordConfirmation"
                  type="password"
                  placeholder="Confirm password"
                  value={passwordConfirmation}
                  onChange={handlePasswordConfirmationChange}
                  ref={passwordConfirmationInputRef}
                  minLength={8}
                />
                <Button color="green" disabled={submitting}>
                  Save
                </Button>
              </form>
              <Button color="red" onClick={cancelEditing}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className={styles.content}>
              <div className={styles.profileGroup}>
                <span className={styles.label}>Name: </span>
                <span>
                  {profile.firstName} {profile.lastName}
                </span>
              </div>
              <div className={styles.profileGroup}>
                <span className={styles.label}>Email: </span>
                <span>{profile.email}</span>
              </div>
              <Button color="green" onClick={() => setEditing(true)}>
                Edit
              </Button>
            </div>
          )}
        </Panel>
        {bannerState && (
          <Banner type={bannerState.type} onClose={() => setBannerState(null)}>
            {bannerState.message}
          </Banner>
        )}
      </div>
    </Layout>
  )
}

Profile.getInitialProps = async () => ({ authOptions })

export default Profile
