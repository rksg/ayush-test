import { MessageDescriptor } from 'react-intl'

import { Table } from '@acx-ui/components'

import { authMethodsByCode }            from '../../authMethods'
import {  useNetworkHealthTestResults } from '../../services'
import { stage }                        from '../../stages'
import {
  ClientType,
  NetworkHealthConfig,
  TestResultByAP
} from '../../types'

import {  getTableColumns } from './helper'

const Details = () => {
  const queryResults = useNetworkHealthTestResults()
  const config = (queryResults?.data)?.config as NetworkHealthConfig
  const clientType = (queryResults?.data)?.spec?.clientType
  const items = (queryResults?.data)?.aps?.items
  const wlanAuthSettings = (queryResults?.data)?.wlanAuthSettings

  const isWirelessClient = clientType === ClientType.VirtualWirelessClient
  const stagesFromConfig = (config : NetworkHealthConfig) => {
    if (!config?.authenticationMethod) { return [] }
    const stages = [...authMethodsByCode[config.authenticationMethod].stages,stage('dns')]
    if (config?.pingAddress) { stages.push(stage('ping')) }
    if (config?.tracerouteAddress) { stages.push(stage('traceroute')) }
    if (config?.speedTestEnabled) { stages.push(stage('speedTest')) }
    return stages
  }
  const stages = stagesFromConfig(config)?.map(
    ({ key, title }: { key: string; title: MessageDescriptor }) => ({
      key,
      title
    })
  )
  const stagesKeys = stages.map(s => s.key)
  return (
    <Table<TestResultByAP>
      columns={getTableColumns({
        isWirelessClient,
        stagesKeys,
        wlanAuthSettings,
        clientType,
        config,
        stages
      })}
      dataSource={items}
    />
  )
}

export { Details }



