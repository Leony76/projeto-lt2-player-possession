import Input from '@/components/Input'
import React from 'react'
import styles from './css/Register.module.css'
import Button from '@/components/Button'
import { Link } from 'react-router-dom'

const Register = (): React.JSX.Element => {
  return (
    <div className={styles.container}>
      <div className={styles.form_container}>
        <h1 className={styles.login_h1}>
          Register
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

          <Input
            label='Repeat Password'
            type='password'
          />
        </div>

        <Button
          label='Sign up'
        />

        <p className={styles.already_have_an_account}>
          Already have an account? 

          <Link 
          to={'/'}
          className={styles.sign_in}
          > 
            Sign in! 
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register