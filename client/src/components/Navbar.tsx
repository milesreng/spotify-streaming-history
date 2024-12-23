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
    <div className='w-full flex py-4 items-center fixed z-50 dark:bg-stone-800 bg-stone-100 px-4 justify-between font-header font-semibold text-lg border-b-2 border-b-stone-300 dark:border-b-stone-700'>
      <Link to='/dashboard' className='my-auto tracking-wider text-lg basis-1/3'>
        Spotify Streaming Summary
      </Link>
      <div className='basis-1/3 flex'>
        <Link to='/top-tracks' className='mx-auto my-auto'>Top Tracks</Link>
      </div>
      <div className='flex basis-1/3 justify-end'>
        { user ? (
          <div className='flex flex-row gap-4 font-light'>
            {/* <Link to='/top-tracks' className='my-auto'>
              {user.email}
            </Link> */}
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