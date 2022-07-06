import React from 'react'

import { ConfigProvider }                   from 'antd'
import enUS                                 from 'antd/lib/locale/en_US'
import { createRoot }                       from 'react-dom/client'
import { IntlProvider, ResolvedIntlConfig } from 'react-intl'

import { BrowserRouter } from '@acx-ui/react-router-dom'
import { Provider }      from '@acx-ui/store'

import AllRoutes from './AllRoutes'

import '@acx-ui/theme'

type MessagesType = ResolvedIntlConfig['messages']

const lang = 'en-US'
const contents: Record<string, MessagesType> = {
  'en-US': {
    ...(enUS as unknown as MessagesType),
    title: 'Dashboard',
    description: 'Testing i18next framework integration',
    add: 'Add',
    entirOrg: 'Entire Organization',
    last24Hrs: 'Last 24 Hours'
  },
  'de': {
    title: 'DE: Dashboard',
    description: 'De: Testing i18next framework integration',
    add: 'De: Add',
    entirOrg: 'De: Entire Organization',
    last24Hrs: 'DE: Last 24 Hours'
  }
}

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
  <React.StrictMode>
    <IntlProvider locale={lang} messages={contents[lang]}>
      <ConfigProvider locale={enUS}>
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
