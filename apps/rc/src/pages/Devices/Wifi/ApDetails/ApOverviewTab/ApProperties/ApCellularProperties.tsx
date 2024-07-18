import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Descriptions }                                          from '@acx-ui/components'
import { formatter }                                             from '@acx-ui/formatter'
import { ApViewModel, CelluarInfo, CellularSim, SimPresentData } from '@acx-ui/rc/utils'
import { noDataDisplay }                                         from '@acx-ui/utils'

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
        children={cellularSim.simPresent || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Active SIM' })}
        children={currentCellularInfo.cellularActiveSim || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Connection status' })}
        children={currentCellularInfo.cellularConnectionStatus || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'WAN Interface' })}
        children={currentCellularInfo.cellularWanInterface || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: '4G/3G channel' })}
        children={currentCellularInfo.cellular3G4GChannel || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Roaming Status' })}
        children={currentCellularInfo.cellularRoamingStatus || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Current RF Band' })}
        children={currentCellularInfo.cellularBand || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'IMEI' })}
        children={currentCellularInfo.cellularIMEI || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'LTE Firmware' })}
        children={currentCellularInfo.cellularLTEFirmware || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Operator' })}
        children={currentCellularInfo.cellularOperator || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Country' })}
        children={currentCellularInfo.cellularCountry || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'IP address' })}
        children={currentCellularInfo.cellularIPaddress || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Subnet mask' })}
        children={currentCellularInfo.cellularSubnetMask || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Default gateway' })}
        children={currentCellularInfo.cellularDefaultGateway || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Signal strength(RSSI)' })}
        children={currentCellularInfo.cellularSignalStrength || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Radio uptime' })}
        children={currentCellularInfo.cellularRadioUptime ?
          formatter('durationFormat')(currentCellularInfo.cellularRadioUptime)
          : noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Uplink Bandwidth for LTE' })}
        children={currentCellularInfo.cellularUplinkBandwidth || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Downlink Bandwidth for LTE' })}
        children={currentCellularInfo.cellularDownlinkBandwidth || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'RSRP' })}
        children={currentCellularInfo.cellularRSRP || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'RSRQ' })}
        children={currentCellularInfo.cellularRSRQ || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'SINR' })}
        children={currentCellularInfo.cellularSINR || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'ECIO' })}
        children={currentCellularInfo.cellularECIO || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'RSCP' })}
        children={currentCellularInfo.cellularRSCP || noDataDisplay}
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
