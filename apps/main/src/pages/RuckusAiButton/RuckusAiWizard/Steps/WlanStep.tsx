import React, { useEffect, useState } from 'react'

import {
  ProFormCheckbox,
  ProFormInstance,
  ProFormSelect,
  ProFormText
} from '@ant-design/pro-form'
import { Button, Divider } from 'antd'
import { useIntl }         from 'react-intl'

import { cssStr }                                               from '@acx-ui/components'
import { CrownSolid, OnboardingAssistantDog }                   from '@acx-ui/icons'
import { useCreateOnboardConfigsMutation, useNetworkListQuery } from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  NetworkTypeEnum,
  ssidBackendNameRegExp,
  validateByteLength }
  from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { willRegenerateAlert } from '../../ruckusAi.utils'

import { checkHasRegenerated } from './steps.utils'
import * as UI                 from './styledComponents'

type NetworkConfig = {
  'Purpose': string;
  'SSID Name': string;
  'SSID Objective': string;
  'Checked': boolean;
  'id': string;
}
export function WlanStep ( props: {
  payload: string,
  description: string,
  showAlert: boolean,
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   formInstance: ProFormInstance<any> | undefined,
   sessionId: string,
}) {
  const { $t } = useIntl()
  const { formInstance } = props
  const initialData = JSON.parse(props.payload || '[]') as NetworkConfig[]
  const [data, setData] = useState<NetworkConfig[]>([])
  const [description, setDescription] = useState(props.description)

  const [checkboxStates, setCheckboxStates] =
    useState<boolean[]>(Array(initialData.length).fill(true))

  useEffect(() => {
    if (checkHasRegenerated(data, initialData) && formInstance) {
      const updatedData = initialData.map(item => ({
        ...item,
        Checked: true
      }))
      formInstance?.setFieldsValue({ data: updatedData })
      setData(initialData)
      setCheckboxStates(Array(initialData.length).fill(true))
      setDescription(props.description)
    }

  }, [props.payload])

  const objectiveOptions = [
    { value: 'Internal', label: $t({ defaultMessage: 'Internal' }) },
    { value: 'Guest', label: $t({ defaultMessage: 'Guest' }) },
    { value: 'VIP', label: $t({ defaultMessage: 'VIP' }) },
    { value: 'Infrastructure', label: $t({ defaultMessage: 'Infrastructure' }) },
    { value: 'Personal', label: $t({ defaultMessage: 'Personal' }) },
    { value: 'Public', label: $t({ defaultMessage: 'Public' }) }
  ]

  const [createOnboardConfigs] = useCreateOnboardConfigsMutation()
  const configPayload = {
    type: NetworkTypeEnum.AAA.toUpperCase(),
    content: '{}',
    sessionId: props.sessionId,
    name: ''
  }

  const addNetworkProfile = async () => {
    const newWlan = await createOnboardConfigs({ payload: configPayload }).unwrap()

    const newProfile: NetworkConfig = {
      'Purpose': '',
      'SSID Name': '',
      'SSID Objective': 'Internal',
      'Checked': true,
      'id': newWlan.id
    }
    setData([...data, newProfile])
    setCheckboxStates([...checkboxStates, true])
  }

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newCheckboxStates = [...checkboxStates]
    newCheckboxStates[index] = checked
    setCheckboxStates(newCheckboxStates)
    formInstance?.validateFields()
    if (!checked) {
      formInstance?.setFields([{
        name: ['data', index, 'SSID Name'],
        errors: []
      }])
    }
  }

  const tooltipItems = [
    {
      label: $t({ defaultMessage: 'Internal' }),
      description: $t({ defaultMessage: 'For employees, teachers, lecturers, and students.' })
    },
    {
      label: $t({ defaultMessage: 'Guest' }),
      description: $t({ defaultMessage: 'For external guests, visitors, and customers.' })
    },
    {
      label: $t({ defaultMessage: 'VIP' }),
      description: $t({ defaultMessage: 'For high-priority guests, visitors, and customers.' })
    },
    {
      label: $t({ defaultMessage: 'Infrastructure' }),
      // eslint-disable-next-line max-len
      description: $t({ defaultMessage: 'For infrastructure devices, such as VoIP phones, barcode scanners, cameras, printers, security cameras, projectors, point-of-sale system, IoT devices, and smart home devices.' })
    },
    {
      label: $t({ defaultMessage: 'Personal' }),
      // eslint-disable-next-line max-len
      description: $t({ defaultMessage: 'For home use, and personal devices, such as smartphones, tablets, and computers.' })
    },
    {
      label: $t({ defaultMessage: 'Public' }),
      description: $t({ defaultMessage: 'For open public use without authentication.' })
    }
  ]


  const params = useParams()

  const { data: networkList } = useNetworkListQuery({
    params, payload: {
      fields: ['name', 'ssid'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  const wlanNameValidator = async (value: string) => {
    const list = networkList?.data.map((n: { name: string }) => n.name) || []

    return checkObjectNotExists(list,
      value, $t({ defaultMessage: 'Network' }))
  }


  return (
    <UI.Container>
      <UI.HeaderWithAddButton>
        <UI.Title>{$t({ defaultMessage: 'Recommended Network Profiles' })}</UI.Title>
        <Button
          type='link'
          size='small'
          disabled={data.length >= 5}
          onClick={addNetworkProfile}>
          {$t({ defaultMessage: 'Add Network Profile' })}
        </Button>
      </UI.HeaderWithAddButton>
      {props.showAlert && willRegenerateAlert($t)}
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
          <span>{$t({ defaultMessage: 'Recommended Network Profiles' })}</span>
        </UI.HighlightedTitle>
        <UI.HighlightedDescription>{description}</UI.HighlightedDescription>
      </UI.HighlightedBox>

      {data?.map((item, index) => (
        <React.Fragment key={index}>
          <UI.StepItemCheckContainer>
            <UI.CheckboxContainer data-testid={`wlan-checkbox-${index}`}>
              <ProFormCheckbox
                name={['data', index, 'Checked']}
                initialValue={true}
                validateTrigger={'onChange'}
                fieldProps={{
                  onChange: (e) => handleCheckboxChange(index, e.target.checked)
                }}
              />
              <UI.CheckboxIndexLabel>{index + 1}</UI.CheckboxIndexLabel>
            </UI.CheckboxContainer>
            <div style={{ marginTop: '5px' }}>
              <ProFormText
                name={['data', index, 'id']}
                initialValue={item['id']}
                hidden />
              <ProFormText
                name={['data', index, 'Purpose']}
                initialValue={item['Purpose']}
                hidden />
              <ProFormText
                width={200}
                allowClear={false}
                label={$t({ defaultMessage: 'Network Name' })}
                name={['data', index, 'SSID Name']}
                initialValue={item['SSID Name']}
                rules={checkboxStates[index] ? [
                  { required: true,
                    message: $t({ defaultMessage: 'Please enter a Network Name.' }) },
                  { min: 2 },
                  { max: 32 },
                  { validator: (_, value) => ssidBackendNameRegExp(value) },
                  { validator: (_, value) => validateByteLength(value, 32) },
                  { validator: (_, value) => wlanNameValidator(value) }
                ] : []}
                validateFirst
                disabled={!checkboxStates[index]}
                validateTrigger={'onBlur'}
                fieldProps={{
                  'data-testid': `wlan-name-input-${index}`
                }}
              />
              <ProFormSelect
                allowClear={false}
                tooltip={{
                  overlayStyle: { minWidth: '600px' },
                  title: (<>
                    <div style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      lineHeight: '16px',
                      color: cssStr('--acx-neutrals-40'),
                      marginBottom: '5px'
                    }}>
                      {$t({ defaultMessage: 'Network Objective Description' })}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      lineHeight: '16px',
                      color: cssStr('--acx-neutrals-40'),
                      marginBottom: '10px'
                    }} >
                      {// eslint-disable-next-line max-len
                        $t({ defaultMessage: 'Network Objective defines the purpose and access level of different types of network connections within an organization.' })}
                    </div>
                    <ul style={{
                      margin: 0, padding: '0 20px',
                      display: 'flex', flexDirection: 'column', gap: '8px'
                    }}>
                      {tooltipItems.map((item, index) => (
                        <li key={index}>
                          <span><strong>{item.label}</strong>: {item.description}</span>
                        </li>
                      ))}
                    </ul></>
                  )
                }}
                width={200}
                label={$t({ defaultMessage: 'Network Objective' })}
                name={['data', index, 'SSID Objective']}
                initialValue={item['SSID Objective']}
                disabled={!checkboxStates[index]}
                options={objectiveOptions}
              />
              {item['Purpose'] && <UI.PurposeContainer
                disabled={!checkboxStates[index]}>
                <UI.PurposeHeader>
                  <OnboardingAssistantDog
                    style={{
                      width: '20px',
                      height: '20px',
                      verticalAlign: 'text-bottom',
                      color: cssStr('--acx-semantics-yellow-50')
                    }}
                  />
                  <span>{$t({ defaultMessage: 'Purpose' })}</span>
                </UI.PurposeHeader>
                <UI.PurposeText>{item['Purpose']}</UI.PurposeText>
              </UI.PurposeContainer>}
            </div>
          </UI.StepItemCheckContainer>
          {index < data.length - 1 && <Divider />}
        </React.Fragment>
      ))}
      <UI.FooterValidationItem
        name={'wlanStep'}
        rules={[{
          validator: () => {
            const allUnchecked = checkboxStates.every(state => !state)
            if (allUnchecked) {
              return Promise.reject(
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <UI.WarningTriangleSolidIcon />
                  {$t({ defaultMessage: 'Select at least one network profile' })}
                </span>
              )
            }
            return Promise.resolve()
          }
        }]}
      >
        <ProFormText hidden />
      </UI.FooterValidationItem>
    </UI.Container>
  )
}
