import { useEffect, useState } from 'react'

import { Col, Form, Row }                      from 'antd'
import { useIntl }                             from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { PageHeader, StepsForm }                                                from '@acx-ui/components'
import { useCreateIpsecMutation, useGetIpsecByIdQuery, useUpdateIpsecMutation } from '@acx-ui/rc/services'
import {
  getPolicyRoutePath,
  Ipsec,
  IpSecAdvancedOptionEnum,
  IpSecFailoverModeEnum,
  IpSecFormData,
  IpSecProposalTypeEnum,
  IpSecRekeyTimeUnitEnum,
  LocationExtended,
  PolicyOperation,
  PolicyType,
  redirectPreviousPage,
  usePolicyListBreadcrumb
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

import { IpsecSettingForm } from './IpsecSettingForm'

interface IpsecFormProps {
  editMode: boolean
}

export const IpsecForm = (props: IpsecFormProps) => {
  const { editMode } = props
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm()
  const previousPath = (location as LocationExtended)?.state?.from?.pathname
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.IPSEC)
  const tablePath = getPolicyRoutePath({
    type: PolicyType.IPSEC,
    oper: PolicyOperation.LIST
  })
  const linkToTableView = useTenantLink(tablePath)
  const [ updateIpsec ] = useUpdateIpsecMutation()
  const [ createIpsec ] = useCreateIpsecMutation()
  const { data: dataFromServer } = useGetIpsecByIdQuery({ params }, { skip: !editMode })
  const [initialIpSpecData, setInitialIpSpecData] = useState({} as Ipsec)

  useEffect(() => {
    if (dataFromServer && editMode) {
      form.setFieldsValue({
        ...dataFromServer
      })
      setInitialIpSpecData(dataFromServer)
    } else {
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
        ikeRekeyTimeEnabledCheckbox: true,
        espRekeyTimeEnabledCheckbox: true,
        retryLimitEnabledCheckbox: true,
        espReplayWindowEnabledCheckbox: true,
        deadPeerDetectionDelayEnabledCheckbox: false,
        nattKeepAliveIntervalEnabledCheckbox: true
      })
    }
  }, [dataFromServer, editMode, form])

  const handleFinish = async (data: IpSecFormData) => {
    try {
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

      // eslint-disable-next-line no-console
      console.log('data', data)
      if (editMode) {
        await updateIpsec({ params, payload: data }).unwrap()
      } else {
        await createIpsec({ params, payload: data }).unwrap()
      }
      redirectPreviousPage(navigate, previousPath, linkToTableView)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit IPsec' })
          : $t({ defaultMessage: 'Add IPsec' })
        }
        breadcrumb={breadcrumb}
      />
      <StepsForm<Ipsec>
        form={form}
        onFinish={handleFinish}
        onCancel={() => redirectPreviousPage(navigate, previousPath, linkToTableView)}
        buttonLabel={{
          submit: editMode
            ? $t({ defaultMessage: 'Apply' })
            : $t({ defaultMessage: 'Add' })
        }}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={10}>
              <IpsecSettingForm
                editMode={editMode}
                readMode={false}
                policyId={params?.policyId}
                initIpSecData={initialIpSpecData}
              />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}