import React from 'react'

import styled from 'styled-components/macro'

import { AIDrivenRRM }   from '@acx-ui/icons'
import { BrowserRouter } from '@acx-ui/react-router-dom'

import { PageHeader } from '..'

const AIDrivenRRMIcon = styled(AIDrivenRRM)`
  width: 32px;
  height: 32px;
`

export function WithTitlePrefix () {
  return <BrowserRouter>
    <PageHeader
      breadcrumb={[
        { text: 'Networks', link: '/networks' }
      ]}
      titlePrefix={<AIDrivenRRMIcon />}
      title='With Title Prefix'
      subTitle={'Subtitle text'}
    />
  </BrowserRouter>
}
