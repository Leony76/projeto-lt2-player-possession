import React from 'react';
import styles from './css/Home.module.css';
import { FaHome } from "react-icons/fa";
import Layout from './Layout';
import PageTitle from '@/components/PageTitle';

const Home = (): React.JSX.Element => {
  return (
    <Layout tab='HOME'>
      <div className={styles.container}>
        <PageTitle
          Icon={() => <FaHome/>}
          title='Home'
        />

        
      </div>
    </Layout>
  )
}

export default Home