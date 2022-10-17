import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button } from '@acx-ui/components'

import Wifi4eu from '../../../../assets/images/portal-demo/wifi4eu-banner.png'
import * as UI from '../styledComponents'
export default function PortalWifi4euModal () {
  const { $t } = useIntl()
  const [visible, setVisible]=useState(false)
  const onClose = () => {
    setVisible(false)
  }
  const footer = [
    <Button
      key='back'
      type='link'
      onClick={onClose}
      children={$t({ defaultMessage: 'Cancel' })}
    />,
    <Button
      key='forward'
      type='secondary'
      children={$t({ defaultMessage: 'OK' })}
    />
  ]
  const getContent = <div>
    <UI.FieldLabel>{$t({ defaultMessage: 'WiFi4EU UUID' })}</UI.FieldLabel>
    <UI.FieldInput placeholder={
      $t({ defaultMessage: 'Copy from your WiFi4EU installation report' })}></UI.FieldInput>
  </div>

  return (
    <>
      <UI.Img src={Wifi4eu}
        onClick={() => setVisible(true)}
        alt={$t({ defaultMessage: 'Wifi4eu' })}
        height={120} />
      <UI.Modal
        title={$t({ defaultMessage: 'WiFi4EU Snippet Settings' })}
        visible={visible}
        onCancel={onClose}
        width={400}
        footer={footer}
        closable={false}
        maskClosable={false}
      >
        {getContent}
      </UI.Modal>
    </>

  )
}

