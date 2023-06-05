import React from 'react'

import { BrowserRouter } from '@acx-ui/react-router-dom'

import { PageHeader } from '..'

export function WithBreadcrumb () {
  return <BrowserRouter>
    <PageHeader
      title='With Breadcrumb'
      breadcrumb={[
        { text: 'Root' },
        { text: 'Networks', link: '/networks' }
      ]}
    />
  </BrowserRouter>
}
