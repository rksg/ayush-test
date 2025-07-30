import { useEffect, useState } from 'react'

import { Col, Form, Row }                      from 'antd'
import { useIntl }                             from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { PageHeader, StepsForm }                                                from '@acx-ui/components'
import { Features }                                                             from '@acx-ui/feature-toggle'
import { useCreateIpsecMutation, useGetIpsecByIdQuery, useUpdateIpsecMutation } from '@acx-ui/rc/services'
import {
  defaultIpsecFormData,
  getPolicyRoutePath,
  Ipsec,
  IpSecFormData,
  IpSecProposalTypeEnum,
  IpSecRekeyTimeUnitEnum,
  IpSecTunnelUsageTypeEnum,
  LocationExtended,
  PolicyOperation,
  PolicyType,
  redirectPreviousPage,
  useIsEdgeFeatureReady,
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

  const isEdgeVxLanIpsecReady = useIsEdgeFeatureReady(Features.EDGE_IPSEC_VXLAN_TOGGLE)

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
  const {
    data: dataFromServer,
    isLoading, isFetching
  } = useGetIpsecByIdQuery({ params }, { skip: !editMode })
  const [initialIpSpecData, setInitialIpSpecData] = useState<Ipsec | undefined>(undefined)

  useEffect(() => {
    if (dataFromServer && editMode) {
      form.setFieldsValue({
        ...dataFromServer
      })
      setInitialIpSpecData(dataFromServer)
    } else {
      form.setFieldsValue({
        ...defaultIpsecFormData,
        ...(isEdgeVxLanIpsecReady ? { tunnelUsageType: IpSecTunnelUsageTypeEnum.VXLAN_GPE }: {})
      })
    }
  }, [dataFromServer, editMode, form])

  const handleFinish = async (data: IpSecFormData) => {
    try {
      if (data?.ikeSecurityAssociation?.ikeProposalType === IpSecProposalTypeEnum.DEFAULT) {
        data.ikeSecurityAssociation.ikeProposals = []
      }
      if (data?.espSecurityAssociation?.espProposalType === IpSecProposalTypeEnum.DEFAULT) {
        data.espSecurityAssociation.espProposals = []
      }
      if (data.ikeRekeyTimeEnabledCheckbox === false && data.ikeRekeyTime) {
        data.ikeRekeyTime = 0
        data.ikeRekeyTimeUnit = IpSecRekeyTimeUnitEnum.HOUR
      }
      if (data.espRekeyTimeEnabledCheckbox === false && data.espRekeyTime) {
        data.espRekeyTime = 0
        data.espRekeyTimeUnit = IpSecRekeyTimeUnitEnum.HOUR
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
      if (data.failoverRetryPeriodIsForever === true) {
        if (data.advancedOption && data.advancedOption.failoverRetryPeriod)
          data.advancedOption.failoverRetryPeriod = 0
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
                editData={initialIpSpecData}
                isLoading={isLoading || isFetching}
              />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}