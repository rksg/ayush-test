import { useEffect, useState } from 'react'

import { Form, Select, Button, Space } from 'antd'
import { DefaultOptionType }           from 'antd/lib/select'
import { useIntl }                     from 'react-intl'

import {
  useGetIpsecViewDataListQuery,
  useLazyGetIpsecOptionsQuery
} from '@acx-ui/rc/services'
import {
  PolicyOperation,
  PolicyType,
  hasPolicyPermission
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

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
  serialNumber?: string
}

export const IPSecProfileSettings = (props: IPSecProfileSettingsProps) => {
  const {
    index,
    ipsecProfileId,
    softGreProfileId,
    onGUIChanged,
    readonly
  } = props
  const { $t } = useIntl()
  const params = useParams()
  const ipsecProfileIdFieldName = ['lan', index, 'ipsecProfileId']
  const form = Form.useFormInstance()
  const [ detailDrawerVisible, setDetailDrawerVisible ] = useState<boolean>(false)
  const [ addDrawerVisible, setAddDrawerVisible ] = useState<boolean>(false)
  const [ ipsecProfile, setIpSecProfile ] = useState<DefaultOptionType>(defaultIpsecOption)
  const [ ipsecOptions, setIpsecOptions ] = useState<DefaultOptionType[]>([])

  const ipsecViewDataList = useGetIpsecViewDataListQuery({
    params,
    payload: {}
  })

  useEffect(() => {
    loadOptions()
  },[softGreProfileId])

  const [ getIpsecOptions ] = useLazyGetIpsecOptionsQuery()

  const loadOptions = async () => {
    const queryData = await getIpsecOptions(
      { params: {
        venueId: params.venueId,
        softGreId: props.softGreProfileId },
      payload: {},
      skip: !params.venueId }
    ).unwrap()

    if (queryData) {
      const { options } = queryData
      setIpsecOptions(options)
    }
  }

  const onChange = (value: string) => {
    if(!value) {
      setDetailDrawerVisible(false)
    }
    onGUIChanged?.('ipsecProfile')

    setIpSecProfile(
      ipsecOptions.find((profile) => profile.value === value) ??
       { label: $t({ defaultMessage: 'Select...' }), value: '' }
    )
  }

  const addIpsecOption = (value: DefaultOptionType) => {
    if (ipsecOptions.find((profile) => profile.disabled === true)) {
      setIpsecOptions([...ipsecOptions, { ...value, disabled: true }])
    } else {
      setIpsecOptions([...ipsecOptions, { ...value }])
    }
  }

  useEffect(() => {
    const ipsecProfileList = ipsecViewDataList.data?.data ?? []
    if(ipsecProfileList.length > 0) {
      if (ipsecProfileId) {
        form.setFieldValue(ipsecProfileIdFieldName, ipsecProfileId)
      }
    }

  }, [ipsecViewDataList])

  useEffect(() => {
    if(!ipsecProfileId) {
      return
    }
    const selectedProfile = ipsecOptions
      .find((profile) => profile.value === ipsecProfileId)
    setIpSecProfile(selectedProfile ? selectedProfile: defaultIpsecOption)

  }, [ipsecProfileId, ipsecOptions])

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
                ...ipsecOptions
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
        callbackFn={addIpsecOption}
      />
    </>
  )
}