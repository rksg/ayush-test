import React from 'react'

import { ConfigProvider } from 'antd'
import enUS               from 'antd/lib/locale/en_US'
import { createRoot }     from 'react-dom/client'

import { BrowserRouter } from '@acx-ui/react-router-dom'
import { Provider }      from '@acx-ui/store'

import AllRoutes from './AllRoutes'

import '@acx-ui/theme'

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
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
  </React.StrictMode>
)
