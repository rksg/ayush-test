import React from 'react'

import { createRoot } from 'react-dom/client'

import { ConfigProvider } from '@acx-ui/components'
import { BrowserRouter }  from '@acx-ui/react-router-dom'
import { Provider }       from '@acx-ui/store'

import AllRoutes from './AllRoutes'

import '@acx-ui/theme'

export async function init () {
  const container = document.getElementById('root')
  const root = createRoot(container!)
  const lang = 'de-DE'

  root.render(
    <React.StrictMode>
      <ConfigProvider lang={lang}>
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
}
