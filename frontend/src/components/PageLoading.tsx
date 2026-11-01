import React from 'react'
import styles from './css/PageLoading.module.css'
import LoadingSpinner from './LoadingSpinner'

const PageLoading = (): React.JSX.Element => {
  return (
    <div className={styles.container}>
      <div className={styles.inner_container}>
        <LoadingSpinner size={'3em'}/>

        <span className={styles.loading}>
          Loading...
        </span>
      </div>
    </div>
  )
}

export default PageLoading