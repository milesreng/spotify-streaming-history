import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()

  const [email, setEmail ] = useState('')
  const [password, setPassword ] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({
    general: '',
    email: '',
    password: ''
  })

  const { user, login, isLoading, error } = useAuth()

  const handleSubmitLogin = async (e: FormEvent) => {
    e.preventDefault()

    console.log(email, password)
    await login(email, password)

    if (!user) {
      console.log('error logging in')
      setErrors({ ...errors, general: error })
    }
  } 

  useEffect(() => {
    if (user) {
      console.log('user is logged in')
      navigate('/dashboard')
    }
  }, [user])  

  return (
    <div className='w-full flex flex-col justify-center '>
      <div className='w-11/12 md:w-2/3 lg:w-1/2 xl:w-1/3 mx-auto bg-stone-200 dark:bg-stone-700 my-auto h-40vh p-4 md:p-12 rounded-md'>
        <p className='font-header text-4xl pb-6 uppercase tracking-widest'>Login</p>
        <form onSubmit={handleSubmitLogin}>
          <div className="form-input-group group">
            <input 
              type="email" 
              name="floating_email" 
              id="floating_email" 
              className="form-input peer" 
              placeholder=" " 
              required
              value={email} 
              onChange={(e) => setEmail(e.target.value)} />
            <label htmlFor="floating_email" className="form-input-label peer">Email address</label>
          </div>
          {errors.email && (<div className='form-error'>{errors.email}</div>)}
          <div className="form-input-group group">
            <input 
              type="password" 
              name="floating_password" 
              id="floating_password" 
              className="form-input peer" 
              placeholder=" " 
              required
              value={password} 
              onChange={(e) => setPassword(e.target.value)} />
            <label htmlFor="floating_password" className="form-input-label peer">Password</label>
          </div>
          {errors.email && (<div className='form-error'>{errors.email}</div>)}
          <button type="submit" className='form-submit-button'>Login</button>
        </form>
      </div>
    </div>
  )
}

export default Login