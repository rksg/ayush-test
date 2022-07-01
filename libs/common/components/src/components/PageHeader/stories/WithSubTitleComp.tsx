import React from 'react'

import { BrowserRouter } from '@acx-ui/react-router-dom'

import { PageHeader } from '..'

import { getSubTitle } from 'apps/analytics/src/components/Header'

export function WithSubTitle () {
  return <BrowserRouter>
    <PageHeader
      title='Sub title as custom component'
      breadcrumb={[
        { text: 'Networks', link: '/networks' }
      ]}
      subTitle={getSubTitle({ subTitle: [
        { key: 'Type', value: ['AP'] },
        { key: 'IP', value: ['10.0.0.1', '10.0.0.2'] }
      ] })}
    />
  </BrowserRouter>
}
