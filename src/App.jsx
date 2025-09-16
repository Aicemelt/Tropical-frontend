import './styles/global.scss';
import RightLayout from "./layouts/RightLayout.jsx";
import LeftLayout from "./layouts/LeftLayout.jsx";
import {BrowserRouter, RouterProvider} from "react-router-dom";
import router from "./routes/route-config.jsx";

function App() {

  return (
      <RouterProvider router={router} />
  )
}

export default App;
