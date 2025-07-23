import { useState, useEffect, useCallback  } from 'react'

import { Form, Input, List, Row, Space, Typography } from 'antd'
import { useIntl }                                   from 'react-intl'

import { GridCol, GridRow }                                                     from '@acx-ui/components'
import { useLazyGetMacRegListQuery,useLazyNetworkListQuery }                    from '@acx-ui/rc/services'
import { GenericActionPreviewProps, MacRegAction, MacRegistrationFilterRegExp } from '@acx-ui/rc/utils'

import { ContentPreview } from './ContentPreview'
interface MacRegOnboardedVariables {
  macAddress?: string
  networks : string[]
}

function MacRegOnboardedPreview (props: { onboard: MacRegOnboardedVariables }) {
  const { $t } = useIntl()
  const { Text, Link } = Typography
  const { onboard } = props
  const networkList :string[] = onboard?.networks
  const [selectedSsid, setSelectedSsid] = useState<string>('')
  const macAddress = onboard?.macAddress
  useEffect(() => {
    if (networkList.length === 1) {
      setSelectedSsid(networkList[0])
    }
  }, [networkList])
  return (

    <Space direction='vertical' size='large'>
      <br/>
      <Text>
        {$t({ defaultMessage: 'The device with MAC address ' })+' '}
        <Text strong data-testid='macAdd'>{macAddress} </Text>
        {$t({ defaultMessage: ' is now allowed to connect to the following network:' })}
      </Text>
      <List bordered
        dataSource={selectedSsid ? [selectedSsid] : networkList}
        renderItem={
          (ssid, index) => (
            (ssid && ssid.trim().length > 0) && <List.Item>
              <Row justify='space-between' style={{ width: '100%' }}>
                <Space align='baseline'>
                  {(networkList.length > 1) ?
                    <Link data-testid={`lnw-${index}`}
                      onClick={() => setSelectedSsid(selectedSsid ? '' : ssid)}
                      strong={true} >
                      <Text strong={true}><b>{ssid}</b><br/></Text>
                    </Link>
                    : <Text strong={true}><b>{selectedSsid}</b><br/></Text>
                  }
                </Space>
              </Row>
            </List.Item>
          )} />
      <br/>
    </Space>
  )
}

// eslint-disable-next-line max-len
function MacRegActionInputPreview (props: { data?: MacRegOnboardedVariables , onMacAddressChange: (value: string)=>void }){
  const { $t } = useIntl()
  const { data , onMacAddressChange } = props

  return (
    <GridRow justify={'center'} align={'middle'}>
      <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
        <br/>
        <br/>
        <Form layout='vertical' style={{ width: '250px' }} initialValues={data}>
          <Form.Item
            label={$t({ defaultMessage: 'Enter the MAC address of your device here' })}
            name={'macAddress'}
            rules={[{ required: true },
              { validator: (_, value) => MacRegistrationFilterRegExp(value) }
            ]}
          >
            <Input onChange={(e)=>onMacAddressChange(e.currentTarget?.value)}/>
          </Form.Item>
        </Form>
      </GridCol>
    </GridRow>
  )
}


export function MacRegActionPreview (props: GenericActionPreviewProps<MacRegAction>) {
  const { data, ...rest } = props
  const [page, setPage] = useState('macInputPreview')
  const [macAddress, setMacAddress] = useState<string>('')
  const [ getMacRegPool] = useLazyGetMacRegListQuery()
  const [ getNetworkList, networkListResponse ] = useLazyNetworkListQuery({
    selectFromResult: ({ data }) => {
      return data?.data.map(network => network.ssid) ?? []
    }
  })
  const loadMacRegNetworks = useCallback((macRegListId: string) => {
    if (!macRegListId || !data?.valid) {
      return
    }
    getMacRegPool({
      params: { policyId: macRegListId }
    }).then(response => {
      if (response.data?.networkIds && response.data?.networkIds.length > 0) {
        getNetworkList({
          payload: {
            fields: ['name', 'ssid']
            ,filters: { id: response.data.networkIds }
          }
        })
      }
    })
  }, [getMacRegPool, getNetworkList])


  useEffect(() => {
    if (data?.macRegListId) {
      loadMacRegNetworks(data?.macRegListId)
    }
  }, [data?.macRegListId, loadMacRegNetworks])

  const macInputPreview = <MacRegActionInputPreview
    data={{ macAddress: macAddress, networks: networkListResponse }}
    onMacAddressChange={setMacAddress}/>

  const onBoardPreview= <MacRegOnboardedPreview
    onboard={{ macAddress: macAddress, networks: networkListResponse }}/>


  return <ContentPreview

    body={page === 'macInputPreview' ? macInputPreview : onBoardPreview}
    onNext={() => {
      if(macAddress){
        setPage('onBoardPreview')
      }
    }}
    onBack={() => {
      setPage('macInputPreview')
    }}
    {...rest}
  />
}
