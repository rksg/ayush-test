import React, { useEffect, useState } from 'react'

import { ProFormCheckbox, ProFormInstance, ProFormText } from '@ant-design/pro-form'
import { Button, Divider }                               from 'antd'
import { useIntl }                                       from 'react-intl'

import { cssStr }                             from '@acx-ui/components'
import { CrownSolid, OnboardingAssistantDog } from '@acx-ui/icons'
import { VlanSettingDrawer }                  from '@acx-ui/rc/components'
import {
  useCreateOnboardConfigsMutation,
  useDeleteOnboardConfigsMutation,
  useLazyGetVlanOnboardConfigsQuery,
  useUpdateOnboardConfigsMutation
} from '@acx-ui/rc/services'
import { validateVlanExcludingReserved, Vlan } from '@acx-ui/rc/utils'

import { checkHasRegenerated } from './steps.utils'
import * as UI                 from './styledComponents'


type NetworkConfig = {
  'Purpose': string;
  'VLAN ID': string;
  'VLAN Name': string;
  'Checked': boolean;
  'id': string;
}

export function VlanStep (props: {
  payload: string,
  sessionId: string,
  description: string,
  showAlert: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formInstance: ProFormInstance<any> | undefined
}) {
  const { formInstance } = props
  const { $t } = useIntl()
  const initialData = JSON.parse(props.payload || '[]') as NetworkConfig[]
  const [data, setData] = useState<NetworkConfig[]>(initialData)
  const [checkboxStates, setCheckboxStates] =
  useState<boolean[]>(Array(initialData.length).fill(true))

  // eslint-disable-next-line max-len
  const [configVlanNames, setConfigVlanNames] = useState<string[]>(data.map(vlan => vlan['VLAN Name']))
  const [configVlanIds, setConfigVlanIds] = useState<string[]>(data.map(vlan => vlan['VLAN ID']))
  const [isSetupComplete, setIsSetupComplete] = useState<boolean[]>(Array(data.length).fill(false))
  // eslint-disable-next-line max-len
  const [isDulicateUntaggedPorts, setIsDulicateUntaggedPorts] = useState<boolean[]>(Array(data.length).fill(false))
  const [configId, setConfigId] = useState('')
  const [configVisible, setConfigVisible] = useState(false)
  const [configIndex, setConfigIndex] = useState<number>(0)

  const [selectedVlanProfile, setSelectedVlanProfile] = useState<Vlan>()
  const [vlanTable, setVlanTable] = useState<Vlan[]>([])
  const [disabledKeys, setDisabledKeys] = useState([] as string[])

  useEffect(() => {
    if (checkHasRegenerated(data, initialData)) {
      const isInitialEmpty = initialData.length === 0
      const sourceData = isInitialEmpty
        ? data.map(item => ({ ...item, Checked: false }))
        : initialData

      formInstance?.setFieldsValue({ data: sourceData })

      setData(sourceData)
      setCheckboxStates(Array(sourceData.length).fill(isInitialEmpty ? false : true))
      setConfigVlanIds(sourceData.map(vlan => vlan['VLAN ID']))
      setConfigVlanNames(sourceData.map(vlan => vlan['VLAN Name']))
      setDisabledKeys(isInitialEmpty ? sourceData.map((_, index) => index.toString()) : [])

      if (!isInitialEmpty) {
        setIsSetupComplete(Array(data.length).fill(false))
        setIsDulicateUntaggedPorts(Array(data.length).fill(false))
      }
    }
  }, [props.payload])


  const checkDuplicateUntaggedPorts = (vlanTable: Vlan[], index: number) => {
    const currentSwitchFamilyModels = vlanTable.find(i => i.key === index)?.switchFamilyModels
    if (!currentSwitchFamilyModels) return false

    const otherVlanEntries = vlanTable.filter(i => i.key !== index)

    let duplicateFound = false
    otherVlanEntries.forEach(vlan => {
      vlan.switchFamilyModels?.forEach(otherModel => {
        currentSwitchFamilyModels.forEach(currentModel => {
          const currentPorts = currentModel.untaggedPorts?.split(',').map(port => port.trim()) || []
          const otherPorts = otherModel.untaggedPorts?.split(',').map(port => port.trim()) || []

          if (currentPorts.some(port => otherPorts.includes(port))) {
            duplicateFound = true
            return
          }
        })
      })
    })

    return duplicateFound
  }

  const handleDuplicateUntaggedPorts = async (vlanTable: Vlan[], index: number) => {
    if (checkDuplicateUntaggedPorts(vlanTable, index)) {
      setVlanTable(vlanTable.filter(i => i.key !== index))
      setIsSetupComplete((prevIsSetupComplete) => {
        const updatedPrevIsSetupComplete = [...prevIsSetupComplete]
        updatedPrevIsSetupComplete[index] = false
        return updatedPrevIsSetupComplete
      })
      setIsDulicateUntaggedPorts((prevStatus) => {
        const status = [...prevStatus]
        status[index] = true
        return status
      })

      await deleteOnboardConfigs({
        params: {
          id: data[index].id
        }
      }).unwrap()
    }
  }


  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newCheckboxStates = [...checkboxStates]
    newCheckboxStates[index] = checked
    setCheckboxStates(newCheckboxStates)
    formInstance?.validateFields()
    if (checked) {
      setDisabledKeys(disabledKeys.filter(id => String(id) !== String(index)))
      handleDuplicateUntaggedPorts(vlanTable, index)

    } else {
      setDisabledKeys([...disabledKeys, String(index)])
      formInstance?.setFields([{
        name: ['data', index, 'VLAN ID'],
        errors: []
      }, {
        name: ['data', index, 'VLAN Name'],
        errors: []
      }])
    }

  }

  const handleAddVlan = () => {
    const newVlan: NetworkConfig = {
      'Purpose': '',
      'VLAN ID': '',
      'VLAN Name': '',
      'Checked': true,
      'id': ''
    }
    setData([...data, newVlan])
    setConfigVlanIds([...configVlanIds, ''])
    setConfigVlanNames([...configVlanNames, ''])
    setCheckboxStates([...checkboxStates, true])
  }

  const handleSetVlan = async (data: Vlan) => {
    const filterData = selectedVlanProfile?.vlanId ? vlanTable.filter(
      (item: { vlanId: number }) =>
        item.vlanId.toString() !== selectedVlanProfile?.vlanId.toString()) :
      vlanTable

    const sfm = data.switchFamilyModels?.map((item, index) => {
      return {
        ...item,
        untaggedPorts: Array.isArray(item.untaggedPorts) ?
          item.untaggedPorts?.join(',') : item.untaggedPorts,
        taggedPorts: Array.isArray(item.taggedPorts) ?
          item.taggedPorts?.join(',') : item.taggedPorts,
        key: index
      }
    })

    data.switchFamilyModels = sfm
    data.key = configIndex
    setVlanTable([...filterData, data])
    if(configId) {
      await updateOnboardConfigs({
        params: {
          id: configId
        },
        payload: {
          id: configId,
          name: '',
          type: 'VLAN',
          content: JSON.stringify(data),
          sessionId: props.sessionId
        }
      }).unwrap()
    } else {
      const result = await createOnboardConfigs({
        payload: {
          name: '',
          type: 'VLAN',
          content: JSON.stringify(data),
          sessionId: props.sessionId
        }
      }).unwrap()

      if (result?.id) {
        formInstance?.setFieldValue(['data', configIndex, 'id'], result?.id)
      }
    }

    setSelectedVlanProfile(undefined)
    setConfigId('')
    setIsSetupComplete((prevIsSetupComplete) => {
      const updatedPrevIsSetupComplete = [...prevIsSetupComplete]
      updatedPrevIsSetupComplete[configIndex] = true
      return updatedPrevIsSetupComplete
    })
    setIsDulicateUntaggedPorts((prevStatus) => {
      const status = [...prevStatus]
      status[configIndex] = false
      return status
    })


    return true
  }

  const [getVlanConfigs] = useLazyGetVlanOnboardConfigsQuery()
  const [updateOnboardConfigs] = useUpdateOnboardConfigsMutation()
  const [createOnboardConfigs] = useCreateOnboardConfigsMutation()
  const [deleteOnboardConfigs] = useDeleteOnboardConfigsMutation()

  const onEditMode = async (id: string, index: number) =>{
    const vlanConfig = (await getVlanConfigs({
      params: { id }
    })).data


    if (vlanConfig && Number(configVlanIds[index])) {
      setSelectedVlanProfile({
        ...vlanConfig,
        vlanId: Number(configVlanIds[index]),
        vlanName: configVlanNames[index]
      })
    }

    setConfigVisible(true)
  }

  const onAddMode= () => {
    setConfigVisible(true)
  }

  return (
    <UI.Container>
      <UI.Header>
        <UI.HeaderWithAddButton>
          <UI.Title>{$t({ defaultMessage: 'Recommended Switch Configuration' })}</UI.Title>
          <Button type='link'
            size='small'
            disabled={data.length >= 5}
            onClick={handleAddVlan}>
            {$t({ defaultMessage: 'Add VLAN' })}
          </Button>
        </UI.HeaderWithAddButton>
      </UI.Header>

      <UI.HighlightedBox>
        <UI.HighlightedTitle>
          <CrownSolid
            style={{
              width: '20px',
              height: '20px',
              verticalAlign: 'text-bottom',
              color: cssStr('--acx-semantics-yellow-50')
            }}
          />
          <span>{$t({ defaultMessage: 'Recommended Switch Configuration' })}</span>
        </UI.HighlightedTitle>
        <UI.HighlightedDescription>{props.description}</UI.HighlightedDescription>
      </UI.HighlightedBox>

      {data.map((item, index) => (
        <React.Fragment key={item.id}>
          <UI.StepItemCheckContainer>
            <UI.CheckboxContainer>
              <ProFormCheckbox
                name={['data', index, 'Checked']}
                initialValue={true}
                fieldProps={{
                  onChange: (e) => handleCheckboxChange(index, e.target.checked)
                }}
              />
              <UI.CheckboxIndexLabel>{index + 1}</UI.CheckboxIndexLabel>
            </UI.CheckboxContainer>
            <UI.VlanDetails style={{ marginTop: '5px' }}>
              <ProFormText
                name={['data', index, 'id']}
                initialValue={item['id']}
                hidden
              />
              <ProFormText
                name={['data', index, 'Purpose']}
                initialValue={item['Purpose']}
                hidden
              />

              <ProFormText
                width={200}
                label={$t({ defaultMessage: 'VLAN Name' })}
                name={['data', index, 'VLAN Name']}
                initialValue={item['VLAN Name']}
                rules={checkboxStates[index] ? [{
                  required: true,
                  message: $t({ defaultMessage: 'Please enter a VLAN Name.' })
                }]: []}
                disabled={!checkboxStates[index]}
                fieldProps={{
                  'data-testid': `vlan-name-input-${index}`,
                  'onChange': (value) => {
                    const newVlanName = value.target.value
                    const updateVlanNames = [...configVlanNames]
                    updateVlanNames[index] = newVlanName

                    setConfigVlanNames(updateVlanNames)
                  }
                }}
              />
              {item['Purpose'] &&
                <UI.PurposeContainer
                  disabled={!checkboxStates[index]}>
                  <UI.PurposeHeader>
                    <OnboardingAssistantDog style={{
                      width: '20px',
                      height: '20px',
                      verticalAlign: 'text-bottom',
                      color: cssStr('--acx-semantics-yellow-50')
                    }} />
                    <span>{$t({ defaultMessage: 'Purpose' })}</span>
                  </UI.PurposeHeader>
                  <UI.PurposeText>{item['Purpose']}</UI.PurposeText>
                </UI.PurposeContainer>
              }
              <ProFormText
                width={200}
                validateTrigger={['onKeyUp', 'onBlur']}
                label={$t({ defaultMessage: 'VLAN ID' })}
                name={['data', index, 'VLAN ID']}
                initialValue={item['VLAN ID']}
                disabled={!checkboxStates[index]}
                rules={checkboxStates[index] ? [
                  { required: true, message: $t({ defaultMessage: 'Please enter a VLAN ID.' }) },
                  { validator: (_, value) => validateVlanExcludingReserved(value) },
                  {
                    validator: () => {
                      // eslint-disable-next-line max-len
                      const filteredVlanIds = configVlanIds.filter((_, i) => !disabledKeys.includes(i.toString()))
                      const isDuplicate = filteredVlanIds.length !== new Set(filteredVlanIds).size
                      if (isDuplicate) {
                        return Promise.reject($t({ defaultMessage: 'This VLAN ID is duplicated.' })
                        )
                      }
                      return Promise.resolve()
                    }
                  }
                ]: []}
                fieldProps={{
                  'data-testid': `vlan-id-input-${index}`,
                  'type': 'number',
                  'onChange': (value) => {
                    const newVlan = value.target.value
                    const updateVlanIds = [...configVlanIds]
                    updateVlanIds[index] = newVlan

                    const updatedVlanTable = vlanTable.map(v => {
                      if (newVlan && v.key === index) {
                        return { ...v, vlanId: Number(newVlan) }
                      }
                      return v
                    })
                    setVlanTable(updatedVlanTable)
                    setConfigVlanIds(updateVlanIds)
                    formInstance?.validateFields()
                  }
                }}
              />
              { configVlanIds[index] &&
                <UI.ConfigurationContainer
                  data-testid={`vlan-configuration-${index}`}
                  disabled={!checkboxStates[index]}
                  onClick={() => {
                    const currentId = formInstance?.getFieldValue(['data', index, 'id'])
                    setConfigId(currentId)
                    setConfigIndex(index)
                    if (isSetupComplete[index]) {
                      onEditMode(currentId, index)
                    } else {
                      onAddMode()
                    }
                  }}>

                  <UI.ConfigurationHeader>
                    <div>
                      <div>
                        {$t({ defaultMessage: 'Port Configurations' })}
                      </div>
                      {!isSetupComplete[index] && !isDulicateUntaggedPorts[index] &&
                        <div style={{ fontWeight: 400, color: cssStr('--acx-neutrals-60') }}>
                          {$t({ defaultMessage: 'Ports have not been set yet. ' })}
                        </div>
                      }
                      {isDulicateUntaggedPorts[index] &&
                        <div style={{ fontWeight: 400, color: cssStr('--acx-neutrals-60') }}>
                          {    // eslint-disable-next-line max-len
                            $t({ defaultMessage: 'The untagged port(s) you previously configured have already been assigned to another VLAN. The port(s) have been reset to their initial state.' })}
                        </div>
                      }

                    </div>

                    <div style={{ display: 'flex' }}>
                      {isSetupComplete[index] ?
                        <UI.ConfiguredButton>
                          <UI.CollapseCircleSolidIcons />
                          <div>{$t({ defaultMessage: 'Configured' })}</div>
                        </UI.ConfiguredButton> :
                        <UI.SetupButton style={{ width: '65px' }}>
                          {$t({ defaultMessage: 'Setup Ports' })}
                        </UI.SetupButton>}
                      <UI.ArrowChevronRightIcons />
                    </div>
                  </UI.ConfigurationHeader>
                </UI.ConfigurationContainer>
              }

            </UI.VlanDetails>
          </UI.StepItemCheckContainer>
          {index < data.length - 1 && <Divider />}
        </React.Fragment>
      ))}
      {configVisible &&
        <VlanSettingDrawer
          editMode={isSetupComplete[configIndex]}
          visible={configVisible}
          setVisible={setConfigVisible}
          vlan={(selectedVlanProfile)}
          setVlan={handleSetVlan}
          isProfileLevel={true}
          gptObject={{
            vlanId: formInstance?.getFieldValue(['data', configIndex, 'VLAN ID']) || '',
            vlanName: formInstance?.getFieldValue(['data', configIndex, 'VLAN Name']) || ''
          }}
          vlansList={vlanTable.filter(
            item =>
              String(item.key) !== String(configIndex) &&
              !disabledKeys.includes(String(item.key))
          )}
        />
      }
    </UI.Container>
  )
}
