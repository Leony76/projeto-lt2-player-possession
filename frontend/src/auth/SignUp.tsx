import Input from '@/components/Input'
import React, { useState } from 'react'
import styles from './css/SignUp.module.css'
import Button from '@/components/Button'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SignUpFormData, signUpSchema } from "../schemas/auth.schema";
import { AuthService } from '@/services/auth.service'
import { handleError } from '@/utils/handleError.util'
import ErrorMessage from '@/components/ErrorMessage'

const SignUp = (): React.JSX.Element => {

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username        : "",
      password        : "",
      confirmPassword : "",
    },
  });

  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const onSubmit = async(data: SignUpFormData) => {
    try {
      await AuthService.signUp({
        username: data.username,
        password: data.password,
      });

      navigate("/");
    } catch (error: unknown) {
      setErrorMessage(handleError(error));
    }
  }

  return (
    <div className={styles.container}>
      <form 
      onSubmit={handleSubmit(onSubmit)} 
      className={styles.form_container}
      >
        <h1 className={styles.login_h1}>
          Sign Up
        </h1>

        <div className={styles.inputs_container}>
          <Input
            label='Username'
            type='text'
            {...register("username")}
            error={errors.username?.message}
          />
          
          <Input
            label='Password'
            type='password'
            {...register("password")}
            error={errors.password?.message}
          />

          <Input
            label='Repeat Password'
            type='password'
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

           { errorMessage && <ErrorMessage error={errorMessage}/>}
        </div>

        <Button
          label={isSubmitting ? "Processing..." : "Sign Up"}
          type='submit'
          disabled={isSubmitting}
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
      </form>
    </div>
  )
}

export default SignUp