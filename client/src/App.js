import './App.css';
import Home from "./Home/Home";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login/Login';
import Signup from './Signup/Signup';
import Interview from './Intervew/Interview';
import Overview from './Overview/Overview';
function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/dashboard' exact element={<Home />} />
          <Route path='/login' exact element={<Login />} />
          <Route path='/signup' exact element={<Signup />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/overview" element={<Overview />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
