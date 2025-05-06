import { useState, useEffect, useContext } from 'react'

import {
  Space,
  Form,
  Switch,
  Select,
  Radio
} from 'antd'
import _                             from 'lodash'
import { FormattedMessage, useIntl } from 'react-intl'
import { useParams }                 from 'react-router-dom'

import { Subtitle, Tooltip, PasswordInput }                       from '@acx-ui/components'
import { get }                                                    from '@acx-ui/config'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { AaaServerOrderEnum, AuthRadiusEnum, useConfigTemplate }  from '@acx-ui/rc/utils'

import { useLazyGetAAAPolicyInstance, useGetAAAPolicyInstanceList } from '../../../../policies/AAAForm/aaaPolicyQuerySwitcher'
import { AAAInstance }                                              from '../../../AAAInstance'
import AAAPolicyModal                                               from '../../../AAAInstance/AAAPolicyModal'
import * as contents                                                from '../../../contentsMap'
import NetworkFormContext                                           from '../../../NetworkFormContext'

import { Description }         from './styledComponents'
import { WISPrAuthAccContext } from './WISPrAuthAccServerReducer'

export function WISPrAuthAccServer (props : {
  onClickAuth: () => void,
  onClickAllAccept: () => void
}) {
  const { $t } = useIntl()
  const params = useParams()
  const { useWatch } = Form
  const form = Form.useFormInstance()
  const { data, setData } = useContext(NetworkFormContext)
  const { data: aaaAuthListQuery } = useGetAAAPolicyInstanceList({
    queryOptions: { refetchOnMountOrArgChange: 10 },
    customPayload: { filters: { type: ['AUTHENTICATION'] } }
  })
  const [ getAaaPolicy ] = useLazyGetAAAPolicyInstance()
  const authDropdownItems = aaaAuthListQuery?.data.map(m => ({ label: m.name, value: m.id })) ?? []
  const [ aaaList, setAaaList ]= useState(authDropdownItems)
  const context = useContext(WISPrAuthAccContext)
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const { isTemplate } = useConfigTemplate()

  const [
    enableAccountingService,
    authRadius,
    selectedAuthProfileId,
    accountingRadius
  ] = [
    useWatch<boolean>(['enableAccountingService']),
    useWatch('authRadius'),
    useWatch('authRadiusId'),
    useWatch('accountingRadius')
  ]

  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const supportRadsec = isRadsecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate
  const primaryRadius = authRadius?.[AaaServerOrderEnum.PRIMARY]
  const secondaryRadius = authRadius?.[AaaServerOrderEnum.SECONDARY]

  const onAccountingServiceChange = (enabled: boolean) => {
    if(!enabled){
      form.setFieldValue(['guestPortal','wisprPage','accountingRadius'], undefined)
      form.setFieldValue(['guestPortal','wisprPage','accountingRadiusId'], undefined)
    }
    setData && setData({
      ...(enabled
        ? data
        : _.omit(data, [
          'guestPortal.wisprPage.accountingRadius', 'guestPortal.wisprPage.accountingRadiusId',
          'accountingRadius', 'accountingRadiusId'
        ])),
      enableAccountingService: enabled
    })
  }

  useEffect(()=>{
    if(aaaAuthListQuery?.data) {
      setAaaList(aaaAuthListQuery.data.map(m => ({ label: m.name, value: m.id })))
    }
  },[aaaAuthListQuery])

  useEffect(()=>{
    if (!authRadius) return

    form.setFieldValue(['guestPortal','wisprPage','authRadius'], authRadius)
    form.setFieldValue(['guestPortal','wisprPage','authRadiusId'], authRadius.id)

    if (authRadius.id !== data?.authRadiusId) {
      setData && setData({
        ...data,
        authRadius,
        authRadiusId: authRadius.id,
        guestPortal: {
          ...data?.guestPortal,
          wisprPage: {
            ...data!.guestPortal!.wisprPage!,
            authRadius
          }
        }
      })
    }
  },[authRadius])

  useEffect(()=>{
    if(!accountingRadius) return

    form.setFieldValue(['guestPortal','wisprPage','accountingRadius'], accountingRadius)
    form.setFieldValue(['guestPortal','wisprPage','accountingRadiusId'], accountingRadius.id)

    if (accountingRadius.id !== data?.accountingRadiusId) {
      setData && setData({
        ...data,
        accountingRadius,
        accountingRadiusId: accountingRadius.id,
        guestPortal: {
          ...data?.guestPortal,
          wisprPage: {
            ...data!.guestPortal!.wisprPage!,
            accountingRadius
          }
        }
      })
    }
  },[accountingRadius])

  useEffect(() => {
    if (selectedAuthProfileId) {
      getAaaPolicy({ params: { ...params, policyId: selectedAuthProfileId }, enableRbac })
        .unwrap()
        .then((data) => form.setFieldValue('authRadius', data))
    } else {
      form.setFieldValue('authRadius', undefined)
    }
  }, [selectedAuthProfileId])

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <Subtitle level={3}>{$t({ defaultMessage: 'Authentication Service' })}</Subtitle>

        <Form.Item
          name={['guestPortal','wisprPage','authType']}
          initialValue={'RADIUS'}
        >
          <Radio.Group>
            <Space direction='vertical'>
              <Radio value={AuthRadiusEnum.RADIUS}
                data-testid='radius'
                onChange={() => {props.onClickAuth()}}>
                {$t({ defaultMessage: 'Authenticate Connections' })}
              </Radio>
              <Form.Item label={$t({ defaultMessage: 'Authentication Server' })}>
                <Space>
                  <Form.Item
                    name={'authRadiusId'}
                    noStyle
                    label={$t({ defaultMessage: 'Authentication Server' })}
                    rules={[
                      {
                        validator: (_, value) => {
                          if (context.state.isDisabled.Auth || value !== '') {
                            return Promise.resolve()
                          }
                          return Promise.reject()
                        }
                      }
                    ]}
                    initialValue={''}
                    children={
                      <Select
                        style={{ width: 210 }}
                        disabled={context.state.isDisabled.Auth}
                        data-testid='radius_server_selection'
                        options={[
                          { label: $t({ defaultMessage: 'Select server' }), value: '' },
                          ...aaaList
                        ]}
                      />}
                  />
                  <AAAPolicyModal
                    updateInstance={(data) => {
                      setAaaList([...aaaList, { label: data.name, value: data.id }])
                      form.setFieldValue('authRadiusId', data.id)
                      form.setFieldValue('authRadius', data)
                    }}
                    aaaCount={aaaList.length}
                    type={'AUTHENTICATION'}
                    disabled={context.state.isDisabled.Auth}
                  />
                </Space>
              </Form.Item>
              <Radio
                data-testid='always_accept'
                value={AuthRadiusEnum.ALWAYS_ACCEPT}
                disabled={context.state.isDisabled.AllAccept}
                onChange={() => {props.onClickAllAccept()}}>
                {context.state.isDisabled.AllAccept ? <Tooltip
                  placement='bottom'
                  mouseEnterDelay={0}
                  mouseLeaveDelay={0}
                  // eslint-disable-next-line max-len
                  title={$t({ defaultMessage: 'In order to enable this option you have to uncheck the “Enable MAC auth bypass” option' })}>
                  {$t({ defaultMessage: 'Accept All Connections' })}
                </Tooltip> : $t({ defaultMessage: 'Accept All Connections' })}
              </Radio>
              <Description>
                <FormattedMessage
                  values={{
                    br: () => <br />,
                    link: <a
                      className='link'
                      target='_blank'
                      href={get('API_DOCUMENTATION_URL')}
                      rel='noreferrer'>
                      {$t({ defaultMessage: 'RUCKUS One WISPr API Reference' })}
                    </a>
                  }}

                  defaultMessage={
                    // eslint-disable-next-line
                    `Additional external configuration is required for this feature to function properly.
                    <br></br>
                    For more details, refer to {link}.`}
                />
              </Description>
            </Space>
          </Radio.Group>
        </Form.Item>

        <div style={{ marginTop: 6, backgroundColor: 'var(--acx-neutrals-20)',
          width: 210, paddingLeft: 5 }}>
          {!_.isEmpty(_.get(authRadius, 'id')) && <>
            {primaryRadius &&
              <Form.Item
                label={$t(contents.aaaServerTypes[AaaServerOrderEnum.PRIMARY])}
                children={$t({ defaultMessage: '{ipAddress}:{port}' }, {
                  ipAddress: _.get(authRadius,
                    `${AaaServerOrderEnum.PRIMARY}.ip`),
                  port: _.get(authRadius,
                    `${AaaServerOrderEnum.PRIMARY}.port`)
                })} />}
            {primaryRadius && !_.get(authRadius, 'radSecOptions.tlsEnabled') &&
              <Form.Item
                label={$t({ defaultMessage: 'Shared Secret' })}
                children={<PasswordInput
                  readOnly
                  bordered={false}
                  value={_.get(authRadius,
                    `${AaaServerOrderEnum.PRIMARY}.sharedSecret`)}
                />}
              />}
            {secondaryRadius &&
              <Form.Item
                label={$t(contents.aaaServerTypes[AaaServerOrderEnum.SECONDARY])}
                children={$t({ defaultMessage: '{ipAddress}:{port}' }, {
                  ipAddress: _.get(authRadius,
                    `${AaaServerOrderEnum.SECONDARY}.ip`),
                  port: _.get(authRadius,
                    `${AaaServerOrderEnum.SECONDARY}.port`)
                })} />}
            {secondaryRadius && !_.get(authRadius, 'radSecOptions.tlsEnabled') &&
              <Form.Item
                label={$t({ defaultMessage: 'Shared Secret' })}
                children={<PasswordInput
                  readOnly
                  bordered={false}
                  value={_.get(authRadius,
                    `${AaaServerOrderEnum.SECONDARY}.sharedSecret`)}
                />}
              />}
            {supportRadsec &&
              <Form.Item
                label={$t({ defaultMessage: 'RadSec' })}
                children={$t({ defaultMessage: '{tlsEnabled}' }, {
                  tlsEnabled: _.get(authRadius, 'radSecOptions.tlsEnabled') ? 'On' : 'Off'
                })}
              />}
          </>}
        </div>
        <Form.Item
          name={'authRadius'}
          children={<></>}
          hidden
        />

      </div>
      <div>
        <Subtitle level={3}>{$t({ defaultMessage: 'Accounting Service' })}</Subtitle>
        <Form.Item name='enableAccountingService' valuePropName='checked'>
          <Switch onChange={checked => onAccountingServiceChange(checked)}/>
        </Form.Item>
        {enableAccountingService &&
          <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
            type='accountingRadius'/>
        }
        <Form.Item name={['guestPortal','wisprPage','accountingRadius']} children={<></>} noStyle/>
        <Form.Item name={['guestPortal','wisprPage','authRadius']} children={<></>} noStyle/>
      </div>
    </Space>
  )
}
