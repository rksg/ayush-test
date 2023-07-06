import { MessageDescriptor } from 'react-intl'

import { Table, Loader } from '@acx-ui/components'

import { authMethodsByCode }                                         from '../../authMethods'
import { useServiceGuardTestResults }                                from '../../services'
import { stage }                                                     from '../../stages'
import { ClientType, ServiceGuardConfig, TestResultByAP, TestStage } from '../../types'

import { getTableColumns } from './helper'

const Details = () => {
  const { tableQuery: queryResults, onPageChange, pagination } = useServiceGuardTestResults()
  const config = queryResults?.data?.config as ServiceGuardConfig
  const items = queryResults?.data?.aps?.items
  const totalTests = queryResults?.data?.aps?.total
  const clientType = queryResults?.data?.spec?.clientType
  const wlanAuthSettings = queryResults?.data?.wlanAuthSettings
  const isWirelessClient = clientType === ClientType.VirtualWirelessClient
  const stagesFromConfig = (config: ServiceGuardConfig) => {
    if (!config?.authenticationMethod) {
      return []
    }
    const stages = [...authMethodsByCode[config.authenticationMethod].stages, stage('dns')]
    if (config?.pingAddress) {
      stages.push(stage('ping'))
    }
    if (config?.tracerouteAddress) {
      stages.push(stage('traceroute'))
    }
    if (config?.speedTestEnabled) {
      stages.push(stage('speedTest'))
    }
    return stages
  }
  const stages = stagesFromConfig(config)?.map(
    ({ key, title }: { key: TestStage; title: MessageDescriptor }) => ({
      key,
      title
    })
  )
  const id = [
    'network-health',
    clientType,
    config?.authenticationMethod,
    'table'
  ].join('-').toLowerCase()
  const stagesKeys = stages.map((s) => s.key) as TestStage[]
  return (
    <Loader states={[queryResults]}>
      <Table<TestResultByAP>
        settingsId={id}
        columns={getTableColumns({
          isWirelessClient,
          stagesKeys,
          wlanAuthSettings,
          clientType,
          config,
          stages
        })}
        dataSource={items}
        onChange={onPageChange}
        pagination={{ ...pagination, total: totalTests || 0 }}
      />
    </Loader>
  )
}

export { Details }
