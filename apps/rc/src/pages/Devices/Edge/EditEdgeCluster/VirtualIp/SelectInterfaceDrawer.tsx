
import { useEffect, useState } from 'react'

import { Col, Form, Row }    from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import _                     from 'lodash'
import { useIntl }           from 'react-intl'

import { Drawer, Select }                                                         from '@acx-ui/components'
import { EdgeClusterTableDataType, EdgePortInfo, getIpWithBitMask, optionSorter } from '@acx-ui/rc/utils'
import { getIntl }                                                                from '@acx-ui/utils'

import * as UI from './styledComponents'

import { VirtualIpFormType } from '.'

const Netmask = require('netmask').Netmask

interface SelectInterfaceDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  handleFinish: (data: { [key: string]: EdgePortInfo | undefined }, index?: number) => void
  currentVipIndex?: number
  currentClusterStatus?: EdgeClusterTableDataType
  lanInterfaces?: {
    [key: string]: EdgePortInfo[]
  }
  selectedInterfaces?: VirtualIpFormType['vipConfig']
  editData?: { [key: string]: EdgePortInfo | undefined }
}

interface SelectInterfaceDrawerFormType {
  [key: string]: { port: string }
}

export const SelectInterfaceDrawer = (props: SelectInterfaceDrawerProps) => {
  const {
    visible, setVisible, currentVipIndex = 0,
    currentClusterStatus, handleFinish: handleOk , editData,
    selectedInterfaces, lanInterfaces
  } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [
    lanInterfacesOptions,
    setLanInterfacesOptions
  ] = useState<{ [key: string]: DefaultOptionType[] }>({})

  useEffect(() => {
    if(lanInterfaces) {
      const interfacesOptions = {} as { [key: string]: DefaultOptionType[] }
      for(let[k, v] of Object.entries(lanInterfaces)) {
        interfacesOptions[k] = v.map(item => ({
          label: _.capitalize(item.portName),
          value: item.portName
        })).sort(optionSorter)
      }
      setLanInterfacesOptions(interfacesOptions)
    }
  }, [lanInterfaces])

  useEffect(() => {
    form.resetFields()
    if(visible && editData) {
      const tmp = {} as SelectInterfaceDrawerFormType
      for(let [k, v] of Object.entries(editData)) {
        tmp[k] = { port: v?.portName ?? '' }
      }
      form.setFieldsValue(tmp)
    }
  }, [visible, editData])

  const handleClose = () => {
    setVisible(false)
  }

  const handleSave = async () => {
    form.submit()
  }

  const handleFinish = async (data: SelectInterfaceDrawerFormType) => {
    const result = {} as { [key: string]: EdgePortInfo | undefined }
    for(let [k, v] of Object.entries(data)) {
      result[k] = lanInterfaces?.[k].find(lanInterface => lanInterface.portName === v.port)
    }
    handleOk(result, currentVipIndex)
    handleClose()
  }

  const filterPortOptions = (
    options: DefaultOptionType[],
    targetSerialNumber: string
  ) => {
    if(!options || options.length === 0) return
    if(!selectedInterfaces) return options
    const selctedPortNames = Object.values(selectedInterfaces).map(item =>
      item?.interfaces?.[targetSerialNumber].portName).filter(item => item !== undefined)
    const editPortName = editData?.[targetSerialNumber]?.portName
    return options.filter(option =>
      !selctedPortNames.includes(option.value + '') || editPortName === option.value)
  }

  const getAllIpForValidation = () => {
    const formData = form.getFieldsValue() as SelectInterfaceDrawerFormType
    return Object.entries(formData).map(([k, v]) => {
      const target = lanInterfaces?.[k].find(item => item.portName === v.port)
      return {
        ip: target?.ip,
        subnet: target?.subnet
      }
    }).filter(item => Boolean(item.ip))
  }

  const drawerContent = (
    <Form
      form={form}
      onFinish={handleFinish}
      layout='vertical'
    >
      <Row gutter={[16, 10]}>
        {
          currentClusterStatus?.edgeList?.map(item => (
            <Col key={`node-${item.serialNumber}`} span={24}>
              <UI.EdgeNameHeadLine>{item.name}</UI.EdgeNameHeadLine>
              <Form.Item
                name={[item.serialNumber, 'port']}
                label={$t({ defaultMessage: 'Select Port' })}
                rules={[
                  {
                    required: true,
                    message: $t({ defaultMessage: 'Please select a port' })
                  },
                  { validator: (_, value) =>
                    validateSubnetIsConsistent(getAllIpForValidation(), value) }
                ]}
                extra={
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, cur) => {
                      return prev?.[item.serialNumber]?.port !== cur?.[item.serialNumber]?.port
                    }}
                  >
                    {({ getFieldValue }) => {
                      const currentPort = getFieldValue([item.serialNumber, 'port'])
                      const currentInterface = lanInterfaces?.[item.serialNumber]?.find(item =>
                        item.portName === currentPort)
                      return currentPort && $t({ defaultMessage: 'IP subnet: {ip}' },
                        {
                          ip: getIpWithBitMask(currentInterface?.ip, currentInterface?.subnet)
                        })
                    }}
                  </Form.Item>
                }
                children={
                  <Select
                    children={
                      filterPortOptions(
                        lanInterfacesOptions[item.serialNumber],
                        item.serialNumber
                      )?.map(option => (
                        <Select.Option
                          key={option.value}
                          value={option.value}
                          children={option.label}
                          disabled={
                            !lanInterfaces?.[item.serialNumber]?.find(item =>
                              item.portName === option.value)?.ip
                          }
                        />
                      ))
                    }
                  />
                }
                validateFirst
              />

            </Col>
          ))
        }
      </Row>
    </Form>
  )

  const footer = (
    <Drawer.FormFooter
      buttonLabel={{
        save: $t({ defaultMessage: 'OK' })
      }}
      onCancel={handleClose}
      onSave={handleSave}
    />
  )

  return (
    <Drawer
      title={$t(
        { defaultMessage: 'Select Interfaces: #{vipIndex} Virtual IP' },
        { vipIndex: currentVipIndex + 1 }
      )}
      visible={visible}
      onClose={handleClose}
      children={drawerContent}
      footer={footer}
    />
  )
}

const validateSubnetIsConsistent = (allIps: { ip?: string, subnet?: string }[], value?: string) => {
  if(!allIps || allIps.length < 2 || !value) return Promise.resolve()
  const { $t } = getIntl()
  for(let i=0; i<allIps.length; i++) {
    for(let j=i+1; j<allIps.length; j++) {
      if(i === allIps.length - 1) break
      const first = new Netmask(`${allIps[i].ip}/${allIps[i].subnet}`)
      const second = new Netmask(`${allIps[j].ip}/${allIps[j].subnet}`)
      if(first.first !== second.first || first.last !== second.last) {
        // eslint-disable-next-line max-len
        return Promise.reject($t({ defaultMessage: 'The selected port is not in the same subnet as other nodes.' }))
      }
    }
  }
  return Promise.resolve()
}