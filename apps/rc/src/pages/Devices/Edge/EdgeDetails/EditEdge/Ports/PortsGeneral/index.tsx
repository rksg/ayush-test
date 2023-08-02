import { useContext, useEffect, useRef, useState } from 'react'

import { Form }                         from 'antd'
import { InternalNamePath, StoreValue } from 'antd/lib/form/interface'
import { isEqual, flatMap }             from 'lodash'
import { FormChangeInfo }               from 'rc-field-form/es/FormContext'
import { useIntl }                      from 'react-intl'

import { ContentSwitcher, ContentSwitcherProps, Loader, NoData, StepsFormLegacy, StepsFormLegacyInstance } from '@acx-ui/components'
import { useUpdatePortConfigMutation }                                                                     from '@acx-ui/rc/services'
import { EdgeIpModeEnum, EdgePort, EdgePortTypeEnum, serverIpAddressRegExp, subnetMaskIpRegExp }           from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                                           from '@acx-ui/react-router-dom'


import { EdgeEditContext } from '../..'

import { EdgePortWithStatus, lanPortsubnetValidator, PortConfigForm } from './PortConfigForm'


interface PortsGeneralProps {
  data: EdgePortWithStatus[]
}

export interface PortConfigFormType {
  [key: string]: EdgePortWithStatus[]
}

const PortsGeneral = (props: PortsGeneralProps) => {
  const { data } = props
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge')
  const [currentTab, setCurrentTab] = useState<string>('0')
  const formRef = useRef<StepsFormLegacyInstance<PortConfigFormType>>()
  const [updatePortConfig, { isLoading: isPortConfigUpdating }] = useUpdatePortConfigMutation()
  const editEdgeContext = useContext(EdgeEditContext)
  const dataRef = useRef<EdgePortWithStatus[] | undefined>(undefined)


  let tabData = [] as ContentSwitcherProps['tabDetails']
  let formData = {} as PortConfigFormType
  data.forEach((item, index) => {
    tabData.push({
      label: $t({ defaultMessage: 'Port {index}' }, { index: index + 1 }),
      value: `${index}`,
      children: <Form.List name={`port_${index}`}>
        {(fields) => fields.map(
          ({ key }) => <PortConfigForm
            formListKey={key}
            key={`port_${index}_${key}`}
            index={index}
          />
        )}
      </Form.List>
    })
    formData[`port_${index}`] = [item]
  })

  useEffect(() => {
    if(!dataRef.current) {
      dataRef.current = data
      return
    }
    if(!isEqual(dataRef.current, data)) {
      dataRef.current = data
      formRef.current?.resetFields()
    }
  }, [data])

  const handleTabChange = (value: string) => {
    setCurrentTab(value)
  }

  const handleFormChange = async (name: string, formInfo: FormChangeInfo) => {
    const changedField = formInfo.changedFields[0]
    if(changedField) {
      const changedNamePath = changedField.name as InternalNamePath
      const changedValue = changedField.value
      const index = Number(changedNamePath[0].toString().split('_')[1])

      if (changedNamePath.includes('portType')) {
        handlePortTypeChange(changedNamePath, changedValue, index)
      }
      editEdgeContext.setActiveSubTab({
        key: 'ports-general',
        title: $t({ defaultMessage: 'Ports General' })
      })
      // const formData = Object.values(formRef.current?.getFieldsValue(true))
      const formData = flatMap(formRef.current?.getFieldsValue(true))
      const errorTab = await validateData(formData as EdgePort[])
      editEdgeContext.setFormControl({
        ...editEdgeContext.formControl,
        isDirty: !isEqual(data, formData),
        hasError: errorTab > -1,
        discardFn: () => formRef.current?.resetFields(),
        applyFn: () => handleFinish()
      })
    }
  }

  const handlePortTypeChange = (changedNamePath: InternalNamePath, changedValue: StoreValue,
    index: number) => {

    if (changedValue === EdgePortTypeEnum.LAN) {
      formRef.current?.setFieldValue([changedNamePath[0], 'ipMode'], EdgeIpModeEnum.STATIC)

    } else if (changedValue === EdgePortTypeEnum.WAN) {
      const initialPortType = data[index]?.portType
      if (initialPortType !== EdgePortTypeEnum.WAN) {
        formRef.current?.setFieldValue([changedNamePath[0], 'natEnabled'], true)
      }
    }
  }

  const validateData = async (formData: EdgePort[]) => {
    for(const [index, item] of formData.entries()) {
      if(!item.enabled) continue
      if(item.portType === EdgePortTypeEnum.LAN) {
        if(!!!item.ip || !!!item.subnet || !await isIpSubnetValid(item.ip, item.subnet)) {
          return index
        }
        if(!await validateSubnetOverlapping(index, item)) {
          return index
        }
      }
      if(item.portType === EdgePortTypeEnum.WAN &&
          item.ipMode === EdgeIpModeEnum.STATIC) {
        if(!!!item.ip || !!!item.subnet || !!!item.gateway ||
          !await isIpSubnetValid(item.ip, item.subnet, item.gateway)) {
          return index
        }
        if(!await validateSubnetOverlapping(index, item)) {
          return index
        }
      }
    }
    return -1
  }

  const validateSubnetOverlapping = async (index: number, item: EdgePort) => {
    const listWithoutCurrent = Object.values<EdgePort>(formRef.current?.getFieldsValue(true))
      .filter((element, idx) => idx !== index)
      .map(element => ({ ip: element.ip, subnetMask: element.subnet }))
    try {
      await lanPortsubnetValidator({ ip: item.ip, subnetMask: item.subnet }, listWithoutCurrent)
    } catch (error) {
      return false
    }
    return true
  }

  const isIpSubnetValid = async (ip:string, subnet:string, gateway?: string) => {
    return await serverIpAddressRegExp(ip).then(() => true)
      .catch(() => false) &&
          await subnetMaskIpRegExp(subnet).then(() => true)
            .catch(() => false) &&
          await serverIpAddressRegExp(gateway || '').then(() => true)
            .catch(() => false)
  }

  const handleFinish = async () => {
    const formData = flatMap(formRef.current?.getFieldsValue(true))
    const errorTab = await validateData(formData as EdgePort[])
    if(errorTab > -1) {
      setCurrentTab(`${errorTab}`)
      return
    }

    try {
      await updatePortConfig({ params: params, payload: { ports: formData } }).unwrap()
      editEdgeContext.setFormControl({
        ...editEdgeContext.formControl,
        isDirty: false
      })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    data.length > 0 ?
      <Loader states={[{
        isLoading: false,
        isFetching: isPortConfigUpdating
      }]}>
        <StepsFormLegacy
          formRef={formRef}
          onFinish={handleFinish}
          onCancel={() => navigate(linkToEdgeList)}
          onFormChange={handleFormChange}
          buttonLabel={{ submit: $t({ defaultMessage: 'Apply Ports General' }) }}
        >
          <StepsFormLegacy.StepForm initialValues={formData}>
            <ContentSwitcher
              tabDetails={tabData}
              defaultValue='0'
              value={currentTab}
              onChange={handleTabChange}
              size='large'
              align='left'
            />
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Loader>
      : <NoData />
  )
}

export default PortsGeneral
