import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from "./pages/HomePage/HomePage";
import Editor from "./pages/EditorPage/EditorPageYJS";
import Auth from "./pages/AuthPage/AuthPage"
import InviteHandler from "./components/InviteHandlerComponent/InviteHandler";

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
    path: "/editor/:projectId",
    element: <Editor />,
  },
  {
    path: "/editor",
    element: <Editor />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/invite/:projectId",
    element: <InviteHandler />,
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