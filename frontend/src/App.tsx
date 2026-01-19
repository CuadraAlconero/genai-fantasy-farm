import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Characters } from './pages/Characters';
import { CreateCharacter } from './pages/CreateCharacter';
import { Events } from './pages/Events';
import { EventViewer } from './pages/EventViewer';
import { CreateEvent } from './pages/CreateEvent';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/characters/create" element={<CreateCharacter />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/create" element={<CreateEvent />} />
        <Route path="/events/:id" element={<EventViewer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
