import './styles/global.scss';
import RightLayout from "./layouts/RightLayout.jsx";
import LeftLayout from "./layouts/LeftLayout.jsx";
import {BrowserRouter} from "react-router-dom";

function App() {

  return (
    <>
        <BrowserRouter >
            <LeftLayout/>
            <RightLayout/>
        </BrowserRouter>
    </>
  )
}

export default App;
