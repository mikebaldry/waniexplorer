import { Outlet } from "react-router";
import SearchOverlay from "./components/SearchOverlay.tsx";

function App() {
  return (
    <>
      <SearchOverlay />

      <div className="position-absolute vw-100 vh-100 top-0 start-0 z-0">
        <Outlet />
      </div>
    </>
  );
}

export default App;
