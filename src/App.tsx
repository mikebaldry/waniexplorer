import { Outlet } from "react-router";
import SearchOverlay from "./components/SearchOverlay.tsx";
import AppState from "./components/AppState.tsx";

function App() {
  return (
    <AppState>
      <SearchOverlay />

      <Outlet />
    </AppState>
  );
}

export default App;
