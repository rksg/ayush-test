import { useContext, useEffect, useState } from 'react'

import { Form, Input, Col, Radio, Row, Space } from 'antd'
import { useIntl }                             from 'react-intl'

import { Loader, StepsForm, Table, TableProps }               from '@acx-ui/components'
import { useLazyNetworkListQuery }                            from '@acx-ui/rc/services'
import { DHCPConfigTypeEnum, checkObjectNotExists, DHCPPool } from '@acx-ui/rc/utils'
import { useParams }                                          from '@acx-ui/react-router-dom'

import { dhcpTypes, dhcpTypesDesc } from './contentsMap'
import { DHCPDiagram }              from './DHCPDiagram/DHCPDiagram'
import DHCPFormContext              from './DHCPFormContext'
import { PoolDetail }               from './DHCPPool/PoolDetail'
import { RadioDescription }         from './styledComponents'


const { useWatch } = Form
const defaultArray: DHCPPool[] = []
export function SettingForm () {
  const intl = useIntl()


  const type = useWatch<DHCPConfigTypeEnum>('dhcpConfig')

  const { data } = useContext(DHCPFormContext)

  // const dhcpListPayload = {
  //   searchString: '',
  //   fields: ['name', 'id'],
  //   searchTargetFields: ['name'],
  //   filters: {},
  //   pageSize: 10000
  // }
  const [getNetworkList] = useLazyNetworkListQuery()
  const params = useParams()
  const [tableData, setTableData] = useState(defaultArray)

  // const nameValidator = async (value: string) => {
  //   const payload = { ...networkListPayload, searchString: value }

  //   const list = (await getDHCPList({ params, payload }, true).unwrap()).data
  //     .filter(n => n.id !== params.serviceId)
  //     .map(n => n.name)
  //   return checkObjectNotExists(intl, list, value, intl.$t({ defaultMessage: 'Service' }))
  // }

  const types = [
    { type: DHCPConfigTypeEnum.SIMPLE },
    { type: DHCPConfigTypeEnum.MULTIPLE },
    { type: DHCPConfigTypeEnum.HIERARCHICAL }
  ]
  const columns: TableProps<DHCPPool>['columns'] = [
    {
      title: intl.$t({ defaultMessage: 'Pool Name' }),
      dataIndex: 'name',
      width: 10,
      sorter: true
    },
    {
      title: intl.$t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ip',
      width: 10,
      sorter: true
    },
    {
      title: intl.$t({ defaultMessage: 'Subnet Mask' }),
      dataIndex: 'mask',
      width: 10,
      sorter: true
    },
    {
      title: intl.$t({ defaultMessage: 'Lease Time' }),
      width: 50,
      dataIndex: 'leaseTime'
    },
    {
      title: intl.$t({ defaultMessage: 'Vlan' }),
      width: 50,
      dataIndex: 'vlan'
    },
    {
      title: intl.$t({ defaultMessage: 'Number of hosts' }),
      width: 50,
      dataIndex: 'leaseTime'
    }
  ]
  useEffect(() => {
    if(data?.dhcpPools)
    {
      setTableData(data?.dhcpPools)
    }
  }, [data])
  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>{intl.$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item
          name='name'
          label={intl.$t({ defaultMessage: 'Service Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 }
            // { validator: (_, value) => nameValidator(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Form.Item
          name='tags'
          label={intl.$t({ defaultMessage: 'Tags' })}
          children={<Input />}
        />
        <Form.Item>

          {params?.type === 'wifi' &&
          <Form.Item
            name='dhcpConfig'
            initialValue={DHCPConfigTypeEnum.SIMPLE}
            label={intl.$t({ defaultMessage: 'DHCP Configuration' })}
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Space direction='vertical'>
                {types.map(({ type }) => (
                  <Radio key={type} value={type}>
                    {intl.$t(dhcpTypes[type])}
                    <RadioDescription>
                      {intl.$t(dhcpTypesDesc[type])}
                    </RadioDescription>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>}

        </Form.Item>
        <PoolDetail></PoolDetail>
        <Loader>
          <Table
            rowKey='id'
            style={{ width: '800px' }}
            columns={columns}
            dataSource={[...tableData]}
            type={'tall'}

          />
        </Loader>
      </Col>
      {params?.type === 'wifi' &&
      <Col span={14}>
        <DHCPDiagram type={type}/>
      </Col>
      }
    </Row>
  )
}
