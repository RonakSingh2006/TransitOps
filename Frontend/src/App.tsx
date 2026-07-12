import { RoleProvider } from "./lib/role-context";
import AuthPage from "./routes/SignIn";

function App() {
  return (
    <RoleProvider>
      <AuthPage />
    </RoleProvider>
  );
}

export default App;