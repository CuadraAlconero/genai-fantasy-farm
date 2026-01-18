import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Characters } from './pages/Characters';
import { CreateCharacter } from './pages/CreateCharacter';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/characters/create" element={<CreateCharacter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
