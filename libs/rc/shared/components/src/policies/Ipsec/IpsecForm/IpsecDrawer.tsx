import { useEffect } from 'react'

import {  Col, Form, Row }   from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { useIntl }           from 'react-intl'

import { Drawer }                 from '@acx-ui/components'
import { useCreateIpsecMutation } from '@acx-ui/rc/services'
import {
  Ipsec,
  IpSecAdvancedOptionEnum,
  IpSecFailoverModeEnum,
  IpSecFormData,
  IpSecProposalTypeEnum,
  IpSecRekeyTimeUnitEnum
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { IpsecSettingForm } from './IpsecSettingForm'


interface IpsecDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  readMode?: boolean
  policyId?:string
  policyName?: string
  callbackFn?: (option: DefaultOptionType) => void
}

export default function IpsecDrawer (props: IpsecDrawerProps) {
  const { visible, setVisible, readMode=false, policyId, policyName, callbackFn } = props
  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const [ createIpsec ] = useCreateIpsecMutation()

  useEffect(() => {
    if (!readMode) {
      form.setFieldsValue({
        iskRekeyTimeUnit: IpSecRekeyTimeUnitEnum.HOUR,
        espRekeyTimeUnit: IpSecRekeyTimeUnitEnum.HOUR,
        advancedOption: {
          retryLimit: 5,
          replayWindow: 32,
          ipcompEnable: IpSecAdvancedOptionEnum.DISABLED,
          enforceNatt: IpSecAdvancedOptionEnum.DISABLED,
          dpdDelay: 1,
          keepAliveInterval: 20,
          failoverRetryInterval: 1,
          failoverMode: IpSecFailoverModeEnum.NON_REVERTIVE,
          failoverPrimaryCheckInterval: 1
        },
        ikeSecurityAssociation: {
          ikeProposalType: IpSecProposalTypeEnum.DEFAULT,
          ikeProposals: []
        },
        espSecurityAssociation: {
          espProposalType: IpSecProposalTypeEnum.DEFAULT,
          espProposals: []
        },
        retryLimitEnabledCheckbox: true,
        espReplayWindowEnabledCheckbox: true,
        deadPeerDetectionDelayEnabledCheckbox: false,
        nattKeepAliveIntervalEnabledCheckbox: true
      })
    }
  }, [form, readMode, visible])

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
      if (!readMode) {
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
      }
      setVisible(false)
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
      title={readMode
        ? $t({ defaultMessage: 'Profile Details: {name}' }, { name: policyName })
        : $t({ defaultMessage: 'Add IPsec' })
      }
      visible={visible}
      width={readMode ? 450 : 750}
      children={visible &&
        <Form<Ipsec> layout='vertical' form={form} >
          <Row gutter={20}>
            <Col span={24}>
              <IpsecSettingForm
                editMode={false}
                readMode={readMode}
                policyId={policyId}
              />
            </Col>
          </Row>
        </Form>
      }
      onClose={handleClose}
      destroyOnClose={true}
      footer={!readMode &&
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'Add' })
          }}
          onCancel={handleClose}
          onSave={() => {
            return handleAdd()
          }}
        />
      }
    />
  )
}