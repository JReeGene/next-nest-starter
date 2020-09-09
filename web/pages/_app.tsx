import App, { AppContext, AppProps } from 'next/app'
import React from 'react'
import { authenticateOnServer, AuthProvider } from '../lib/auth'
import '../styles/global.css'
import User from '../types/User'

type Props = {
  initialUser: User | null
}

function CustomApp({
  Component,
  pageProps,
  initialUser,
}: AppProps & Props): React.ReactElement {
  return (
    <AuthProvider initialUser={initialUser}>
      <Component {...pageProps} />
    </AuthProvider>
  )
}

CustomApp.getInitialProps = async (appContext: AppContext): Promise<Props> => {
  const appProps = await App.getInitialProps(appContext)

  // Cold page load on server, check authentication and redirect if necessary
  let initialUser: User | null = null
  const { req: request, res: response } = appContext.ctx
  if (typeof window === 'undefined' && request && response) {
    const { authOptions } = appProps.pageProps
    initialUser = await authenticateOnServer(request, response, authOptions)
  }

  return {
    ...appProps,
    initialUser,
  }
}

export default CustomApp
