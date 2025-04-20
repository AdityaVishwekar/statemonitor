import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import SubmitPage from './pages/SubmitPage';
import LogsPage from './pages/LogsPage';
import HomePage from './pages/HomePage';


const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        <nav className="bg-white shadow p-4 flex gap-6">
          {/*<h1 className="text-2xl font-bold mb-6">StateGuardian</h1>*/}
          <Link to="/" className="text-blue-600 hover:underline font-semibold">Home</Link>
          <Link to="/submit" className="text-blue-600 hover:underline font-semibold">Submit Files</Link>
          <Link to="/logs" className="text-blue-600 hover:underline font-semibold">Live Logs</Link>
        </nav>
        <div className="p-6">
          <Switch>
            <Route path="/submit" component={SubmitPage} />
            <Route path="/logs" component={LogsPage} />
            <Route path="/" exact component={HomePage} />
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default App;
