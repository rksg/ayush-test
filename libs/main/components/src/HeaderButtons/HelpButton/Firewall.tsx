import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Drawer } from '@acx-ui/components'

import { CopyableText, HelpSubtitle } from './styledComponents'

export default function Firewall (props: {
  modalState: boolean,
  setIsModalOpen: (isModalOpen: boolean) => void
}) {
  const { $t } = useIntl()

  return <Drawer
    title={$t({ defaultMessage: 'Firewall ACL Inputs' })}
    visible={props.modalState}
    onClose={() => props.setIsModalOpen(false)}
    children={<>
      <Typography.Paragraph>
        {
          // eslint-disable-next-line max-len
          $t({ defaultMessage: 'To allow RUCKUS One to function properly, please configure your firewall to allow for outbound connectivity according to the following guidelines:' })
        }
      </Typography.Paragraph>
      <HelpSubtitle>
        {$t({ defaultMessage: 'Outbound HTTPS (TCP 443) from APs and Switches to:' })}
      </HelpSubtitle>
      <Typography.Paragraph>
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
      </Typography.Paragraph>
      <HelpSubtitle>
        {$t({ defaultMessage: 'Outbound SSH (TCP 22) from APs and Switches to:' })}
      </HelpSubtitle>
      <Typography.Paragraph>
        <CopyableText>device.ruckus.cloud</CopyableText>
        <CopyableText>device.eu.ruckus.cloud</CopyableText>
        <CopyableText>device.asia.ruckus.cloud</CopyableText>
      </Typography.Paragraph>
    </>
    }
    destroyOnClose={true}
    width={420}
  />
}
