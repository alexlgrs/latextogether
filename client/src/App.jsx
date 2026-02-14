import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from "./pages/HomePage/HomePage";
import Editor from "./pages/EditorPage/EditorPage";
import Auth from "./pages/AuthPage/AuthPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/editor",
    element: <Editor />,
  },
  {
    path: "/auth",
    element: <Auth />,
  }
]);

function App() {
  return (
    <div className="app-container">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;