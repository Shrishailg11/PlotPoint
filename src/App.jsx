import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import SignUp from './pages/SignUp'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <BrowserRouter>
          <Routes>
             <Route path='/' element={<Home />}></Route>
             <Route path='/sign-in' element={<SignIn />} />
             <Route path='/sign-up' element={ <SignUp />}></Route>
             <Route path='profile' element={<Profile />} />
             <Route path='/about' element={<About />} />
          </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
