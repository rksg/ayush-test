import React from 'react'

import { useIntl } from 'react-intl'

import { Fieldset, Descriptions } from '@acx-ui/components'
import { SimPresentData }         from '@acx-ui/rc/utils'
import { noDataDisplay }          from '@acx-ui/utils'

interface SimPresentProps {
  title: string
  currentCellularInfo: SimPresentData
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
      <Descriptions labelWidthPercent={50}>
        <Descriptions.Item
          label={$t({ defaultMessage: 'IMSI' })}
          children={currentCellularInfo.cellularIMSI || noDataDisplay}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'ICCID' })}
          children={currentCellularInfo.cellularICCID || noDataDisplay}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'IMSI' })}
          children={currentCellularInfo.cellularIMSI || noDataDisplay}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Tx (bytes)' })}
          children={currentCellularInfo.cellularTxBytes || noDataDisplay}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Rx (bytes)' })}
          children={currentCellularInfo.cellularRxBytes || noDataDisplay}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Switch count' })}
          children={currentCellularInfo.cellularSwitchCount || noDataDisplay}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Network lost count' })}
          children={currentCellularInfo.cellularNWLostCount || noDataDisplay}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Card removal count' })}
          children={currentCellularInfo.cellularCardRemovalCount || noDataDisplay}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'DHCP timeout count' })}
          children={currentCellularInfo.cellularDHCPTimeoutCount || noDataDisplay}
        />
      </Descriptions>
    </Fieldset>
  )
}


