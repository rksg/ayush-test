import React from 'react'

import { Outlet } from '@acx-ui/react-router-dom'

import Layout from '../App/Layout'

function App () {
  return <Layout content={<Outlet />} />
}

export default App
