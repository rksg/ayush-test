/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable comma-dangle */
import { upperFirst, without } from 'lodash'
import { MessageDescriptor }   from 'react-intl'

import { Table, TableProps } from '@acx-ui/components'

import { authMethodsByCode }            from '../../authMethods'
import {  useNetworkHealthTestResults } from '../../services'
import { stage }                        from '../../stages'


// import {specs}
import { data as testData } from './data'

type RecordType = {
  key: string
  name: string
  givenName: string
  surname: string
  age: number
  description: string
  address: string,
  children?: RecordType[]
}



export const columns: TableProps<RecordType>['columns'] = [
  {
    title: 'AP Name',
    dataIndex: 'name',
    key: 'name',
    filterable: true,
    searchable: true
  },
  {
    title: 'AP MAC',
    dataIndex: 'age',
    key: 'age',
    align: 'center',
    filterable: true
  },
  {
    title: '802.11 Auth',
    dataIndex: 'description',
    key: 'description',
    render: (text, _, __, highlightFn) => <u>{highlightFn(text as string)}</u>,
    searchable: true
  },
  {
    title: 'Association',
    dataIndex: 'address',
    key: 'address',
    searchable: true
  },
  {
    title: 'EAP',
    dataIndex: 'address',
    key: 'address',
    searchable: true
  },
  {
    title: 'RADIUS',
    dataIndex: 'address',
    key: 'address',
    searchable: true
  },
  {
    title: 'DHCP',
    dataIndex: 'address',
    key: 'address',
    searchable: true
  },
  {
    title: 'DNS',
    dataIndex: 'address',
    key: 'address',
    searchable: true
  }
]

const Details = () => {

  const queryResults = useNetworkHealthTestResults()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = (queryResults?.data as any)?.config
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientType = (queryResults?.data as any)?.spec?.clientType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (queryResults?.data as any)?.aps?.items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wlanAuthSettings = (queryResults?.data as any)?.wlanAuthSettings

  console.log(queryResults)
  console.log(config)
  console.log(clientType)
  console.log(items)
  console.log(wlanAuthSettings)
  const isWirelessClient = clientType === 'virtual-wireless-client'
  const stagesFromConfig = (config : any) => {
    if (!config?.authenticationMethod) { return [] }
    const stages = [authMethodsByCode[config.authenticationMethod].stages, stage('dns')]
    if (config?.pingAddress) { stages.push(stage('ping')) }
    if (config?.tracerouteAddress) { stages.push(stage('traceroute')) }
    if (config?.speedTestEnabled) { stages.push(stage('speedTest')) }
    return stages
  }
  const genStageCol = (key : any) => ({
    title: (stages?.find((s : any) => s?.key === 'traceroute')?.title),
    dataIndex: 'name',
    key: 'name',
    filterable: true,
    searchable: true
  })

  const genSpeedCol = key => {
    return {
      title: upperFirst(key),
      dataIndex: 'name',
      key: 'name',
      filterable: true,
      searchable: true
    }
  }

  const stages = stagesFromConfig(config)?.map(
    ({ key, title }: { key: any; title: MessageDescriptor }) => ({
      key,
      title
      // title: title?.replace('Authentication', 'Auth'),
    })
  )
  const columns: TableProps<RecordType>['columns'] = [
    {
      title: isWirelessClient ? ('Target AP Name') : ('AP Name'),
      dataIndex: 'apName',
      key: 'apName',
      filterable: true,
      searchable: true
    },
    {
      title: isWirelessClient ? ('Target AP MAC') : ('AP MAC'),
      dataIndex: 'apMac',
      key: 'apMac',
      align: 'center',
      filterable: true
    }
  ]
  if (isWirelessClient) {
    columns.push(
      {
        title: 'Station AP Name',
        dataIndex: 'name',
        key: 'name',
        filterable: true,
        searchable: true
      },
      {
        title: 'Station AP MAC',
        dataIndex: 'name',
        key: 'name',
        filterable: true,
        searchable: true
      },
      {
        title: 'Station AP SNR',
        dataIndex: 'name',
        key: 'name',
        filterable: true,
        searchable: true
      }
    )
  }
  if (config?.tracerouteAddress) {
    columns.push({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      title: (stages.find((s : any) => s.key === 'traceroute').title),
      dataIndex: 'name',
      key: 'name',
      filterable: true,
      searchable: true
    })
  }
  if (config?.speedTestEnabled) {
    columns.push(
      genSpeedCol('upload'),
      genSpeedCol('download')
    )
  }
  const stagesKeys = stages.map(s => s.key)

  columns.push(...without(stagesKeys, 'ping', 'traceroute', 'speedTest').map(s => genStageCol(s)))
  console.log(columns)

  return <Table<RecordType>
    columns={columns}
    dataSource={items}
  />
}

export { Details }



