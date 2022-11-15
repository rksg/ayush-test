import { useState } from 'react'

import { useIntl } from 'react-intl'

import { GridRow, GridCol, cssStr } from '@acx-ui/components'
import { Logo, Close }              from '@acx-ui/icons'

import { AboutModal } from './styledComponents'


export default function About (props: {
  modalState: boolean,
  setIsModalOpen: (isModalOpen: boolean) => void
}) {
  const { $t } = useIntl()

  return <AboutModal
    visible={props.modalState}
    width={320}
    centered
    keyboard
    onCancel={() => {
      props.setIsModalOpen(false)
    }}
    closeIcon={<Close />}
    footer={null}
    title={''} >
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
        <Logo/>
      </GridCol>
      <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
        <div style={{ fontWeight: 600,
          fontSize: 16, color: cssStr('--acx-primary-white') }}>
            Version 1.0
        </div>
      </GridCol>
      <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
        <div style={{ fontWeight: 400, fontFamily: 'Source Sans Pro', fontStyle: 'normal',
          fontSize: 10, color: cssStr('--acx-neutrals-40') }}>
          {$t(({ defaultMessage: '© 2022 Ruckus Wireless, Inc., a CommScope Company.' }))}
        </div>
        <div style={{ fontWeight: 400, fontFamily: 'Source Sans Pro', fontStyle: 'normal',
          fontSize: 10, color: cssStr('--acx-neutrals-40') }}>
          {$t(({ defaultMessage: 'All rights reserved.' }))}
        </div>
      </GridCol>
      <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
        <div style={{ fontFamily: 'Open Sans', fontStyle: 'normal', fontWeight: 400,
          fontSize: 10, color: cssStr('--acx-primary-white') }}>
          {$t(({ defaultMessage: 'Contact Support' }))}
        </div>
      </GridCol>
    </GridRow>
  </AboutModal>
}
