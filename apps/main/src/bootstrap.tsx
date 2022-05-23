import React from 'react'

import { ConfigProvider } from 'antd'
import enUS               from 'antd/lib/locale/en_US'
import ReactDOM           from 'react-dom'

import { BrowserRouter } from '@acx-ui/react-router-dom'
import { Provider }      from '@acx-ui/store'

import AllRoutes from './AllRoutes'

import '@acx-ui/theme'

ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider locale={enUS}>
      <Provider>
        <BrowserRouter>
          <React.Suspense fallback={null}>
            <AllRoutes />
          </React.Suspense>
        </BrowserRouter>
      </Provider>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById('root') as HTMLElement
)
