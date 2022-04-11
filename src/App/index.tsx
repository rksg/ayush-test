import React      from 'react'
import { Outlet } from 'react-router-dom'
import Layout     from 'src/App/Layout'

function App () {
  return <Layout content={<Outlet />} />
}

export default App
