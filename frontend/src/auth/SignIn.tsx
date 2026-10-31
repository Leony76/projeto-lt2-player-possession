import React, { useState } from 'react'
import styles from './css/SignIn.module.css'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInFormData } from "../schemas/auth.schema";
import { useAuth } from '@/contexts/AuthContext'
import { handleError } from '@/utils/handleError.util'
import ErrorMessage from '@/components/ErrorMessage'

const SignIn = (): React.JSX.Element => {

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username : "",
      password : "",
    },
  });

  const [errorMessage, setErrorMessage] = useState<string>('');

  const onSubmit = async(data: SignInFormData) => {
    try {
      await signIn(data);

      const destination = location.state?.from?.pathname;

      navigate(
        typeof destination === "string" ? destination : "/home",
        { replace: true },
      );
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
          Sign In
        </h1>

        <div className={styles.inputs_container}>
          <Input
            label='Username'
            type='text'
            error={errors.username?.message}
            {...register("username")}
          />

          <Input
            label='Password'
            type='password'
            error={errors.password?.message}
            {...register("password")}
          />

          { errorMessage && <ErrorMessage error={errorMessage}/>}
        </div>

        <Button
          label={isSubmitting ? "Processing..." : "Sign In"}
          type="submit"
          disabled={isSubmitting} 
        />

        <p className={styles.dont_have_an_account}>
          Don't have an account? 

          <Link 
          to={'/sign-up'}
          className={styles.sign_up}
          > 
            Sign up! 
          </Link>
        </p>
      </form>
    </div>
  )
}

export default SignIn