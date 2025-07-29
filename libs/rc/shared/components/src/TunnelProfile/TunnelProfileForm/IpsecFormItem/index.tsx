import { useMemo, useState } from 'react'

import { Col, Form, Row, Switch } from 'antd'
import { DefaultOptionType }      from 'antd/lib/select'
import { find }                   from 'lodash'
import { useIntl }                from 'react-intl'

import { useGetIpsecViewDataListQuery } from '@acx-ui/rc/services'

import IpsecDrawer         from '../../../policies/Ipsec/IpsecForm/IpsecDrawer'
import { FormItemWrapper } from '../styledComponents'

import { IpsecProfileSelector } from './IpsecProfileSelector'
import { IpsecProfileView }     from './IpsecProfileView'
import * as UI                  from './styledComponents'

interface IpsecFormItemProps {
  disabled?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
  handleTunnelEncryptionChange?: (checked: boolean) => void
}

export const IpsecFormItem = (props: IpsecFormItemProps) => {
  const { $t } = useIntl()
  const { disabled = false, handleTunnelEncryptionChange } = props
  const [ipsecDrawerVisible, setIpsecDrawerVisible] = useState(false)
  const form = Form.useFormInstance()
  const tunnelEncryptionEnabled = Form.useWatch('tunnelEncryptionEnabled', form)

  const { data: ipsecData, isLoading: isIpsecLoading } = useGetIpsecViewDataListQuery({
    payload: {
      pageSize: 10_000,
      fields: [
        'name', 'id', 'preSharedKey', 'ikeProposalType',
        'espProposalType', 'ikeProposals', 'espProposals', 'tunnelUsageType'
      ],
      filters: {
        // TODO: remove this after the ipsec profile is ready
        // tunnelUsageType: [IpSecTunnelUsageTypeEnum.VXLAN_GPE]
      }
    }
  }, {
    selectFromResult: ({ data, isLoading }) => ({
      data: data?.data,
      isLoading
    })
  })

  const ipsecOptions = useMemo(() => ipsecData?.map(profile => ({
    label: profile.name,
    value: profile.id
  })) || [], [ipsecData])


  const handleAddIpsecProfile = () => {
    // open drawer to create ipsec profile
    setIpsecDrawerVisible(true)
  }

  return <div>
    {tunnelEncryptionEnabled && <UI.IpsecFormOutline />}
    <Row style={{ marginBottom: tunnelEncryptionEnabled ? '20px' : '0px' }}>
      <UI.StyledTunnelEncryptionWrapper span={24}>
        <UI.StyledSpace align='center'>
          <FormItemWrapper
            label={$t({ defaultMessage: 'Tunnel Encryption' })}
          />
          <Form.Item
            name='tunnelEncryptionEnabled'
            valuePropName='checked'
            children={<Switch
              disabled={disabled}
              onChange={(checked) => handleTunnelEncryptionChange?.(checked)}
            />}
          />
        </UI.StyledSpace>
      </UI.StyledTunnelEncryptionWrapper>

      {tunnelEncryptionEnabled &&<>
        <Col span={24}>
          <Form.Item
            name='ipsecProfileId'
            label={$t({ defaultMessage: 'IPSec Profile' })}
            rules={[
              {
                required: true,
                message: $t({ defaultMessage: 'Please select an IPSec Profile' })
              }
            ]}
          >
            <IpsecProfileSelector
              options={ipsecOptions}
              isLoading={isIpsecLoading}
              disabled={disabled}
              handleAddIpsecProfile={handleAddIpsecProfile}
            />
          </Form.Item>
        </Col>

        <Form.Item noStyle dependencies={['ipsecProfileId']}>
          {({ getFieldValue }) => {
            // eslint-disable-next-line max-len
            const selectedIpsecProfile = find(ipsecData, { id: getFieldValue('ipsecProfileId') })
            return <Col span={24}>
              <IpsecProfileView selectedIpsecProfile={selectedIpsecProfile} />
            </Col>}
          }
        </Form.Item>
        <IpsecDrawer
          visible={ipsecDrawerVisible}
          setVisible={setIpsecDrawerVisible}
          readMode={false}
          callbackFn={(newOption: DefaultOptionType) => {
            // auto select the new option
            form.setFieldValue('ipsecProfileId', newOption.value)
          }}
        />
      </>}
    </Row>
  </div>
}