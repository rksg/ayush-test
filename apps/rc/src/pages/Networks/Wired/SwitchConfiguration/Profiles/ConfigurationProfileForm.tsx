import { useRef, useState } from 'react'

import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { showToast, StepsForm, PageHeader, StepsFormInstance } from '@acx-ui/components'
import { SwitchConfigurationProfile, Vlan }                    from '@acx-ui/rc/utils'
import { useParams }                                           from '@acx-ui/react-router-dom'

import { AclSetting }                  from './AclSetting'
import ConfigurationProfileFormContext from './ConfigurationProfileFormContext'
import { GeneralSetting }              from './GeneralSetting'
import { TrustedPorts }                from './TrustedPorts'
import { VenueSetting }                from './VenueSetting'
import { VlanSetting }                 from './VlanSetting'


export function ConfigurationProfileForm () {
  const { $t } = useIntl()
  const params = useParams()
  const editMode = params.action === 'edit'
  const [ ipv4DhcpSnooping, setIpv4DhcpSnooping ] = useState(false)
  const [ arpInspection, setArpInspection ] = useState(false)
  const [ currentData, setCurrentData ] =
    useState<SwitchConfigurationProfile>({} as SwitchConfigurationProfile)

  const formRef = useRef<StepsFormInstance<SwitchConfigurationProfile>>()

  const updateVlanCurrentData = async (data: Partial<SwitchConfigurationProfile>) => {
    const ipv4DhcpSnoopingValue =
      data.vlans?.filter((item: Partial<Vlan>) => item.ipv4DhcpSnooping === true) || []
    const arpInspectionValue =
      data.vlans?.filter((item: Partial<Vlan>) => item.ipv4DhcpSnooping === true) || []

    setIpv4DhcpSnooping(ipv4DhcpSnoopingValue.length > 0)
    setArpInspection(arpInspectionValue.length > 0)

    setCurrentData({
      ...currentData,
      ...data
    })

    return true
  }

  const updateCurrentData = async (data: Partial<SwitchConfigurationProfile>) => {
    setCurrentData({
      ...currentData,
      ...data
    })

    return true
  }

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
      <ConfigurationProfileFormContext.Provider value={{ editMode, currentData }}>
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
            onFinish={updateCurrentData}
          >
            <GeneralSetting />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            title={$t({ defaultMessage: 'VLANs' })}
            onFinish={updateVlanCurrentData}
          >
            <VlanSetting />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            title={$t({ defaultMessage: 'ACLs' })}
            onFinish={updateCurrentData}
          >
            <AclSetting />
          </StepsForm.StepForm>

          {(ipv4DhcpSnooping || arpInspection) &&
            <StepsForm.StepForm
              title={$t({ defaultMessage: 'Trusted Ports' })}
              onFinish={updateCurrentData}
            >
              <TrustedPorts />
            </StepsForm.StepForm>
          }

          <StepsForm.StepForm
            title={$t({ defaultMessage: 'Venues' })}
            onFinish={updateCurrentData}
          >
            <VenueSetting />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            title={$t({ defaultMessage: 'Summary' })}
            onFinish={updateCurrentData}
          >
            <Row gutter={20}>
              <Col span={10}>
                <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />
              </Col>
            </Row>
          </StepsForm.StepForm>
        </StepsForm>
      </ConfigurationProfileFormContext.Provider>
    </>
  )
}
