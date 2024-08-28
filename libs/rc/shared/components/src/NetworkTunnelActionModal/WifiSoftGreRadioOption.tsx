/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import {  Form, Radio, Row, Select, Space } from 'antd'
import _                                    from 'lodash'
import { useIntl }                          from 'react-intl'

import { useGetSoftGreSelectOptionQuery } from '@acx-ui/rc/services'
import { SoftGreOption, SoftGreViewData } from '@acx-ui/rc/utils'
import { useParams }                      from '@acx-ui/react-router-dom'

import { mockSoftGreTable2 } from '../policies/SoftGre/SoftGreForm/__tests__/fixtures'
import SoftGreDrawer         from '../policies/SoftGre/SoftGreForm/SoftGreDrawer'

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

const { useWatch } = Form

export default function WifiSoftGreRadioOption (props: WiFISoftGreRadioOptionProps) {
  const { currentTunnelType, venueId, networkId } = props
  const { $t } = useIntl()
  const params = useParams()
  const [ softGreDetail, setSoftGreDetail ] = useState<SoftGreViewData>({} as SoftGreViewData)
  const [ detailDrawerVisible, setDetailDrawerVisible ] = useState<boolean>(false)
  const [ addDrawerVisible, setAddDrawerVisible ] = useState<boolean>(false)
  const [softGreOption, setSoftGreOption] = useState([] as SoftGreOption[])

  const [ softGreProfileId ] = [
    useWatch<string>('softGreProfile')
  ]
  const { data, isLoading } = useGetSoftGreSelectOptionQuery(
    { params, payload: { ...defaultPayload, current: { networkId, venueId } } }
  )
  // TODO: sorted activations and then other softGreNames

  const softGreList = mockSoftGreTable2.data.data

  const addOption = (option: SoftGreOption) => {
    setSoftGreOption((preState) => {
      return [option, ...preState]
    })
  }

  useEffect(() => {
    if (!isLoading) {
      setSoftGreOption((softGreList?.map(item => ({
        label: item.name, value: item.id
      })) ?? []) as SoftGreOption[])
    }
  }, [isLoading, softGreList])

  useEffect(() => {
    setSoftGreDetail(softGreList.filter(item => item.id === softGreProfileId) as unknown as SoftGreViewData)
  }, [softGreProfileId, softGreList])

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
                name={'softGreProfile'}
                children={<Select
                  style={{ width: '150px', marginBottom: '0px' }}
                  size='small'
                  options={data
                    ? [{ label: 'Select...', value: '', disable: false }, ...data]
                    : [{ label: 'Select...', value: '', disable: false }]
                  }
                  placeholder={$t({ defaultMessage: 'Select...' })}
                  defaultValue={''} />} /><UI.TextButton
                type='link'
                disabled={_.isEmpty(softGreProfileId)}
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
      policyId={softGreProfileId as string}
      policyName={softGreDetail?.name} // TODO: get name from useQuery
      readMode={true}
      editMode={false}
      callbackFn={addOption}
    />
    <SoftGreDrawer
      visible={addDrawerVisible}
      setVisible={setAddDrawerVisible}
      readMode={false}
      editMode={false}
    />
  </Row>
}

