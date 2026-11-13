import Input from '@/components/Input'
import React, { useState } from 'react'
import styles from './css/SignUp.module.css'
import Button from '@/components/Button'
import lumberTycoon2Logo from '@public/lumber_tycoon_2_logo.webp';
import fireAxeLogo from '@public/fire_axe_decal.webp';
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
      <div className={styles.form_container}>
        <div className={styles.logo_container}>
          <img 
            src={lumberTycoon2Logo} 
            alt="Lumber Tycoon 2 Logo" 
            width={150}
          />

          <img 
            src={fireAxeLogo} 
            className={styles.fire_axe_logo}
            alt="Player's Possession Logo" 
            width={50}
            height={50}
          />

          <h1>
            Player's Possession
          </h1>
        </div>

        <h2>
          Sign Up
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
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
        </form>

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

export default SignUp