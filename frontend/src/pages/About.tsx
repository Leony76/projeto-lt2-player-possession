import React from 'react'
import Layout from './Layout'
import styles from './css/About.module.css'
import PageTitle from '@/components/PageTitle'
import { FaInfoCircle } from "react-icons/fa";

const About = (): React.JSX.Element => {
  return (
    <Layout tab='ABOUT'>
      <div className={styles.container}>
        <PageTitle
          Icon={() => <FaInfoCircle/>}
          title='About'
        />
      </div>
    </Layout>
  )
}

export default About