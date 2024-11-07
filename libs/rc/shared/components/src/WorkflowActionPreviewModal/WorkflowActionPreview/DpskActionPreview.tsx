import { useEffect, useState } from 'react'

import { Col, List, Row, Space, Typography } from 'antd'
import { QRCodeSVG }                         from 'qrcode.react'
import { useIntl }                           from 'react-intl'

import { GridCol, GridRow }                             from '@acx-ui/components'
import { QrCodeSmallIcon }                              from '@acx-ui/icons'
import { useGetDpskQuery, useLazyNetworkListQuery }     from '@acx-ui/rc/services'
import { DpskActionContext, GenericActionPreviewProps } from '@acx-ui/rc/utils'

import { ContentPreview } from './ContentPreview'

export function DpskActionPreview (props: GenericActionPreviewProps<DpskActionContext>) {
  const { $t } = useIntl()
  const { data, ...rest } = props
  const [selectedSsid, setSelectedSsid] = useState<string>('')

  const { data: dpskService } = useGetDpskQuery({
    params: { serviceId: data?.dpskPoolId }
  })

  const { Title, Text, Link } = Typography

  const [ getNetworkList, networkListResponse ] = useLazyNetworkListQuery({
    selectFromResult: ({ data }) => {
      return data?.data.map(network => network.ssid) ?? []
    }
  })

  useEffect(() => {
    if (dpskService && dpskService.networkIds && dpskService.networkIds.length > 0) {
      getNetworkList({
        payload: {
          fields: ['name', 'ssid'],
          filters: { id: dpskService.networkIds }
        }
      })
    }
  }, [dpskService])

  useEffect(() => {
    if (networkListResponse.length === 1) {
      setSelectedSsid(networkListResponse[0])
    }
  }, [networkListResponse])

  return <ContentPreview body={
    (networkListResponse.length > 1 && selectedSsid === '') ?
      <GridRow justify={'center'}>
        <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
          <Title level={2}>
            { $t({ defaultMessage: 'Select a network to connect:' }) }
          </Title>
          <Space>
            <Text strong>
              { $t({ defaultMessage: 'Personal password: ' }) }
            </Text>
            <Text>$aMgj23Klpz</Text>
          </Space>
          <List
            bordered
            dataSource={networkListResponse}
            renderItem={(ssid) => (
              <List.Item>
                <Row justify='space-between' style={{ width: '100%' }}>
                  <Col>
                    <Text>{ ssid }</Text>
                  </Col>
                  <Col>
                    <Space align='baseline'>
                      {/* eslint-disable-next-line max-len */}
                      <Link onClick={() => setSelectedSsid(ssid)}>{ $t({ defaultMessage: 'Connect' }) }</Link>
                      <QrCodeSmallIcon/>
                    </Space>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </GridCol>
      </GridRow> :
      <GridRow>
        <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
          <Title level={2}>
            { $t({ defaultMessage: 'Connect to the network:' }) }
          </Title>
        </GridCol>
        <GridCol col={{ span: 20 }}>
          <Space>
            <Text strong>
              { $t({ defaultMessage: 'Wi-Fi Network name: ' }) }
            </Text>
            <Text>{ selectedSsid }</Text>
          </Space>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <Space>
            <Text strong>
              { $t({ defaultMessage: 'Personal password: ' }) }
            </Text>
            <Text>$aMgj23Klpz</Text>
          </Space>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <Space direction='vertical' align='center'>
            <Text>
              { $t({ defaultMessage: 'Scan or click this QR code to connect to the network:' }) }
            </Text>
            <QRCodeSVG
              value={`WIFI:T:WPA;S:${selectedSsid};P:$aMgj23Klpz;H:false;`}
              size={180}
              bgColor={'#ffffff'}
              fgColor={'#000000'}
              level={'L'}
              includeMargin={false}
              onClick={() => setSelectedSsid('')}
            />
          </Space>
        </GridCol>
      </GridRow>
  }
  {...rest}
  />
}
