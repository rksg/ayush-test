import React              from 'react'
import { ConfigProvider } from 'antd'
import enUS               from 'antd/lib/locale/en_US'
import ReactDOM           from 'react-dom'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import App               from './App'
import Networks          from './App/Networks'
import { NetworkForm }   from './App/Networks/Form/NetworkForm'
import { NetworksTable } from './App/Networks/Table'

import './index.less'

ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider locale={enUS}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<App />}>
            <Route index element={<Navigate replace to='/networks' />} />
            <Route path='networks' element={<Networks />}>
              <Route index element={<NetworksTable />} />
              <Route path='create' element={<NetworkForm />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
