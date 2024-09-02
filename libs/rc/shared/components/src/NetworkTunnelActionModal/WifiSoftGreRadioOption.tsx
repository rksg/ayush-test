/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import {  Form, Radio, Row, Select, Space } from 'antd'
import { DefaultOptionType }                from 'antd/lib/select'
import { useIntl }                          from 'react-intl'

import { useGetSoftGreOptionsQuery } from '@acx-ui/rc/services'
import { useParams }                 from '@acx-ui/react-router-dom'

import SoftGreDrawer from '../policies/SoftGre/SoftGreForm/SoftGreDrawer'

import * as UI                   from './styledComponents'
import { NetworkTunnelTypeEnum } from './types'

const defaultPayload = {
  fields: ['id', 'name'], // , 'activations'
  page: 1,
  pageSize: 10_000,
  searchString: '',
  filters: { id: [] as string[] }
}

interface WiFISoftGreRadioOptionProps {
  currentTunnelType: NetworkTunnelTypeEnum
  venueId: string
  networkId?: string
}

export default function WifiSoftGreRadioOption (props: WiFISoftGreRadioOptionProps) {
  const { currentTunnelType, venueId, networkId } = props
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  const [ detailDrawerVisible, setDetailDrawerVisible ] = useState<boolean>(false)
  const [ addDrawerVisible, setAddDrawerVisible ] = useState<boolean>(false)
  const [ softGreOption, setSoftGreOption ] = useState<DefaultOptionType[]>([])

  const softGreProfileId = Form.useWatch(['softGre', 'newProfileId'], form)

  const optionsDataQuery = useGetSoftGreOptionsQuery(
    { params,
      payload: { ...defaultPayload, current: { networkId, venueId } }
    },
    { skip: currentTunnelType !== NetworkTunnelTypeEnum.SoftGre }
  )

  useEffect(() => {
    if (optionsDataQuery.data) {
      setSoftGreOption(optionsDataQuery.data.options)
      if (optionsDataQuery.data.id) {
        form.setFieldValue(['softGre', 'newProfileId'], optionsDataQuery.data.id)
        form.setFieldValue(['softGre', 'oldProfileId'], optionsDataQuery.data.id)
      }
    }
  }, [optionsDataQuery])

  useEffect(() => {
    if (currentTunnelType !== NetworkTunnelTypeEnum.SoftGre) {
      form.setFieldValue(['softGre', 'newProfileId'], '')
    }
  }, [currentTunnelType])

  const addOption = (option: DefaultOptionType) => {
    setSoftGreOption((preState) => {
      return [option, ...preState]
    })
  }

  const handleClickAdd = () => {
    setDetailDrawerVisible(false)
    setAddDrawerVisible(true)
  }

  const handleClickProfileDetail = () => {
    setAddDrawerVisible(false)
    setDetailDrawerVisible(true)
  }

  return <Row>
    <Form.Item
      help={<UI.RadioSubTitle>
        {$t({ defaultMessage: 'Tunnel the traffic to an third party WLAN gateway' })}
      </UI.RadioSubTitle>}
    >
      <UI.RadioWrapper>
        <Radio value={NetworkTunnelTypeEnum.SoftGre}>
          <Space>
            {$t({ defaultMessage: 'SoftGRE Tunneling' })}
            {currentTunnelType === NetworkTunnelTypeEnum.SoftGre &&
              <><UI.StyledFormItem
                name={['softGre', 'newProfileId']}
                required={currentTunnelType === NetworkTunnelTypeEnum.SoftGre}
                children={<Select
                  style={{ width: '150px', marginBottom: '0px' }}
                  size='small'
                  options={softGreOption}
                  placeholder={$t({ defaultMessage: 'Select...' })}
                  defaultValue={''} />}
              />
              <UI.TextButton
                type='link'
                disabled={!softGreProfileId}
                onClick={handleClickProfileDetail}
              >
                {$t({ defaultMessage: 'Profile details' })}
              </UI.TextButton><UI.TextButton
                type='link'
                onClick={handleClickAdd}
                style={{ marginLeft: 5 }}
              >
                {$t({ defaultMessage: 'Add' })}
              </UI.TextButton>
              </>}
          </Space>
        </Radio>
      </UI.RadioWrapper>
    </Form.Item>
    <SoftGreDrawer
      visible={detailDrawerVisible}
      setVisible={setDetailDrawerVisible}
      policyId={softGreProfileId}
      readMode={true}
      editMode={false}
    />
    <SoftGreDrawer
      visible={addDrawerVisible}
      setVisible={setAddDrawerVisible}
      readMode={false}
      editMode={false}
      callbackFn={addOption}
    />
  </Row>
}

