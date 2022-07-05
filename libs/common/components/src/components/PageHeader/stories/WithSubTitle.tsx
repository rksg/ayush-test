import React from 'react'

import { BrowserRouter } from '@acx-ui/react-router-dom'

import { PageHeader } from '..'

export function WithSubTitleText () {
  return <BrowserRouter>
    <PageHeader
      title='With Subtitle Text'
      breadcrumb={[
        { text: 'Networks', link: '/networks' }
      ]}
      subTitle={'Sub title text'}
    />
  </BrowserRouter>
}

export function WithSubTitleComp () {
  return <BrowserRouter>
    <PageHeader
      title='With Subtitle Component'
      breadcrumb={[
        { text: 'Networks', link: '/networks' }
      ]}
      subTitle={<span style={{ background: 'yellow' }}>Custom Component</span>}
    />
  </BrowserRouter>
}
