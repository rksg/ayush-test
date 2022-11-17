import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { GridRow, GridCol, Drawer } from '@acx-ui/components'

import {
  Description,
  CopyableText } from './styledComponents'

export default function Firewall (props: {
  modalState: boolean,
  setIsModalOpen: (isModalOpen: boolean) => void
}) {
  const { $t } = useIntl()

  return <Drawer
    title={$t({ defaultMessage: 'Firewall ACL Inputs' })}
    visible={props.modalState}
    onClose={() => props.setIsModalOpen(false)}
    mask={true}
    children={<>
      <GridRow style={{ paddingBottom: 5 }}>
        <GridCol col={{ span: 24 }}>
          <Description>
            {
              // eslint-disable-next-line max-len
              $t({ defaultMessage: 'To allow RUCKUS ACX to function properly, please configure your firewall to allow for outbound connectivity according to the following guidelines:' })
            }
          </Description>
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 24 }} style={{ paddingTop: 20 }}>
          <Typography.Title level={5} style={{ fontWeight: 600 }}>
            {$t({ defaultMessage: 'Outbound HTTPS (TCP 443) from APs and Switches to:' })}
          </Typography.Title>
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <CopyableText>https://ap-registrar.ruckuswireless.com</CopyableText>
          <CopyableText>https://sw-registrar.ruckuswireless.com</CopyableText>
          <CopyableText>https://ocsp.comodoca.com</CopyableText>
          <CopyableText>https://ocsp.entrust.net</CopyableText>
          <CopyableText>https://ruckus.cloud</CopyableText>
          <CopyableText>https://eu.ruckus.cloud</CopyableText>
          <CopyableText>https://asia.ruckus.cloud</CopyableText>
          <CopyableText>https://device.ruckus.cloud</CopyableText>
          <CopyableText>https://device.eu.ruckus.cloud</CopyableText>
          <CopyableText>https://device.asia.ruckus.cloud</CopyableText>
          <CopyableText>https://storage.googleapis.com</CopyableText>
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 24 }} style={{ paddingTop: 20 }}>
          <Typography.Title level={5} style={{ fontWeight: 600 }}>
            {$t({ defaultMessage: 'Outbound SSH (TCP 22) from APs and Switches to:' })}
          </Typography.Title>
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <CopyableText color={'var(--acx-primary-black)'}>device.ruckus.cloud</CopyableText>
          <CopyableText color={'var(--acx-primary-black)'}>device.eu.ruckus.cloud</CopyableText>
          <CopyableText color={'var(--acx-primary-black)'}>device.asia.ruckus.cloud</CopyableText>
        </GridCol>
      </GridRow>
    </>}
    destroyOnClose={true}
    width={420}
  />
}
