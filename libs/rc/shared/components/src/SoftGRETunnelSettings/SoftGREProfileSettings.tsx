import { useEffect, useState } from 'react'

import { Form, Select, Button, Space } from 'antd'
import { DefaultOptionType }           from 'antd/lib/select'
import { useIntl }                     from 'react-intl'

import { useGetSoftGreViewDataListQuery }         from '@acx-ui/rc/services'
import { SoftGreProfileDispatcher, SoftGreState } from '@acx-ui/rc/utils'
import { useParams }                              from '@acx-ui/react-router-dom'

import SoftGreDrawer from '../policies/SoftGre/SoftGreForm/SoftGreDrawer'

const defaultSoftgreOption = { label: '', value: '' }

interface SoftGREProfileSettingsProps {
  index: number
  softGreProfileId: string
  onGUIChanged?: (fieldName: string) => void
  readonly: boolean
  dispatch?: React.Dispatch<SoftGreProfileDispatcher>
  portId?: string;
}

export const SoftGREProfileSettings = (props: SoftGREProfileSettingsProps) => {
  const { index, softGreProfileId, onGUIChanged, readonly, dispatch, portId = '0' } = props
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
    if(!value) {
      setDetailDrawerVisible(false)
    }
    onGUIChanged && onGUIChanged('softgreProfile')
    setSoftGREProfile(
      softGREProfileOptionList.find((profile) => profile.value === value) ??
       { label: $t({ defaultMessage: 'Select...' }), value: '' }
    )
    dispatch && dispatch({
      state: SoftGreState.ModifySoftGreProfile,
      portId,
      index,
      softGreProfileId: form.getFieldValue(['lan', index, 'softGreProfileId'])
    })
  }

  useEffect(() => {
    const softGreProfileList = softGreViewDataList.data?.data ?? []

    if(softGreProfileList.length > 0) {
      setsoftGREProfileOptionList(softGreProfileList.map((softGreProfile) => {
        return { label: softGreProfile.name, value: softGreProfile.id }
      }))
      if (softGreProfileId) {
        form.setFieldValue(softGreProfileIdFieldName,softGreProfileId)
      }
    }

  }, [softGreViewDataList])

  useEffect(() => {
    if(!softGreProfileId) {
      return
    }
    const selectedProfile = softGREProfileOptionList
      .find((profile) => profile.value === softGreProfileId)
    setSoftGREProfile(selectedProfile ? selectedProfile: defaultSoftgreOption)

  }, [softGreProfileId, softGREProfileOptionList])

  return (
    <>
      <Space>
        <Form.Item
          label={$t({ defaultMessage: 'SoftGRE Profile' })}
          initialValue=''
          name={softGreProfileIdFieldName}
          rules={[
            { required: true }
          ]}
          children={
            <Select
              style={{ width: '260px' }}
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
        <Space split='|'>
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
        </Space>
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
