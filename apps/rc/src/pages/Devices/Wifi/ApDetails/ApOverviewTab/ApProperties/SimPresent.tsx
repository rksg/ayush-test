import React from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Fieldset } from '@acx-ui/components'

interface SimPresentProps {
  title: string
  currentCellularInfo: any
  style?: React.CSSProperties
}

export const SimPresent = (props: SimPresentProps) => {
  const { $t } = useIntl()
  const { title, currentCellularInfo, style } = props
  const fieldSetProps = {
    style,
    switchStyle: { display: 'none', cursor: 'default' },
    checked: true
  }
  return (
    <Fieldset {...fieldSetProps} label={title} >
      <Form.Item
        label={$t({ defaultMessage: 'IMSI' })}
        children={currentCellularInfo.cellularIMSI || $t({ defaultMessage: 'None' })}
      />
      <Form.Item
        label={$t({ defaultMessage: 'ICCID' })}
        children={currentCellularInfo.cellularICCID || $t({ defaultMessage: 'None' })}
      />
      <Form.Item
        label={$t({ defaultMessage: 'IMSI' })}
        children={currentCellularInfo.cellularIMSI || $t({ defaultMessage: 'None' })}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Tx (bytes)' })}
        children={currentCellularInfo.cellularTxBytes || $t({ defaultMessage: 'None' })}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Rx (bytes)' })}
        children={currentCellularInfo.cellularRxBytes || $t({ defaultMessage: 'None' })}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Switch count' })}
        children={currentCellularInfo.cellularSwitchCount || $t({ defaultMessage: 'None' })}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Network lost count' })}
        children={currentCellularInfo.cellularNWLostCount || $t({ defaultMessage: 'None' })}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Card removal count' })}
        children={currentCellularInfo.cellularCardRemovalCount || $t({ defaultMessage: 'None' })}
      />
      <Form.Item
        label={$t({ defaultMessage: 'DHCP timeout count' })}
        children={currentCellularInfo.cellularDHCPTimeoutCount || $t({ defaultMessage: 'None' })}
      />
    </Fieldset>
  )
}


