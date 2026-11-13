import React, { useState } from 'react'
import styles from './css/SignIn.module.css'
import Input from '@/components/Input'
import Button from '@/components/Button'
import lumberTycoon2Logo from '@public/lumber_tycoon_2_logo.webp';
import fireAxeLogo from '@public/fire_axe_decal.webp';
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInFormData } from "@shared/schemas/auth.schema";
import { useAuth } from '@/contexts/AuthContext'
import { handleError } from '@/utils/handleError.util'
import ErrorMessage from '@/components/ErrorMessage'
import { FaSignInAlt } from 'react-icons/fa'

const SignIn = (): React.JSX.Element => {

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username : "",
      password : "",
    },
  });

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async(data: SignInFormData) => {
    try {
      if (loading) return
      setLoading(true);
      
      await signIn(data);
      
      const destination = location.state?.from?.pathname;
      
      navigate(
        typeof destination === "string" ? destination : "/home",
        { replace: true },
      );
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
            width={200}
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
          Sign In
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputs_container}>
            <Input
              label='Username'
              type='text'
              placeholder='ex: username_123'
              error={errors.username?.message}
              onClear={() => setValue('username', '')}
              {...register("username")}
            />

            <Input
              label='Password'
              type='password'
              placeholder='********'
              error={errors.password?.message}
              onClear={() => setValue('password', '')}
              {...register("password")}
            />

            { errorMessage && <ErrorMessage error={errorMessage}/>}
          </div>

          <Button
            label={isSubmitting ? "Processing..." : "Sign In"}
            type="submit"
            disabled={isSubmitting} 
            buttonStyle='FORM'
            loading={loading}
            icon={() => <FaSignInAlt />}
          />
        </form>

        <p className={styles.dont_have_an_account}>
          Don't have an account? 

          <Link 
          to={'/sign-up'}
          className={styles.sign_up}
          > 
            Sign up! 
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignIn