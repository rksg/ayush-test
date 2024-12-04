import { useEffect, useState } from 'react'

import { Form, Select, Button, Divider, Space } from 'antd'
import { DefaultOptionType }                    from 'antd/lib/select'
import { useIntl }                              from 'react-intl'

import { useGetSoftGreViewDataListQuery } from '@acx-ui/rc/services'
import { useParams }                      from '@acx-ui/react-router-dom'


import SoftGreDrawer from '../policies/SoftGre/SoftGreForm/SoftGreDrawer'

import * as UI from './styledComponents'


export const SoftGREProfileSettings = () => {

  const { $t } = useIntl()
  const params = useParams()


  const [ detailDrawerVisible, setDetailDrawerVisible ] = useState<boolean>(false)
  const [ addDrawerVisible, setAddDrawerVisible ] = useState<boolean>(false)
  const [ softGREProfileOptionList, setsoftGREProfileOptionList] = useState<DefaultOptionType[]>([])
  const [ softGREProfile, setSoftGREProfile ] = useState<DefaultOptionType>({
    label: '',
    value: ''
  })

  const softGreViewDataList = useGetSoftGreViewDataListQuery({
    params,
    payload: {}
  })

  const onChange = (value: string) => {
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
    }

  }, [softGreViewDataList])

  return (
    <>
      <Space>
        <Form.Item
          label={$t({ defaultMessage: 'SoftGRE Profile' })}
          initialValue=''
          children={
            <Select
              style={{ width: '100%' }}
              data-testid={'softgre-profile-select'}
              value={softGREProfile.value as string}
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
            disabled={false}
            onClick={() => {
              setDetailDrawerVisible(true)
            }}>
            {$t({ defaultMessage: 'Profile Details' })}
          </Button>
          <Button type='link'
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