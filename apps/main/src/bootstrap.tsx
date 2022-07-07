import React from 'react'

import { ConfigProvider } from 'antd'
import { createRoot }     from 'react-dom/client'
import { IntlProvider }   from 'react-intl'

import { BrowserRouter } from '@acx-ui/react-router-dom'
import { Provider }      from '@acx-ui/store'
import { loadLocale }    from '@acx-ui/utils'

import AllRoutes from './AllRoutes'

import '@acx-ui/theme'

export async function init () {
  const container = document.getElementById('root')
  const root = createRoot(container!)
  const locale = await loadLocale('en-US')

  root.render(
    <React.StrictMode>
      <IntlProvider locale={locale.locale} messages={locale}>
        <ConfigProvider locale={locale}>
          <Provider>
            <BrowserRouter>
              <React.Suspense fallback={null}>
                <AllRoutes />
              </React.Suspense>
            </BrowserRouter>
          </Provider>
        </ConfigProvider>
      </IntlProvider>
    </React.StrictMode>
  )
}
