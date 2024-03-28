import { useContext, useEffect } from 'react'

import { Col, Form, Row, Space, Switch } from 'antd'
import { useIntl }                       from 'react-intl'

import { StepsForm, Subtitle }        from '@acx-ui/components'
import { AAAInstance }                from '@acx-ui/rc/components'
import { IdentityProviderActionType } from '@acx-ui/rc/utils'

import IdentityProviderFormContext from './IdentityProviderFormContext'

const { useWatch } = Form

const AaaSettingsForm = () => {
  const { $t } = useIntl()

  const form = Form.useFormInstance()
  const watchAuthRadiusId = useWatch<string>('authRadiusId', form)
  const accountingRadiusEnabled = useWatch('accountingRadiusEnabled', form)
  const watchAccountingRadiusId = useWatch<string>('accountingRadiusId', form)
  const { state, dispatch } = useContext(IdentityProviderFormContext)

  useEffect(() => {
    if (watchAuthRadiusId && state.authRadiusId !== watchAuthRadiusId) {
      dispatch({
        type: IdentityProviderActionType.AUTH_RADIUS_ID,
        payload: {
          authRadiusId: watchAuthRadiusId
        }
      })
    }
  }, [watchAuthRadiusId])

  useEffect(() => {
    if (watchAccountingRadiusId && accountingRadiusEnabled &&
      state.authRadiusId !== watchAccountingRadiusId) {
      dispatch({
        type: IdentityProviderActionType.ACCOUNT_RADIUS_ID,
        payload: {
          accountingRadiusId: watchAccountingRadiusId
        }
      })
    }
  }, [watchAccountingRadiusId, accountingRadiusEnabled])


  const onAccountingEnabledChanged = (isEnabled: boolean) => {
    dispatch({
      type: IdentityProviderActionType.ACCOUNT_RADIUS_ENABLED,
      payload: {
        accountingRadiusEnabled: isEnabled
      }
    })
  }

  return (<Row gutter={20}>
    <Col span={15}>
      <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
        <StepsForm.Title>{$t({ defaultMessage: 'AAA Settings' })}</StepsForm.Title>
        <Subtitle level={3}>{ $t({ defaultMessage: 'Authentication Service' }) }</Subtitle>
        <AAAInstance serverLabel={$t({ defaultMessage: 'Authentication Server' })}
          type='authRadius'/>
        <div style={{ display: 'grid', gridTemplateColumns: '250px 50px' }}>
          <Subtitle level={3}>{ $t({ defaultMessage: 'Accounting Service' }) }</Subtitle>
          <Form.Item
            name='accountingRadiusEnabled'
            valuePropName='checked'
            initialValue={false}
            children={<Switch
              style={{ marginTop: '-10px' }}
              onChange={onAccountingEnabledChanged}
            />}
          />
        </div>
        {accountingRadiusEnabled && (
          <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
            type='accountingRadius'/>
        )}

      </Space>
    </Col>
  </Row>
  )
}

export default AaaSettingsForm