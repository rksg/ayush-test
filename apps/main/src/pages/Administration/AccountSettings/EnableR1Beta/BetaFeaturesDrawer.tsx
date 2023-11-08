// import { useState } from 'react'

// import { Form }                       from 'antd'
import { useIntl } from 'react-intl'

import { Button, Drawer } from '@acx-ui/components'

/* eslint-disable-next-line */
export interface BetaFeaturesDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  onClose: () => void
  // onSubmit: () => void
  // editMode?: boolean
  // editR1BetaEnable?: string
  // // setSelected: (selected: []) => void
  width?: number
}

export function BetaFeaturesDrawer (
  props: BetaFeaturesDrawerProps
) {
  const { $t } = useIntl()
  const { visible, setVisible } = props
  // const onSave = async () => {
  // console.log(`visible:::: ${visible}`)
  // }

  const onClose = () => {
    setVisible(false)
  }

  // eslint-disable-next-line max-len
  const termsCondition = $t({ defaultMessage: 'Ruckus Wireless, Inc. (“RUCKUS”) is providing you ' })

  const footer =<div>
    <Button type='primary'
      onClick={() => {
        setVisible(false)
      }}>
      {$t({ defaultMessage: 'Ok' })}
    </Button>
  </div>

  return <Drawer
    title={$t({ defaultMessage: 'R1 Beta Features' })}
    visible={visible}
    onClose={onClose}
    width={props.width}
    children={<div><p>{termsCondition}</p></div>}
    footer={footer}
  />
}

export default BetaFeaturesDrawer

