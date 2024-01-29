import { useEffect, useState } from 'react'

import { Col, Form, FormListFieldData, Input, Row, Slider } from 'antd'
import { useIntl }                                          from 'react-intl'
import { useNavigate }                                      from 'react-router-dom'

import { Button, Fieldset, Loader, StepsForm, Tooltip }                from '@acx-ui/components'
import { DeleteOutlinedIcon }                                          from '@acx-ui/icons'
import { useGetAllInterfacesByTypeQuery, usePatchEdgeClusterMutation } from '@acx-ui/rc/services'
import {
  EdgeCluster,
  EdgeClusterTableDataType,
  EdgePortInfo,
  EdgePortTypeEnum,
  IpInSubnetPool,
  getSuggestedIpRange,
  networkWifiIpRegExp
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

import { InterfaceTable }        from './InterfaceTable'
import { SelectInterfaceDrawer } from './SelectInterfaceDrawer'
import * as UI                   from './styledComponents'

interface VirtualIpProps {
  currentCluster?: EdgeClusterTableDataType
  currentVipConfig?: EdgeCluster['virtualIpSettings']
}

export interface VirtualIpFormType {
  timeout: number
  vipConfig: {
    interfaces: {
      [key: string]: EdgePortInfo
    }
    vip: string
  }[]
}

export const VirtualIp = (props: VirtualIpProps) => {
  const { currentCluster, currentVipConfig } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const [selectInterfaceDrawerVisible, setSelectInterfaceDrawerVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const vipConfig = Form.useWatch('vipConfig', form)
  const [patchEdgeCluster] = usePatchEdgeClusterMutation()
  const {
    data: lanInterfaces,
    isLoading: isLanInterfacesLoading
  } = useGetAllInterfacesByTypeQuery({
    payload: {
      edgeIds: currentCluster?.edgeList?.map(node => node.serialNumber),
      portTypes: [EdgePortTypeEnum.LAN]
    }
  }, {
    skip: !currentCluster?.edgeList || currentCluster?.edgeList.length === 0
  })

  useEffect(() => {
    if(currentVipConfig) {
      const timeout = currentVipConfig.virtualIps?.[0]?.timeoutSeconds ?? 3
      const editVipConfig = [] as VirtualIpFormType['vipConfig']
      if(lanInterfaces) {
        for(let i=0; i<currentVipConfig.virtualIps.length; i++) {
          const currentConfig = currentVipConfig.virtualIps[i]
          const interfaces = {} as { [key: string]: EdgePortInfo }
          for(let config of currentConfig.ports) {
            const tmp = lanInterfaces?.[config.serialNumber].find(item =>
              item.portName === config.portName)
            interfaces[config.serialNumber] = tmp || {} as EdgePortInfo
          }
          editVipConfig.push({
            vip: currentConfig.virtualIp,
            interfaces
          })
        }
      }
      form.setFieldsValue({
        timeout,
        vipConfig: editVipConfig
      })
    }
  }, [currentVipConfig, lanInterfaces])

  const maxVipCount = 2

  const openDrawer = (index: number) => {
    setCurrentIndex(index)
    setSelectInterfaceDrawerVisible(true)
  }

  const handleFinish = async (values: VirtualIpFormType) => {
    try {
      const params = {
        venueId: currentCluster?.venueId,
        clusterId: currentCluster?.clusterId
      }
      const vipSettings = values.vipConfig.map(item => {
        const ports = Object.entries(item.interfaces).map(([, v2]) => {
          return {
            serialNumber: v2.serialNumber,
            portName: v2.portName
          }
        })
        return {
          virtualIp: item.vip,
          timeoutSeconds: values.timeout,
          ports
        }
      })
      const payload = {
        virtualIpSettings: {
          virtualIps: vipSettings
        }
      }
      await patchEdgeCluster({ params, payload }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleCancel = () => {
    navigate(clusterListPage)
  }

  const handleSelectPort = (data: { [key: string]: EdgePortInfo | undefined }, index?: number) => {
    if(index === undefined) return
    vipConfig[index].interfaces = data
    form.setFieldValue('vipConfig', vipConfig)
  }

  return (
    <Loader states={[{ isLoading: isLanInterfacesLoading }]}>
      <Row>
        <Col span={10}>
          <UI.Mt15>
            {
              // eslint-disable-next-line max-len
              $t({ defaultMessage: 'Please select the node interfaces and assign virtual IPs for seamless failover :' })
            }
          </UI.Mt15>
          <StepsForm
            form={form}
            onFinish={handleFinish}
            onCancel={handleCancel}
            buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
          >
            <StepsForm.StepForm>
              <UI.Mt15>
                <Row gutter={[16, 30]}>
                  <Col span={24}>
                    <Form.List
                      name='vipConfig'
                      initialValue={[{}]}
                    >
                      {
                        (fields, { add, remove }) => (
                          <Row gutter={[16, 20]}>
                            {
                              fields.map((field, index) =>
                                <Col key={`vip-${index}`} span={24}>
                                  <VipCard
                                    field={field}
                                    index={index}
                                    remove={remove}
                                    vipConfig={vipConfig}
                                    currentCluster={currentCluster}
                                    openDrawer={openDrawer}
                                  />
                                </Col>
                              )
                            }
                            <Col span={24}>
                              {
                                fields.length < maxVipCount &&
                                <Button
                                  type='link'
                                  onClick={() => add()}
                                  children={$t({ defaultMessage: 'Add another virtual IP' })}
                                />
                              }
                            </Col>
                          </Row>
                        )
                      }
                    </Form.List>
                  </Col>
                  <Col span={24}>
                    <StepsForm.Title>{$t({ defaultMessage: 'Failover Settings' })}</StepsForm.Title>
                    <Form.Item
                      label={
                        <>
                          {
                            $t({ defaultMessage: 'HA Timeout' })
                          }
                          <Tooltip.Question
                            title={$t({ defaultMessage: `
                            HA timeout refers to the duration within which if a node
                            does not receive a periodic heartbeat from the active node.
                            This triggers the process of selecting the next active node
                            to maintain system functionality
                            ` })}
                            placement='right'
                          />
                        </>
                      }
                      name='timeout'
                      initialValue={3}
                    >
                      <Slider
                        tooltipVisible={false}
                        style={{ width: '240px' }}
                        min={3}
                        max={15}
                        marks={{
                          3: $t({ defaultMessage: '3 seconds' }),
                          15: $t({ defaultMessage: '15 seconds' })
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </UI.Mt15>
            </StepsForm.StepForm>
          </StepsForm>
        </Col>
      </Row>
      <SelectInterfaceDrawer
        visible={selectInterfaceDrawerVisible}
        setVisible={setSelectInterfaceDrawerVisible}
        handleFinish={handleSelectPort}
        currentVipIndex={currentIndex}
        editData={vipConfig?.[currentIndex]?.interfaces}
        currentCluster={currentCluster}
        selectedInterfaces={vipConfig}
        lanInterfaces={lanInterfaces}
      />
    </Loader>
  )
}

const VipCard = ({
  field, index, remove, vipConfig, currentCluster, openDrawer
}: {
  field: FormListFieldData,
  index: number,
  remove: (index: number | number[]) => void
  vipConfig: {
    [key: number]: {
      interfaces: {
        [key: string]: EdgePortInfo
      }
      vip: string
    }
  },
  currentCluster?: EdgeClusterTableDataType,
  openDrawer: (index: number) => void
}) => {
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
                    nodeList={currentCluster?.edgeList}
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
              }
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