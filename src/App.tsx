import Router from "./router/router"

import { AuthProvider } from "./context/AuthContext"
import { SocketProvider } from "./context/SocketProvider"

export default function App() {

  return (

    <AuthProvider>

      <SocketProvider>

        <Router />

      </SocketProvider>

    </AuthProvider>

  )

}