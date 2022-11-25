import { useIntl } from 'react-intl'

import { GridRow, GridCol, cssStr } from '@acx-ui/components'
import { Close }                    from '@acx-ui/icons'
import { useGetCloudVersionQuery }  from '@acx-ui/rc/services'
import { useParams }                from '@acx-ui/react-router-dom'

import { AboutModal, VersionContainer } from './styledComponents'


export default function About (props: {
  modalState: boolean,
  setIsModalOpen: (isModalOpen: boolean) => void
}) {
  const { $t } = useIntl()

  // eslint-disable-next-line max-len
  const logoURL = 'https://storage.cloud.google.com/ruckus-web-1/acx-ui-static-resources/logo-ruckus.png'

  const params = useParams()
  const { data } = useGetCloudVersionQuery({ params })

  return <AboutModal
    data-testid={'modal-about-id'}
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
    <GridRow style={{ rowGap: 13 }}>
      <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
        <img style={{
          width: 140
        }}
        src={logoURL}
        alt={$t({ defaultMessage: 'Logo' })}
        />
      </GridCol>
      <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
        <div style={{ fontWeight: 600,
          fontSize: 16, color: cssStr('--acx-primary-white') }}>
          {data?.currentVersion.name}
        </div>
      </GridCol>
      <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
        <VersionContainer>
          {$t(({ defaultMessage: '© 2022 Ruckus Wireless, Inc., a CommScope Company.' }))}
        </VersionContainer>
        <VersionContainer>
          {$t(({ defaultMessage: 'All rights reserved.' }))}
        </VersionContainer>
      </GridCol>
      <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
        <VersionContainer style={{ fontFamily: 'Open Sans', color: cssStr('--acx-primary-white') }}>
          {$t(({ defaultMessage: 'Contact Support' }))}
        </VersionContainer>
      </GridCol>
    </GridRow>
  </AboutModal>
}
