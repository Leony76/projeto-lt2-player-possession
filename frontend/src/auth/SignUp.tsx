import Input from '@/components/Input'
import React, { useState } from 'react'
import styles from './css/SignUp.module.css'
import Button from '@/components/Button'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SignUpFormData, signUpSchema } from "@shared/schemas/auth.schema";
import { AuthService } from '@/services/auth.service'
import { handleError } from '@/utils/handleError.util'
import ErrorMessage from '@/components/ErrorMessage'
import { GiArchiveRegister } from 'react-icons/gi'

const SignUp = (): React.JSX.Element => {

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
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
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async(data: SignUpFormData) => {
    try {
      if (loading) return;
      setLoading(true);

      await AuthService.signUp({
        username: data.username,
        password: data.password,
      });

      navigate("/");
    } catch (error: unknown) {
      setErrorMessage(handleError(error));
    } finally {
      setLoading(false);
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
            placeholder='ex: username_123'
            {...register("username")}
            onClear={() => setValue('username', '')}
            error={errors.username?.message}
          />
          
          <Input
            label='Password'
            type='password'
            placeholder='********'
            {...register("password")}
            onClear={() => setValue('password', '')}
            error={errors.password?.message}
            />

          <Input
            label='Repeat Password'
            type='password'
            placeholder='********'
            {...register("confirmPassword")}
            onClear={() => setValue('confirmPassword', '')}
            error={errors.confirmPassword?.message}
          />

           { errorMessage && <ErrorMessage error={errorMessage}/>}
        </div>

        <Button
          label={isSubmitting ? "Processing..." : "Sign Up"}
          type='submit'
          disabled={isSubmitting}
          buttonStyle='FORM'
          loading={loading}
          icon={() => <GiArchiveRegister size={17}/>}
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