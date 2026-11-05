import React from 'react'
import styles from './css/MyItems.module.css';
import Layout from './Layout';
import PageTitle from '@/components/PageTitle';
import { FaBoxOpen } from 'react-icons/fa';


const MyItems = (): React.JSX.Element => {
  return (
    <Layout tab='MY_ITEMS'>
      <div className={styles.container}>
        <PageTitle
          Icon={() => <FaBoxOpen />}
          title='My Items'
        />
      </div>
    </Layout>
  )
}

export default MyItems