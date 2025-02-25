import { Outlet } from "react-router";
import SearchOverlay from "./components/SearchOverlay.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SearchOverlay />

      <div className="position-absolute vw-100 vh-100 top-0 start-0 z-0">
        <Outlet />
      </div>
    </QueryClientProvider>
  );
}

export default App;
