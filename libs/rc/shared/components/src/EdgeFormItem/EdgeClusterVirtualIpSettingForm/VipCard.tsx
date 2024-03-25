import { Col, Form, FormListFieldData, Input, Row } from 'antd'
import { useIntl }                                  from 'react-intl'

import { Button, Fieldset, useStepFormContext } from '@acx-ui/components'
import { DeleteOutlinedIcon }                   from '@acx-ui/icons'
import {
  EdgeIpModeEnum,
  EdgePortInfo,
  EdgeStatus,
  IpInSubnetPool,
  getSuggestedIpRange,
  networkWifiIpRegExp,
  validateSubnetIsConsistent
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
  rootNamePath?: string[],
  nodeList?: EdgeStatus[]
  lanInterfaces?: {
    [key: string]: EdgePortInfo[]
  }
}

export const VipCard = (props: VipCardProps) => {
  const {
    field, index, remove, vipConfig, rootNamePath = [], nodeList,
    lanInterfaces
  } = props
  const { $t } = useIntl()
  const { form } = useStepFormContext()
  const isCluster = (nodeList?.length ?? 0) > 1

  const handleTableClear = () => {
    form.setFieldValue(rootNamePath.concat([`${index}`, 'vip']), '')
    if (!isCluster)
      form.validateFields()
  }

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
              ...(
                isCluster || Boolean(vipConfig?.[index]?.vip) ? [{
                  required: true,
                  message: $t({ defaultMessage: 'Please select interfaces' })
                }] : []
              ),
              { validator: (_, value) => validateInterfaces(value, nodeList) }
            ]}
            label={$t({ defaultMessage: 'Interfaces ' })}
            validateFirst
          >
            <InterfaceTable
              index={index}
              nodeList={nodeList}
              lanInterfaces={lanInterfaces}
              selectedInterfaces={vipConfig ? Object.values(vipConfig) : []}
              onClear={handleTableClear}
            />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item
            name={[index, 'vip']}
            label={$t({ defaultMessage: 'Virtual IP Address' })}
            rules={[
              ...(
                isCluster || (Boolean(vipConfig?.[index]?.interfaces) &&
                Object.keys(vipConfig?.[index]?.interfaces).length > 0) ?
                  [{ required: true }] :
                  []
              ),
              { validator: (_, value) => networkWifiIpRegExp(value) },
              {
                validator: (_, value) => validateIpInSubnetPool(
                  value,
                  vipConfig?.[index]?.interfaces
                )
              },
              { validator: (_, value) => validateVip(value, vipConfig?.[index]?.interfaces) }
            ]}
            extra={
              <SuggestedRange portInfo={Object.values(vipConfig?.[index]?.interfaces ?? {})} />
            }
            children={<Input />}
            validateFirst
          />
        </Col>
      </Row>
    </Fieldset>
  )
}

const validateInterfaces = async (
  interfaces?: { [key: string]: EdgePortInfo },
  nodeList?: EdgeStatus[]
) => {
  const { $t } = getIntl()
  const interfacesArr = interfaces ? Object.values(interfaces).filter(item => item.portName) : []
  const nodeLength = nodeList?.length ?? 0

  if(nodeLength > 1 && interfacesArr.length !== nodeLength) {
    return Promise.reject(
      // eslint-disable-next-line max-len
      $t({ defaultMessage: 'Please make sure you select an interface and configure the IP subnet for the SmartEdge(s).' })
    )
  }

  try {
    for(let interfaceInfo of interfacesArr) {
      await networkWifiIpRegExp(interfaceInfo.ip?.split('/')[0])
    }
  } catch (error) {
    return Promise.reject(error)
  }

  try {
    await validateSubnetIsConsistent(interfacesArr.map(item => ({
      ip: item.ip?.split('/')[0],
      subnet: item.subnet
    })))
  } catch (error) {
    return Promise.reject(
      $t({ defaultMessage: 'Make sure that each node is within the same subnet range.' })
    )
  }

  return Promise.resolve()
}

const validateIpInSubnetPool = (
  value: string,
  interfaces?: { [key: string]: EdgePortInfo }
) => {
  const nonDhcpInterfaces = interfaces && Object.values(interfaces)
    .filter(item => item.ipMode !== EdgeIpModeEnum.DHCP)
  if(
    !value ||
    !interfaces ||
    // Not to perform validation when there is no static port
    !nonDhcpInterfaces?.length
  ) return Promise.resolve()
  return IpInSubnetPool(
    value,
    nonDhcpInterfaces[0]?.ip,
    nonDhcpInterfaces[0]?.subnet
  )
}

const validateVip = (
  value: string,
  interfaces?: { [key: string]: EdgePortInfo }
) => {
  if(!interfaces) return Promise.resolve()
  const validInterfaces = Object.values(interfaces)
    .filter(item => item.ip && item.ipMode !== EdgeIpModeEnum.DHCP)
    .map(item => item.ip.split('/')[0])
  const { $t } = getIntl()

  if (validInterfaces.includes(value)) {
    return Promise.reject(
      $t({ defaultMessage: 'Virtual IP cannot be the same as any node interface IP.' })
    )
  }
  return Promise.resolve()
}

const SuggestedRange = ({ portInfo }: { portInfo: EdgePortInfo[] }) => {
  const { $t } = useIntl()

  const hasDhcpPort = portInfo.some(item => item.ipMode === EdgeIpModeEnum.DHCP)

  return (
    <span>
      {
        portInfo.length > 0 &&
        $t({ defaultMessage: 'Suggested range: {ip}' }, {
          ip: hasDhcpPort ?
            '--' :
            getSuggestedIpRange(
              portInfo[0]?.ip,
              portInfo[0]?.subnet
            )
        })
      }
    </span>
  )
}