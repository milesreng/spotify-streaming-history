import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDarkMode } from '../context/DarkModeContext'
import { HiLightBulb } from 'react-icons/hi'

const Navbar = () => {
  const { user, logout, isLoading } = useAuth()
  const { toggleDarkMode } = useDarkMode()

  // todo: implement modal for logout confirmation

  const handleLogout = async () => {
    logout()
  }

  return (
    <div className='w-full flex py-2 px-4 justify-between font-header font-semibold text-lg border-b-2 border-b-stone-700'>
      <Link to='/' className='my-auto tracking-wider text-lg'>
        Spotify Streaming Summary
      </Link>
      <div className='flex'>
        { user ? (
          <div className='flex flex-row gap-4 font-light'>
            <div className='my-auto'>
              {user.email}
            </div>
            <div className='navbar-link' onClick={handleLogout}>
              <p>Log out</p>
            </div>
          </div>
        ) : (
          <div className='flex flex-row gap-4 font-light'>
            <div className='navbar-link'>
              <Link to='/login'>Log in</Link>
            </div>
            <div className='navbar-link'>
              <Link to='/register'>Register</Link>
            </div>
          </div>
        ) }
        <span onClick={toggleDarkMode} className='my-auto hover:cursor-pointer pl-4'>
          <HiLightBulb />
        </span>
      </div>
    </div>
  )
}

export default Navbar