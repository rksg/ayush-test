import React, { useEffect, useState } from 'react'

import { ProFormCheckbox, ProFormInstance, ProFormText } from '@ant-design/pro-form'
import { Button, Divider }                               from 'antd'
import { useIntl }                                       from 'react-intl'

import { cssStr }                   from '@acx-ui/components'
import { RuckusAiDog }              from '@acx-ui/icons'
import { VlanSettingDrawer }        from '@acx-ui/rc/components'
import {
  useCreateOnboardConfigsMutation,
  useLazyGetVlanOnboardConfigsQuery,
  useUpdateOnboardConfigsMutation
} from '@acx-ui/rc/services'
import { validateVlanExcludingReserved, Vlan } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'


type NetworkConfig = {
  'Purpose': string;
  'VLAN ID': string;
  'VLAN Name': string;
  'Checked': boolean;
  'id': string;
}

export function VlanStep (props: { payload: string, sessionId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formInstance: ProFormInstance<any> | undefined
}) {
  const { formInstance } = props
  const { $t } = useIntl()
  const initialData = JSON.parse(props.payload || '[]') as NetworkConfig[]
  const [data, setData] = useState<NetworkConfig[]>(initialData)

  // eslint-disable-next-line max-len
  const [configVlanNames, setConfigVlanNames] = useState<string[]>(data.map(vlan => vlan['VLAN Name']))
  const [configVlanIds, setConfigVlanIds] = useState<string[]>(data.map(vlan => vlan['VLAN ID']))
  const [isSetupComplete, setIsSetupComplete] = useState<boolean[]>(Array(data.length).fill(false))
  const [configId, setConfigId] = useState('')
  const [configVisible, setConfigVisible] = useState(false)
  const [configIndex, setConfigIndex] = useState<number>(0)

  const [selectedVlanProfile, setSelectedVlanProfile] = useState<Vlan>()
  const [vlanTable, setVlanTable] = useState<Vlan[]>([])

  useEffect(() => {
    if (initialData !== data) {
      setData(initialData)
      setIsSetupComplete(Array(data.length).fill(false))
      setConfigVlanIds(data.map(vlan => vlan['VLAN ID']))
      setConfigVlanNames(data.map(vlan => vlan['VLAN Name']))
    }

  }, [props.payload])


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


    return true
  }

  const [getVlanConfigs] = useLazyGetVlanOnboardConfigsQuery()
  const [updateOnboardConfigs] = useUpdateOnboardConfigsMutation()
  const [createOnboardConfigs] = useCreateOnboardConfigsMutation()

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
          <UI.Title>{$t({ defaultMessage: 'Recommended VLANs' })}</UI.Title>
          <Button type='link'
            size='small'
            disabled={data.length >= 5}
            onClick={handleAddVlan}>
            {$t({ defaultMessage: 'Add VLAN' })}
          </Button>
        </UI.HeaderWithAddButton>
        <UI.Description>
          { // eslint-disable-next-line max-len
            $t({ defaultMessage: 'Now, let us set up the VLANs for your school network. Setting up VLANs effectively will help in managing and segmenting your network traffic efficiently in your educational environment. Here’s how you can structure your VLANs for different use cases.'
            })}
        </UI.Description>
      </UI.Header>

      {data.map((item, index) => (
        <React.Fragment key={item.id}>
          <UI.VlanContainer>
            <UI.CheckboxContainer>
              <ProFormCheckbox
                name={['data', index, 'Checked']}
                initialValue={true}
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
                rules={[{ required: true }]}
                fieldProps={{
                  onChange: (value) => {
                    const newVlanName = value.target.value
                    const updateVlanNames = [...configVlanNames]
                    updateVlanNames[index] = newVlanName

                    setConfigVlanNames(updateVlanNames)
                  }
                }}
              />
              {item['Purpose'] && <UI.PurposeContainer>
                <UI.PurposeHeader>
                  <RuckusAiDog style={{
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
                rules={[
                  { required: true },
                  { validator: (_, value) => validateVlanExcludingReserved(value) }]}
                fieldProps={{
                  'data-testid': `vlan-id-input-${index}`,
                  'type': 'number',
                  'onChange': (value) => {
                    const newVlan = value.target.value
                    const updateVlanIds = [...configVlanIds]
                    updateVlanIds[index] = newVlan

                    const updatedVlanTable = vlanTable.map(v => {
                      if (newVlan && String(v.vlanId) === configVlanIds[index]) {
                        return { ...v, vlanId: Number(newVlan) }
                      }
                      return v
                    })
                    setVlanTable(updatedVlanTable)
                    setConfigVlanIds(updateVlanIds)
                  }
                }}
              />
              { configVlanIds[index] &&
                <UI.ConfigurationContainer
                  data-testid={`vlan-configuration-${index}`}
                  onClick={() => {
                    const currentId = formInstance?.getFieldValue(['data', index, 'id'])
                    setConfigId(currentId)
                    setConfigIndex(index)
                    if (isSetupComplete[configIndex]) {
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
                      {!isSetupComplete[index] &&
                        <div style={{ fontWeight: 400, color: cssStr('--acx-neutrals-60') }}>
                          {$t({ defaultMessage: 'Ports have not been set yet. ' })}
                        </div>
                      }
                    </div>

                    <div style={{ display: 'flex' }}>
                      {isSetupComplete[index] ?
                        <UI.ConfiguredButton>
                          <UI.CollapseCircleSolidIcons />
                          <div>{$t({ defaultMessage: 'Configured' })}</div>
                        </UI.ConfiguredButton> :
                        <UI.SetupButton>
                          {$t({ defaultMessage: 'Setup Ports' })}
                        </UI.SetupButton>}
                      <UI.ArrowChevronRightIcons />
                    </div>
                  </UI.ConfigurationHeader>
                </UI.ConfigurationContainer>
              }

            </UI.VlanDetails>
          </UI.VlanContainer>
          <Divider dashed />
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
          vlansList={vlanTable.filter(item=>item.vlanId !== selectedVlanProfile?.vlanId)}
        />
      }
    </UI.Container>
  )
}
