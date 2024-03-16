import { useContext, useEffect, useState } from 'react'

import { Col, Form, Row, Space } from 'antd'
import { useIntl }               from 'react-intl'
import { useParams }             from 'react-router-dom'

import { PasswordInput, StepsForm, Subtitle } from '@acx-ui/components'
import { useAaaPolicyQuery }                  from '@acx-ui/rc/services'
import { AAAPolicyType }                      from '@acx-ui/rc/utils'

import IdentityProviderFormContext from './IdentityProviderFormContext'


const SummaryForm = () => {
  const { $t } = useIntl()
  const params = useParams()

  const { state } = useContext(IdentityProviderFormContext)
  const [authRadius, setAuthRadius] = useState<AAAPolicyType>()
  const [accountingRadius, setAccountingRadius] = useState<AAAPolicyType>()

  const { data: authRadiusData } = useAaaPolicyQuery({
    params: { ...params, policyId: state.authRadiusId }
  }, {
    skip: !state.authRadiusId
  })

  const { data: accountingRadiusData } = useAaaPolicyQuery({
    params: { ...params, policyId: state.accountingRadiusId }
  }, {
    skip: !state.accountingRadiusEnabled || !state.accountingRadiusId
  })

  useEffect(() => {
    if (authRadiusData) {
      setAuthRadius(authRadiusData)
    }

    if(accountingRadiusData) {
      setAccountingRadius(accountingRadiusData)
    }
  }, [authRadiusData, accountingRadiusData])

  return (<Row gutter={20}>
    <Col span={15}>
      <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
        <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>
        <Subtitle level={3}>{ $t({ defaultMessage: 'Network Identifier' }) }</Subtitle>
        <Form.Item label={$t({ defaultMessage: 'Profile Name' })} children={state.name} />
        <div style={{ display: 'grid', gridTemplateColumns: '35% 20% 35%' }}>
          <Form.Item label={$t({ defaultMessage: 'NAI Realm' })}
            children={state.naiRealms?.map((realm, index) =>
              <div key={`realm-${index}`}>
                {`${realm.name} (${realm.eap?.length || 0} EAP methods)`}
              </div>
            )} />
          <Form.Item label={$t({ defaultMessage: 'PLMN' })}
            children={state.plmns?.map((plmn, index) =>
              <div key={`plmn-${index}`}> {`${plmn.mcc} ${plmn.mcc}`}</div>
            )} />
          <Form.Item label={$t({ defaultMessage: 'Roaming Consortium' })}
            children={state.roamConsortiumOIs?.map((roi, index) =>
              <div key={`roi-${index}`}> {`${roi.name} (${roi.organizationId})`}</div>
            )} />
        </div>

        <Subtitle level={3}>{ $t({ defaultMessage: 'AAA Settings' }) }</Subtitle>
        {$t({ defaultMessage: 'Authentication Service' })}
        <AAAPolicyFields aaaPolicy={authRadius} />

        {$t({ defaultMessage: 'Accounting Service' })}
        {!state.accountingRadiusEnabled ? $t({ defaultMessage: 'Disabled' }) :
          <AAAPolicyFields aaaPolicy={accountingRadius} />
        }
      </Space>
    </Col>
  </Row>
  )
}

type RadiusServerFieldsProps = {
  aaaPolicy: AAAPolicyType | undefined
  isSecondary?: boolean
}

const RadiusServerFields = (props: RadiusServerFieldsProps) => {
  const { $t } = useIntl()
  const { aaaPolicy, isSecondary=false } = props
  const radiusServer = aaaPolicy && aaaPolicy[!isSecondary? 'primary': 'secondary' ]
  const { ip, port, sharedSecret } = radiusServer || {}

  const title = !isSecondary
    ?$t({ defaultMessage: 'Primary Server' })
    : $t({ defaultMessage: 'Secondary Server' })


  return (radiusServer ? <>
    <Form.Item
      label={title}
      children={`${ip}: ${port}`} />
    <Form.Item
      label={$t({ defaultMessage: 'Shared Secret:' })}
      children={<PasswordInput
        readOnly
        bordered={false}
        value={sharedSecret}
      />}
    />
  </> : null)
}

const AAAPolicyFields = (props: { aaaPolicy: AAAPolicyType | undefined }) => {
  const { $t } = useIntl()
  const { aaaPolicy } = props
  const { name='', type, primary, secondary } = aaaPolicy || {}
  const title = (type === 'ACCOUNTING')
    ? $t({ defaultMessage: 'Accounting Server' })
    : $t({ defaultMessage: 'Authentication Server' })
  return (<>
    <Form.Item label={title} children={name} />
    {primary && <>
      <RadiusServerFields aaaPolicy={aaaPolicy} />
      {secondary &&
       <RadiusServerFields aaaPolicy={aaaPolicy} isSecondary />
      }
    </>}
  </>
  )
}

export default SummaryForm