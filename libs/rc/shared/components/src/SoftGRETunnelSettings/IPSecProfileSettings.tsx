import { useEffect, useState } from 'react'

import { Form, Select, Button, Space } from 'antd'
import { DefaultOptionType }           from 'antd/lib/select'
import { useIntl }                     from 'react-intl'

import {
  IpsecOptionChangeDispatcher,
  IpsecOptionChangeState,
  PolicyOperation,
  PolicyType,
  hasPolicyPermission
} from '@acx-ui/rc/utils'

import IpsecDrawer from '../policies/Ipsec/IpsecForm/IpsecDrawer'

const defaultIpsecOption = { label: '', value: '' }

interface IPSecProfileSettingsProps {
  index: number
  softGreProfileId: string
  ipsecProfileId: string
  onGUIChanged?: (fieldName: string) => void
  readonly: boolean
  portId?: string
  apModel?: string
  serialNumber?: string,
  ipsecProfileOptionList: DefaultOptionType[],
  ipsecOptionDispatch?: React.Dispatch<IpsecOptionChangeDispatcher>
}

export const IPSecProfileSettings = (props: IPSecProfileSettingsProps) => {
  const {
    index,
    portId,
    ipsecProfileId,
    onGUIChanged,
    readonly,
    apModel,
    serialNumber,
    ipsecProfileOptionList,
    ipsecOptionDispatch
  } = props
  const { $t } = useIntl()
  const ipsecProfileIdFieldName = ['lan', index, 'ipsecProfileId']
  const form = Form.useFormInstance()
  const [ detailDrawerVisible, setDetailDrawerVisible ] = useState<boolean>(false)
  const [ addDrawerVisible, setAddDrawerVisible ] = useState<boolean>(false)
  const [ ipsecProfile, setIpSecProfile ] = useState<DefaultOptionType>(defaultIpsecOption)

  const onChange = (value: string) => {
    if(!value) {
      setDetailDrawerVisible(false)
    }
    onGUIChanged?.('ipsecProfile')

    setIpSecProfile(
      ipsecProfileOptionList.find((profile) => profile.value === value) ??
       { label: $t({ defaultMessage: 'Select...' }), value: '' }
    )

    ipsecOptionDispatch && ipsecOptionDispatch({
      state: IpsecOptionChangeState.OnChange,
      index, portId, apModel, serialNumber
    })
  }

  useEffect(() => {
    if(!ipsecProfileId) {
      return
    }
    const selectedProfile = ipsecProfileOptionList
      .find((profile) => profile.value === ipsecProfileId && profile.disabled === false)
    setIpSecProfile(selectedProfile ? selectedProfile: defaultIpsecOption)

    form.setFieldValue(ipsecProfileIdFieldName, selectedProfile ? ipsecProfileId : '')

  }, [ipsecProfileId, ipsecProfileOptionList])

  return (
    <>
      <Space>
        <Form.Item
          label={$t({ defaultMessage: 'IPsec Profile' })}
          initialValue=''
          name={ipsecProfileIdFieldName}
          rules={[
            { required: true }
          ]}
          children={
            <Select
              style={{ width: '260px' }}
              disabled={readonly}
              data-testid={'ipsec-profile-select'}
              onChange={onChange}
              options={[
                {
                  label: $t({ defaultMessage: 'Select...' }), value: ''
                },
                ...ipsecProfileOptionList || []
              ]}
              placeholder={$t({ defaultMessage: 'Select...' })}
            />}
        />
        <Space split='|'>
          <Button
            type='link'
            disabled={!ipsecProfileId}
            onClick={() => {
              setDetailDrawerVisible(true)
            }}>
            {$t({ defaultMessage: 'Profile Details' })}
          </Button>
          {hasPolicyPermission({ type: PolicyType.IPSEC, oper: PolicyOperation.CREATE }) &&
            <Button type='link'
              disabled={readonly}
              onClick={() => {
                setAddDrawerVisible(true)
              }}>
              {$t({ defaultMessage: 'Add Profile' })}
            </Button>
          }

        </Space>
      </Space>
      <IpsecDrawer
        visible={detailDrawerVisible}
        setVisible={setDetailDrawerVisible}
        policyId={ipsecProfile.value as string}
        policyName={ipsecProfile.label as string}
        readMode
      />
      <IpsecDrawer
        visible={addDrawerVisible}
        setVisible={setAddDrawerVisible}
        callbackFn={async (newOption) => {
          ipsecOptionDispatch && ipsecOptionDispatch({
            state: IpsecOptionChangeState.ReloadOptionList, newOption
          })
        }}
      />
    </>
  )
}