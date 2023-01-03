import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Descriptions }                                          from '@acx-ui/components'
import { ApViewModel, CelluarInfo, CellularSim, SimPresentData } from '@acx-ui/rc/utils'
import { formatter }                                             from '@acx-ui/utils'

import { SimPresent } from './SimPresent'

interface ApCellularPropertiesProps {
  currentCellularInfo: CelluarInfo,
  currentAP: ApViewModel,
}

const defaultCellularSim = {
  sim0Present: false,
  sim0PresentData: {} as SimPresentData,
  sim1Present: false,
  sim1PresentData: {} as SimPresentData,
  simPresent: ''
}

export const ApCellularProperties = (props: ApCellularPropertiesProps) => {
  const { $t } = useIntl()
  const [cellularSim, setCellularSim] = useState<CellularSim>(defaultCellularSim)
  const { currentCellularInfo, currentAP } = props

  const getSimPresent = () => {
    const tmpSimPresent = []
    const result = { ...defaultCellularSim }
    if (currentCellularInfo.cellularIsSIM0Present
        && currentCellularInfo.cellularIsSIM0Present === 'YES'){
      result.sim0Present = true
      result.sim0PresentData = {
        cellularIMSI: currentCellularInfo.cellularIMSISIM0,
        cellularICCID: currentCellularInfo.cellularICCIDSIM0,
        cellularTxBytes: currentCellularInfo.cellularTxBytesSIM0,
        cellularRxBytes: currentCellularInfo.cellularRxBytesSIM0,
        cellularSwitchCount: currentCellularInfo.cellularSwitchCountSIM0,
        cellularNWLostCount: currentCellularInfo.cellularNWLostCountSIM0,
        cellularCardRemovalCount: currentCellularInfo.cellularCardRemovalCountSIM0,
        cellularDHCPTimeoutCount: currentCellularInfo.cellularDHCPTimeoutCountSIM0
      }
      tmpSimPresent.push($t({ defaultMessage: 'SIM 0' }))
    }
    if (currentCellularInfo.cellularIsSIM1Present
        && currentCellularInfo.cellularIsSIM1Present === 'YES') {
      result.sim1Present = true
      result.sim1PresentData = {
        cellularIMSI: currentCellularInfo.cellularIMSISIM1,
        cellularICCID: currentCellularInfo.cellularICCIDSIM1,
        cellularTxBytes: currentCellularInfo.cellularTxBytesSIM1,
        cellularRxBytes: currentCellularInfo.cellularRxBytesSIM1,
        cellularSwitchCount: currentCellularInfo.cellularSwitchCountSIM1,
        cellularNWLostCount: currentCellularInfo.cellularNWLostCountSIM1,
        cellularCardRemovalCount: currentCellularInfo.cellularCardRemovalCountSIM1,
        cellularDHCPTimeoutCount: currentCellularInfo.cellularDHCPTimeoutCountSIM1
      }
      tmpSimPresent.push($t({ defaultMessage: 'SIM 1' }))
    }
    result.simPresent = tmpSimPresent.join(', ')
    setCellularSim(result)
  }

  useEffect(() => {
    getSimPresent()
  }, [currentAP])
  return (<>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'SIM Present' })}
        children={cellularSim.simPresent || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Active SIM' })}
        children={currentCellularInfo.cellularActiveSim || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Connection status' })}
        children={currentCellularInfo.cellularConnectionStatus || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'WAN Interface' })}
        children={currentCellularInfo.cellularWanInterface || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: '4G/3G channel' })}
        children={currentCellularInfo.cellular3G4GChannel || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Roaming Status' })}
        children={currentCellularInfo.cellularRoamingStatus || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Current RF Band' })}
        children={currentCellularInfo.cellularBand || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'IMEI' })}
        children={currentCellularInfo.cellularIMEI || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'LTE Firmware' })}
        children={currentCellularInfo.cellularLTEFirmware || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Operator' })}
        children={currentCellularInfo.cellularOperator || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Country' })}
        children={currentCellularInfo.cellularCountry || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'IP address' })}
        children={currentCellularInfo.cellularIPaddress || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Subnet mask' })}
        children={currentCellularInfo.cellularSubnetMask || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Default gateway' })}
        children={currentCellularInfo.cellularDefaultGateway || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Signal strength(RSSI)' })}
        children={currentCellularInfo.cellularSignalStrength || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Radio uptime' })}
        children={currentCellularInfo.cellularRadioUptime ?
          formatter('durationFormat')(currentCellularInfo.cellularRadioUptime)
          : $t({ defaultMessage: 'None' })
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Uplink Bandwidth for LTE' })}
        children={currentCellularInfo.cellularUplinkBandwidth || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Downlink Bandwidth for LTE' })}
        children={currentCellularInfo.cellularDownlinkBandwidth || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'RSRP' })}
        children={currentCellularInfo.cellularRSRP || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'RSRQ' })}
        children={currentCellularInfo.cellularRSRQ || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'SINR' })}
        children={currentCellularInfo.cellularSINR || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'ECIO' })}
        children={currentCellularInfo.cellularECIO || $t({ defaultMessage: 'None' })}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'RSCP' })}
        children={currentCellularInfo.cellularRSCP || $t({ defaultMessage: 'None' })}
      />
    </Descriptions>
    {
      cellularSim.sim0Present && <SimPresent
        title={$t({ defaultMessage: 'SIM 0' })}
        currentCellularInfo={cellularSim.sim0PresentData}
      />
    }
    {
      cellularSim.sim1Present && <SimPresent
        title={$t({ defaultMessage: 'SIM 1' })}
        style={{ marginTop: '15px' }}
        currentCellularInfo={cellularSim.sim1PresentData}
      />
    }
  </>)
}
