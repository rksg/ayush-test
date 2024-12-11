import { useEffect, useState } from 'react'

import { Form, Select, Button, Divider, Space } from 'antd'
import { DefaultOptionType }                    from 'antd/lib/select'
import { useIntl }                              from 'react-intl'

import { useGetSoftGreViewDataListQuery } from '@acx-ui/rc/services'
import { useParams }                      from '@acx-ui/react-router-dom'

import SoftGreDrawer from '../policies/SoftGre/SoftGreForm/SoftGreDrawer'


import * as UI from './styledComponents'

const defaultSoftgreOption = { label: '', value: '' }

interface SoftGREProfileSettingsProps {
  index: number
  softgreProfileId: string
  onGUIChanged?: (fieldName: string) => void
  readonly: boolean
}

export const SoftGREProfileSettings = (props: SoftGREProfileSettingsProps) => {
  const { index, softgreProfileId, onGUIChanged, readonly } = props
  const { $t } = useIntl()
  const params = useParams()
  const softGreProfileIdFieldName = ['lan', index, 'softGreProfileId']
  const form = Form.useFormInstance()
  const [ detailDrawerVisible, setDetailDrawerVisible ] = useState<boolean>(false)
  const [ addDrawerVisible, setAddDrawerVisible ] = useState<boolean>(false)
  const [ softGREProfileOptionList, setsoftGREProfileOptionList] = useState<DefaultOptionType[]>([])
  const [ softGREProfile, setSoftGREProfile ] = useState<DefaultOptionType>(defaultSoftgreOption)

  const softGreViewDataList = useGetSoftGreViewDataListQuery({
    params,
    payload: {}
  })

  const onChange = (value: string) => {
    onGUIChanged && onGUIChanged('softgreProfile')
    setSoftGREProfile(
      softGREProfileOptionList.find((profile) => profile.value === value) ??
       { label: $t({ defaultMessage: 'Select...' }), value: '' }
    )
  }

  useEffect(() => {
    const softGreProfileList = softGreViewDataList.data?.data ?? []

    if(softGreProfileList.length > 0) {
      setsoftGREProfileOptionList(softGreProfileList.map((softGreProfile) => {
        return { label: softGreProfile.name, value: softGreProfile.id }
      }))
      if (softgreProfileId) {
        form.setFieldValue(softGreProfileIdFieldName,softgreProfileId)
        setSoftGREProfile(softGREProfileOptionList.find(
          (profile) => profile.value === softgreProfileId) ?? defaultSoftgreOption
        )
      }
    }

  }, [softGreViewDataList])

  return (
    <>
      <Space>
        <Form.Item
          label={$t({ defaultMessage: 'SoftGRE Profile' })}
          initialValue=''
          name={softGreProfileIdFieldName}
          children={
            <Select
              style={{ width: '100%' }}
              disabled={readonly}
              data-testid={'softgre-profile-select'}
              onChange={onChange}
              options={[
                {
                  label: $t({ defaultMessage: 'Select...' }), value: ''
                },
                ...softGREProfileOptionList
              ]}
              placeholder={$t({ defaultMessage: 'Select...' })}
            />}
        />
        <UI.TypeSpace split={<Divider type='vertical' />}>
          <Button type='link'
            onClick={() => {
              setDetailDrawerVisible(true)
            }}>
            {$t({ defaultMessage: 'Profile Details' })}
          </Button>
          <Button type='link'
            disabled={readonly}
            onClick={() => {
              setAddDrawerVisible(true)
            }}>
            {$t({ defaultMessage: 'Add Profile' })}
          </Button>
        </UI.TypeSpace>
      </Space>
      <SoftGreDrawer
        visible={detailDrawerVisible}
        setVisible={setDetailDrawerVisible}
        policyId={softGREProfile.value as string}
        policyName={softGREProfile.label as string}
        readMode
      />
      <SoftGreDrawer
        visible={addDrawerVisible}
        setVisible={setAddDrawerVisible}
      />
    </>
  )
}
