import { useEffect, useState } from 'react'

import { Form, Select, Button, Space } from 'antd'
import { DefaultOptionType }           from 'antd/lib/select'
import { useIntl }                     from 'react-intl'

import { useGetSoftGreViewDataListQuery } from '@acx-ui/rc/services'
import {
  SoftGreDuplicationChangeDispatcher,
  SoftGreDuplicationChangeState,
  SoftGreProfileDispatcher,
  SoftGreState
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import SoftGreDrawer from '../policies/SoftGre/SoftGreForm/SoftGreDrawer'

const defaultSoftgreOption = { label: '', value: '' }

interface SoftGREProfileSettingsProps {
  index: number
  softGreProfileId: string
  onGUIChanged?: (fieldName: string) => void
  readonly: boolean
  dispatch?: React.Dispatch<SoftGreProfileDispatcher>
  portId?: string;
  softGREProfileOptionList?: DefaultOptionType[];
  optionDispatch?: React.Dispatch<SoftGreDuplicationChangeDispatcher>
  apModel?: string
  serialNumber?: string
  isUnderAPNetworking: boolean
}

export const SoftGREProfileSettings = (props: SoftGREProfileSettingsProps) => {
  const {
    index,
    softGreProfileId,
    onGUIChanged,
    readonly,
    dispatch,
    optionDispatch,
    portId = '0',
    softGREProfileOptionList= [],
    apModel,
    serialNumber,
    isUnderAPNetworking
  } = props
  const { $t } = useIntl()
  const params = useParams()
  const softGreProfileIdFieldName = ['lan', index, 'softGreProfileId']
  const form = Form.useFormInstance()
  const [ detailDrawerVisible, setDetailDrawerVisible ] = useState<boolean>(false)
  const [ addDrawerVisible, setAddDrawerVisible ] = useState<boolean>(false)
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
    optionDispatch && optionDispatch({
      state: SoftGreDuplicationChangeState.OnChangeSoftGreProfile,
      softGreProfileId: form.getFieldValue(['lan', index, 'softGreProfileId']),
      voter: (isUnderAPNetworking ?
        { serialNumber, portId: +portId }:
        { model: apModel, portId: +portId }
      )
    })
  }

  useEffect(() => {
    const softGreProfileList = softGreViewDataList.data?.data ?? []
    if(softGreProfileList.length > 0) {
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
              onClick={() => {
                console.log('clicked')
                optionDispatch && optionDispatch({
                  state: SoftGreDuplicationChangeState.FindTheOnlyVoter,
                  voter: (isUnderAPNetworking ?
                    { serialNumber, portId: +portId }:
                    { model: apModel, portId: +portId }
                  )
                })
              }}
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
