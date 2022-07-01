import React from 'react'

import { BrowserRouter } from '@acx-ui/react-router-dom'

import { PageHeader } from '..'

export function WithSubTitle () {
  return <BrowserRouter>
    <PageHeader
      title='Sub title as text'
      breadcrumb={[
        { text: 'Networks', link: '/networks' }
      ]}
      subTitle={'Sub title text'}
    />
  </BrowserRouter>
}
