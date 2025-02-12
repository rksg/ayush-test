import { useEffect, useState } from 'react'

import { Col, List, Row, Space, Typography } from 'antd'
import { QRCodeSVG }                         from 'qrcode.react'
import { useIntl }                           from 'react-intl'

import { GridCol, GridRow }                                        from '@acx-ui/components'
import { useGetCertificateTemplateQuery, useLazyNetworkListQuery } from '@acx-ui/rc/services'
import { CertTempActionContext, GenericActionPreviewProps }        from '@acx-ui/rc/utils'

import { ContentPreview } from './ContentPreview'

// eslint-disable-next-line max-len
export function CertTemplateActionPreview (props: GenericActionPreviewProps<CertTempActionContext>) {
  const { $t } = useIntl()
  const { data, ...rest } = props
  const [selectedSsid, setSelectedSsid] = useState<string>('')

  const { data: certificateTemplate } = useGetCertificateTemplateQuery({
    params: { policyId: data?.certTemplateId } })

  const { Title, Text } = Typography

  const [ getNetworkList , networkListResponse ] = useLazyNetworkListQuery({
    selectFromResult: ({ data }) => {
      return data?.data.map(network => network.ssid) ?? []
    }
  })

  useEffect(() => {
    if (certificateTemplate && certificateTemplate.networkIds
       && certificateTemplate.networkIds.length > 0) {
      getNetworkList({
        payload: {
          fields: ['name', 'ssid'],
          filters: { id: certificateTemplate.networkIds }
        }
      })
    }
  }, [certificateTemplate])

  useEffect(() => {
    if (networkListResponse.length === 1) {
      setSelectedSsid(networkListResponse[0])
    }
  }, [networkListResponse])

  return <ContentPreview body={
    <GridRow justify={'center'}>
      <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
        <Title level={2}>
          { $t({ defaultMessage: 'Connect to the network' }) }
        </Title>
      </GridCol>
      {(networkListResponse.length > 1 && selectedSsid === '') ?
        <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
          <Text strong>
            {$t({
              defaultMessage:
                'Install certificate in order to connect to the following networks:'
            })}
          </Text>
          <List
            dataSource={networkListResponse}
            renderItem={(ssid) => (
              <List.Item>
                <Row justify='space-between' style={{ width: '100%' }}>
                  <Col>
                    <Text strong>{ ssid }</Text>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
          <Text>
            {$t({
              defaultMessage:
                  'Scan or click the QR code to download the certificate:'
            })}
          </Text>
        </GridCol> :
        <><GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
          <Space>
            <Text>
              <span>{$t({ defaultMessage: 'Wi-Fi Network name: ' })} {selectedSsid}</span>
            </Text>
          </Space>
        </GridCol>
        <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
          <Text>
            {$t({
              defaultMessage:
                  // eslint-disable-next-line max-len
                  'Scan or click this QR code to download the certificate that is required in order to connect to the network:'
            })}
          </Text>
        </GridCol></>}
      <GridCol col={{ span: 24 }}>
        <Space direction='vertical' align='center'>
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
      <GridCol col={{ span: 24 }}>
        <Space direction='vertical' align='center'>
          <Text strong>
            <span>{$t({ defaultMessage: 'Certificate file password:' })} j4SyOxxF</span>
          </Text>
        </Space>
      </GridCol>
    </GridRow>
  }
  {...rest}
  />
}