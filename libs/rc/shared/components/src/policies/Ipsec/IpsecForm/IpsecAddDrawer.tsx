import { useEffect } from 'react'

import {  Col, Form, Row }   from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { useIntl }           from 'react-intl'

import { Drawer }                 from '@acx-ui/components'
import { Features }               from '@acx-ui/feature-toggle'
import { useCreateIpsecMutation } from '@acx-ui/rc/services'
import {
  defaultIpsecFormData,
  Ipsec,
  IpSecFormData,
  IpSecProposalTypeEnum,
  IpSecTunnelUsageTypeEnum,
  useIsEdgeFeatureReady
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { IpsecSettingForm } from './IpsecSettingForm'


interface IpsecAddDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  callbackFn?: (option: DefaultOptionType) => void
}

export default function IpsecAddDrawer (props: IpsecAddDrawerProps) {
  const { visible, setVisible, callbackFn } = props
  const { $t } = useIntl()
  const isEdgeVxLanIpsecReady = useIsEdgeFeatureReady(Features.EDGE_IPSEC_VXLAN_TOGGLE)

  const params = useParams()
  const [form] = Form.useForm()
  const [ createIpsec ] = useCreateIpsecMutation()

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        ...defaultIpsecFormData,
        ...(isEdgeVxLanIpsecReady ? { tunnelUsageType: IpSecTunnelUsageTypeEnum.VXLAN_GPE }: {})
      })
    }
  }, [visible])

  const preSave = (data: IpSecFormData) => {
    if (data?.advancedOption) {
      if (!data.advancedOption.failoverRetryPeriod) {
        data.advancedOption.failoverRetryPeriod = 0
      }
    }
    if (data?.ikeSecurityAssociation?.ikeProposalType === IpSecProposalTypeEnum.DEFAULT) {
      data.ikeSecurityAssociation.ikeProposals = []
    }
    if (data?.espSecurityAssociation?.espProposalType === IpSecProposalTypeEnum.DEFAULT) {
      data.espSecurityAssociation.espProposals = []
    }
    if (data.ikeRekeyTimeEnabledCheckbox === false && data.ikeRekeyTime) {
      data.ikeRekeyTime = 0
    }
    if (data.espRekeyTimeEnabledCheckbox === false && data.espRekeyTime) {
      data.espRekeyTime = 0
    }
    if (data.retryLimitEnabledCheckbox === false) {
      if (data.advancedOption && data.advancedOption.retryLimit)
        data.advancedOption.retryLimit = 0
    }
    if (data.deadPeerDetectionDelayEnabledCheckbox === false) {
      if (data.advancedOption && data.advancedOption.dpdDelay)
        data.advancedOption.dpdDelay = 0
    }
    if (data.espReplayWindowEnabledCheckbox === false) {
      if (data.advancedOption && data.advancedOption.replayWindow)
        data.advancedOption.replayWindow = 0
    }
    if (data.nattKeepAliveIntervalEnabledCheckbox === false) {
      if (data.advancedOption && data.advancedOption.keepAliveInterval)
        data.advancedOption.keepAliveInterval = 0
    }
  }

  const handleAdd = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue(true)
      preSave(values)
      const resData = await createIpsec({ params, payload: values }).unwrap()
      if (resData.response?.id) {
        const newOption = {
          value: resData.response?.id, label: values.name
        } as { value: string, label: string }
        // eslint-disable-next-line max-len
        callbackFn && callbackFn(newOption)
      }

      setVisible(false)
      form.resetFields()
      form.setFieldValue('authType', '')
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleClose = () => {
    setVisible(false)
    form.resetFields()
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add IPsec' })}
      visible={visible}
      width={750}
      children={visible &&
        <Form<Ipsec> layout='vertical' form={form} >
          <Row gutter={20}>
            <Col span={24}>
              <IpsecSettingForm />
            </Col>
          </Row>
        </Form>}
      onClose={handleClose}
      destroyOnClose={true}
      footer={<Drawer.FormFooter
        buttonLabel={{
          save: $t({ defaultMessage: 'Add' })
        }}
        onCancel={handleClose}
        onSave={() => {
          return handleAdd()
        }}
      />}
    />
  )
}