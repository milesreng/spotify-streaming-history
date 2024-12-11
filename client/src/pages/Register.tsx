import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const navigate = useNavigate()

  const [username, setUsername ] = useState('')
  const [password, setPassword ] = useState('')
  const [confirmPassword, setConfirmPassword ] = useState('')
  const [email, setEmail ] = useState('')
  const [firstName, setFirstName ] = useState('')
  const [errors, setErrors] = useState({
    general: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    firstName: ''
  })

  const { user, register, isLoading, error } = useAuth()

  const handleSubmitRegister = (e: FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setErrors({ ...errors, confirmPassword: 'Passwords do not match' })
    }

    console.log(username, email, firstName, password)
    register(username, email, firstName, password)
  } 

  useEffect(() => {
    if (user) {
      console.log('user is logged in')
      navigate('/dashboard')
    } else if (error) {
      console.log('error registering user')
      setErrors({ ...errors, general: error })
    }
  }, [user])

  return (
    <div className='w-11/12 md:w-2/3 lg:w-1/3 mx-auto bg-stone-200 dark:bg-stone-700 my-auto h-40vh p-4 md:p-12 rounded-md'>
      <p className='font-header text-4xl pb-6 uppercase tracking-widest'>Register</p>
      <form onSubmit={handleSubmitRegister}>
        {errors.general && (<div className='form-error'>{errors.general}</div>)}
        <div className="form-input-group group">
          <input 
            type="username" 
            name="floating_username" 
            id="floating_username" 
            className="form-input peer" 
            placeholder=" " 
            required
            value={username} 
            onChange={(e) => setUsername(e.target.value)} />
          <label htmlFor="floating_username" className="form-input-label peer">Username</label>
        </div>
        {errors.username && (<div className='form-error'>{errors.username}</div>)}
        <div className="form-input-group group">
          <input 
            type="text" 
            name="floating_fname" 
            id="floating_fname" 
            className="form-input peer" 
            placeholder=" " 
            required
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} />
          <label htmlFor="floating_fname" className="form-input-label peer">First name</label>
        </div>
        {errors.firstName && (<div className='form-error'>{errors.firstName}</div>)}
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
        {errors.confirmPassword && (<div className='form-error'>{errors.confirmPassword}</div>)}
        <div className="form-input-group group">
          <input 
            type="password" 
            name="floating_conf_password" 
            id="floating_conf_password" 
            className="form-input peer" 
            placeholder=" " 
            required
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} />
          <label htmlFor="floating_conf_password" className="form-input-label peer">Confirm password</label>
        </div>
        {errors.confirmPassword && (<div className='form-error'>{errors.confirmPassword}</div>)}
        <button type="submit" className='form-submit-button'>Register</button>
      </form>
    </div>
  )
}

export default Register