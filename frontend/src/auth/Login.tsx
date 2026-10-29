import React from 'react'
import styles from './css/Login.module.css'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { Link } from 'react-router-dom'

const Login = (): React.JSX.Element => {
  return (
    <div className={styles.container}>
      <div className={styles.form_container}>
        <h1 className={styles.login_h1}>
          Login
        </h1>

        <div className={styles.inputs_container}>
          <Input
            label='Username'
            type='text'
          />
          
          <Input
            label='Password'
            type='password'
          />
        </div>

        <Button
          label='Sign in'
        />

        <p className={styles.dont_have_an_account}>
          Don't have an account? 

          <Link 
          to={'/Register'}
          className={styles.sign_up}
          > 
            Sign up! 
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login