import React from 'react'

import { BrowserRouter } from '@acx-ui/react-router-dom'

import { PageHeader } from '..'

export function WithSubTitle () {
  return <BrowserRouter>
    <PageHeader
      title='With Subtitle'
      breadcrumb={[
        { text: 'Networks', link: '/networks' }
      ]}
      subTitle={'Subtitle text'}
    />
  </BrowserRouter>
}

export function WithSubTitlesAndDividers () {
  return <BrowserRouter>
    <PageHeader
      title='With Subtitles & Dividers'
      breadcrumb={[
        { text: 'Networks', link: '/networks' }
      ]}
      subTitle={[
        { label: 'Label 1', value: ['Value 1'] },
        { label: 'Label 2', value: ['Value 2'] },
        { label: 'Label 3', value: ['Value 3', 'Value 4'] }
      ]}
    />
  </BrowserRouter>
}
