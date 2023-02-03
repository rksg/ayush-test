import { useState, useRef } from 'react'

import { Checkbox, Form, Input, Col, Row, Typography } from 'antd'
import _                                               from 'lodash'
import { useIntl }                                     from 'react-intl'

import {
  cssStr,
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useAddCliTemplateMutation } from '@acx-ui/rc/services'
import {
  agreeRegExp,
  catchErrorResponse
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { CliStepConfiguration } from './CliStepConfiguration'
import { CliStepSummary }       from './CliStepSummary'
import { CliStepSwitches }      from './CliStepSwitches'

export default function NetworkForm () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToNetworks = useTenantLink('/networks')
  const editMode = params.action === 'edit'

  const formRef = useRef<StepsFormInstance>()
  const [addCliTemplate] = useAddCliTemplateMutation()
  const [summaryData, setSummaryData] = useState({} as any)

  const handleEditCli = async () => {
  }

  const handleAddCli = async (data: any) => {
    const switches = Object.entries(data.venueSwitches ?? {})
      .map(v => ({ venueId: v[0], switches: v[1] })) ////

    try {
      await addCliTemplate({
        params, payload: {
          ...data,
          applyLater: true, /// TODO
          venueSwitches: switches
        }
      }).unwrap()
      // navigate(linkToNetworks, { replace: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
      const errorRes = error as catchErrorResponse
      const message = errorRes?.data?.errors?.[0]?.message ?? $t({ defaultMessage: 'An error occurred' })
      showToast({
        type: 'error',
        content: $t({ defaultMessage: '{message}' }, { message })
      })
    }
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit CLI Template' })
          : $t({ defaultMessage: 'Add CLI Template' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Networks' }), link: '/networks' }
        ]}
      />
      <StepsForm
        formRef={formRef}
        editMode={editMode}
        onCancel={() => navigate(linkToNetworks)}
        onFinish={editMode ? handleEditCli : handleAddCli}
      >
        <StepsForm.StepForm
          name='notice'
          title={$t({ defaultMessage: 'Important Notice' })}
          layout='horizontal'
        >
          <Row gutter={20}>
            <Col span={10}>
              <StepsForm.Title>{$t({ defaultMessage: 'Important Notice' })}</StepsForm.Title>
              <Typography.Text style={{
                fontWeight: 600,
                display: 'block', margin: '4px 0 12px',
                fontSize: cssStr('--acx-body-3-font-size')
              }}>
                {$t({ defaultMessage: 'Read this before you start:' })}
              </Typography.Text>
              <Typography.Text style={{
                display: 'block', marginBottom: '32px',
                fontSize: cssStr('--acx-body-3-font-size'),
                color: cssStr('--acx-semantics-red-50')
              }}>{
                  // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'It is the user\'s responsibility to ensure the validity and ordering of CLI commands are accurate. The recommendation is to get familiarized with ICX Fastiron CLI commands to avoid configuration failures' })}
              </Typography.Text>
              <Form.Item
                name='agree'
                style={{ color: cssStr('--acx-primary-black') }}  ///
                label={$t({ defaultMessage: 'Please type “AGREE” here to continue:' })}
                rules={[
                  { required: true, message: $t({ defaultMessage: 'Please type “AGREE”' }) },
                  { validator: (_, value) => agreeRegExp(value) }
                ]}
                validateFirst
                children={
                  <Input style={{ width: '120px' }} />
                }
              />
            </Col>
          </Row>
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='settings'
          title={$t({ defaultMessage: 'CLI Configuration' })}
          onFinish={async (data) => {
            console.log('step CLI Configuration', data, summaryData)
            setSummaryData({ ...summaryData, ...data })
            return true
          }}
        >
          <CliStepConfiguration formRef={formRef} />
          <Row style={{ position: 'fixed', bottom: '80px', marginLeft: '-200px' }}>
            <Col span={18}>
              <div >
                <Form.Item /////////////// TODO: check style
                  noStyle
                  name='reload'
                  valuePropName='checked'
                >
                  <Checkbox children={$t({ defaultMessage: 'Reboot the Switches after applying config' })} />
                </Form.Item>
              </div>
            </Col>
          </Row>

        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='switches'
          title={$t({ defaultMessage: 'Switches' })}
          onFinish={async (data) => {
            console.log('step Switches', data, summaryData)
            setSummaryData({ ...summaryData, ...data })
            return true
          }}
        >
          <CliStepSwitches formRef={formRef} />
        </StepsForm.StepForm>

        {!editMode &&
          <StepsForm.StepForm
            name='summary'
            title={$t({ defaultMessage: 'Summary' })}
          >
            <CliStepSummary data={summaryData} />
          </StepsForm.StepForm>
        }
      </StepsForm>
    </>
  )
}
