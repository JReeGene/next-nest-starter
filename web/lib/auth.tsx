import { IncomingMessage, ServerResponse } from 'http'
import { useRouter } from 'next/router'
import React, { createContext, useContext, useState } from 'react'
import User from '../types/User'
import api from './api'

type AuthContextInterface = {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextInterface>({
  user: null,
  login: () => {
    throw new Error('AuthContext not yet initialized')
  },
  logout: () => {
    throw new Error('AuthContext not yet initialized')
  },
})

export function AuthProvider({
  children,
  initialUser,
}: React.PropsWithChildren<{ initialUser: User | null }>): React.ReactElement {
  const [user, setUser] = useState<User | null>(initialUser)

  return (
    <AuthContext.Provider
      value={{
        user,
        login: setUser,
        logout: () => setUser(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export type AuthOptions = {
  redirectLoggedIn?: string
  redirectLoggedOut?: string
}

export default function useAuth(
  options: AuthOptions = {},
): AuthContextInterface {
  const router = useRouter()
  const userContext = useContext(AuthContext)
  const { user } = userContext
  const { redirectLoggedIn, redirectLoggedOut } = options

  if (user && redirectLoggedIn) {
    ;(async () => router.replace(redirectLoggedIn))()
  }

  if (!user && redirectLoggedOut) {
    ;(async () => router.replace(redirectLoggedOut))()
  }

  return userContext
}

export async function authenticateOnServer(
  request: IncomingMessage,
  response: ServerResponse,
  options?: AuthOptions,
): Promise<User | null> {
  const user = await api.getCurrentUser(request.headers.cookie)

  if (user && options?.redirectLoggedIn) {
    response.writeHead(302, { Location: options.redirectLoggedIn })
    response.end()
  } else if (!user && options?.redirectLoggedOut) {
    response.writeHead(302, { Location: options.redirectLoggedOut })
    response.end()
  }

  return user
}
