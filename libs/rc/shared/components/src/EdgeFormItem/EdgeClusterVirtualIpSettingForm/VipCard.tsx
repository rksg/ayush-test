import { Col, Form, FormListFieldData, Input, Row } from 'antd'
import { useIntl }                                  from 'react-intl'

import { Button, Fieldset }   from '@acx-ui/components'
import { DeleteOutlinedIcon } from '@acx-ui/icons'
import {
  EdgeClusterStatus,
  EdgePortInfo,
  IpInSubnetPool,
  getSuggestedIpRange,
  networkWifiIpRegExp
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { InterfaceTable } from './InterfaceTable'

interface VipCardProps {
  field: FormListFieldData
  index: number
  remove: (index: number | number[]) => void
  vipConfig: {
    [key: number]: {
      interfaces: {
        [key: string]: EdgePortInfo
      }
      vip: string
    }
  }
  currentClusterStatus?: EdgeClusterStatus
  openDrawer: (index: number) => void
}

export const VipCard = (props: VipCardProps) => {
  const { field, index, remove, vipConfig, currentClusterStatus, openDrawer } = props
  const { $t } = useIntl()

  return (
    <Fieldset
      key={field.key}
      label={
        $t({ defaultMessage: '#{index} Virtual IP' },
          { index: index + 1 })
      }
      switchStyle={{ display: 'none' }}
      checked={true}
      style={index !== 0 ? { paddingTop: 0 } : {}}
    >
      <Row>
        {
          index > 0 &&
          <Col span={24} style={{ textAlign: 'end' }}>
            <Button
              aria-label='delete'
              type='link'
              size='large'
              icon={<DeleteOutlinedIcon />}
              onClick={() => remove(field.name)}
            />
          </Col>
        }
        <Col span={18}>
          <Form.Item
            name={[index, 'interfaces']}
            rules={[
              {
                required: true,
                // eslint-disable-next-line max-len
                message: $t({ defaultMessage: 'Please select interfaces' })
              }
            ]}
            label={$t({ defaultMessage: 'Interfaces ' })}
          >
            {
              vipConfig?.[index]?.interfaces ?
                <>
                  <div style={{ textAlign: 'end' }}>
                    <Button
                      type='link'
                      onClick={() => openDrawer(index)}
                      children={
                        $t({ defaultMessage: 'Change' })
                      }
                    />
                  </div>
                  <InterfaceTable
                    nodeList={currentClusterStatus?.edgeList}
                    selectedInterface={vipConfig?.[index]?.interfaces}
                  />
                </>
                :
                <Button
                  type='link'
                  onClick={() => openDrawer(index)}
                  children={
                    $t({ defaultMessage: 'Select interface' })
                  }
                />
            }
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item
            name={[index, 'vip']}
            label={$t({ defaultMessage: 'Virtual IP Address' })}
            rules={[
              { required: true },
              { validator: (_, value) => networkWifiIpRegExp(value) },
              {
                validator: (_, value) => IpInSubnetPool(
                  value,
                  Object.values(vipConfig?.[index]?.interfaces ?? {})?.[0].ip,
                  Object.values(vipConfig?.[index]?.interfaces ?? {})?.[0].subnet
                )
              },
              { validator: (_, value) => validateVip(value, vipConfig?.[index]?.interfaces) }
            ]}
            extra={
              <SuggestedRange portInfo={Object.values(vipConfig?.[index]?.interfaces ?? {})?.[0]} />
            }
            children={<Input />}
            validateFirst
          />
        </Col>
      </Row>
    </Fieldset>
  )
}

const validateVip = (
  value: string,
  interfaces: { [key: string]: EdgePortInfo }
) => {
  if(!interfaces) return Promise.resolve()
  const validInterfaces = Object.values(interfaces)
    .filter(item => item.ip).map(item => item.ip.split('/')[0])
  const { $t } = getIntl()

  if (validInterfaces.includes(value)) {
    return Promise.reject(
      $t({ defaultMessage: 'Virtual IP cannot be the same as any node interface IP.' })
    )
  }
  return Promise.resolve()
}

const SuggestedRange = ({ portInfo }: { portInfo: EdgePortInfo }) => {
  const { $t } = useIntl()

  return (
    <span>
      {
        portInfo &&
        $t({ defaultMessage: 'Suggested range: {ip}' }, {
          ip: getSuggestedIpRange(
            portInfo?.ip,
            portInfo?.subnet
          )
        })
      }
    </span>
  )
}