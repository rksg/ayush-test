import { useRef } from 'react'

import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { showToast, StepsForm, PageHeader, StepsFormInstance } from '@acx-ui/components'
import { SwitchConfigurationProfile }                          from '@acx-ui/rc/utils'
import { useParams }                                           from '@acx-ui/react-router-dom'

import { AclSetting }     from './AclSetting'
import { GeneralSetting } from './GeneralSetting'
import { VenueSetting }   from './VenueSetting'
import { VlanSetting }    from './VlanSetting'

export function ConfigurationProfileForm () {
  const { $t } = useIntl()
  const params = useParams()
  const editMode = params.action === 'edit'

  const formRef = useRef<StepsFormInstance<SwitchConfigurationProfile>>()

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit Switch Configuration Profile' })
          : $t({ defaultMessage: 'Add Switch Configuration Profile' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Wired Networks' }), link: '/networks/wired' }
        ]}
      />
      <StepsForm
        formRef={formRef}
        onCancel={() => showToast({ type: 'info', content: 'Cancel' })}
        onFinish={async (data) => {
          console.log(data); // eslint-disable-line
          showToast({ type: 'success', content: 'Submitted' }) // show notification to indicate submission successful
        }}
      >
        <StepsForm.StepForm
          title={$t({ defaultMessage: 'General' })}
          onFinish={async (data) => {
            console.log(data); // eslint-disable-line
            return true // return true to continue to next step
          }}
        >
          <GeneralSetting />
        </StepsForm.StepForm>

        <StepsForm.StepForm
          title={$t({ defaultMessage: 'VLANs' })}
          onFinish={async (data) => {
            console.log(data); // eslint-disable-line
            return true
          }}
        >
          <VlanSetting />
        </StepsForm.StepForm>

        <StepsForm.StepForm
          title={$t({ defaultMessage: 'ACLs' })}
          onFinish={async (data) => {
            console.log(data); // eslint-disable-line
            return true
          }}
        >
          <AclSetting />
        </StepsForm.StepForm>

        <StepsForm.StepForm
          title={$t({ defaultMessage: 'Venues' })}
          onFinish={async (data) => {
            console.log(data); // eslint-disable-line
            return true
          }}
        >
          <VenueSetting />
        </StepsForm.StepForm>

        <StepsForm.StepForm
          title={$t({ defaultMessage: 'Summary' })}
          onFinish={async (data) => {
            console.log(data); // eslint-disable-line
            return true
          }}
        >
          <Row gutter={20}>
            <Col span={10}>
              <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
