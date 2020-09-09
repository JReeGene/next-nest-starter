import Head from 'next/head'
import React from 'react'
import Footer from './Footer'
import Header from './Header'
import styles from '../styles/Layout.module.css'

type Props = {
  title?: string
  next?: string
}

export default function Layout({
  children,
  title = 'your description',
  next,
}: React.PropsWithChildren<Props>): React.ReactElement {
  return (
    <>
      <Head>
        <title>{`next-nest-starter | ${title}`}</title>
      </Head>
      <Header next={next} />
      <div className={styles.content}>{children}</div>
      <Footer />
    </>
  )
}
