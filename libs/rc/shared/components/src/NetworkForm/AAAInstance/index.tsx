import { useContext, useEffect, useState } from 'react'

import { Form, Select, Space } from 'antd'
import { get, isEmpty }        from 'lodash'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { Tooltip, PasswordInput }                                                   from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }                   from '@acx-ui/feature-toggle'
import { AaaServerOrderEnum, AAAViewModalType, NetworkTypeEnum, useConfigTemplate } from '@acx-ui/rc/utils'

import { useLazyGetAAAPolicyInstance, useGetAAAPolicyInstanceList } from '../../policies/AAAForm/aaaPolicyQuerySwitcher'
import * as contents                                                from '../contentsMap'
import NetworkFormContext                                           from '../NetworkFormContext'

import AAAPolicyModal from './AAAPolicyModal'

const radiusTypeMap: { [key:string]: string } = {
  authRadius: 'AUTHENTICATION',
  accountingRadius: 'ACCOUNTING'
} as const

interface AAAInstanceProps {
  serverLabel: string
  type: 'authRadius' | 'accountingRadius',
  networkType?: NetworkTypeEnum,
  excludeRadSec?: boolean
}

export const AAAInstance = (props: AAAInstanceProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  const { serverLabel, type, networkType, excludeRadSec = false } = props
  const radiusType = radiusTypeMap[type]
  const radiusIdName = type + 'Id'
  const watchedRadius = Form.useWatch(type) || form.getFieldValue(type)
  const watchedRadiusId = Form.useWatch(radiusIdName) || form.getFieldValue(radiusIdName)
  const { isTemplate } = useConfigTemplate()
  const isServicePolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const enableRbac = isTemplate ? isConfigTemplateRbacEnabled : isServicePolicyRbacEnabled
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const supportRadsec = isRadsecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate
  const primaryRadius = watchedRadius?.[AaaServerOrderEnum.PRIMARY]
  const secondaryRadius = watchedRadius?.[AaaServerOrderEnum.SECONDARY]

  const { data: aaaListQuery } = useGetAAAPolicyInstanceList({
    queryOptions: { refetchOnMountOrArgChange: 10 }
  })
  const [ getAaaPolicy ] = useLazyGetAAAPolicyInstance()
  const isRadSecRadius = canFindRadSecItem(aaaListQuery?.data, form.getFieldValue(radiusIdName))

  const shouldExcludeRadSec = (): boolean => {
    return supportRadsec && excludeRadSec
  }
  const convertAaaListToDropdownItems = (
    targetRadiusType: typeof radiusTypeMap[keyof typeof radiusTypeMap],
    aaaList?: AAAViewModalType[]
  ) => {
    if (!aaaList) return []

    return aaaList
      .filter(aaa => aaa.type === targetRadiusType)
      .filter(aaa => {
        if (shouldExcludeRadSec()) return !aaa.radSecOptions?.tlsEnabled
        return true
      })
      .map(m => ({ label: m.name, value: m.id }))
  }

  // eslint-disable-next-line max-len
  const [ aaaDropdownItems, setAaaDropdownItems ]= useState(convertAaaListToDropdownItems(radiusType, aaaListQuery?.data))
  const { data, setData } = useContext(NetworkFormContext)

  useEffect(()=>{
    if (aaaListQuery?.data) {
      setAaaDropdownItems(convertAaaListToDropdownItems(radiusType, aaaListQuery.data))
    }
  },[aaaListQuery, props.excludeRadSec])

  useEffect(()=>{
    if(aaaDropdownItems.length > 0 &&
      !aaaDropdownItems.find(m => m.value === form.getFieldValue(radiusIdName)) ){
      form.setFieldValue(radiusIdName, '')
    }
  },[aaaDropdownItems])

  useEffect(() => {
    if (shouldExcludeRadSec() && isRadSecRadius) {
      form.setFieldValue(type, null)
      form.setFieldValue(radiusIdName, '')
      setData && setData({
        ...data,
        [type]: null,
        [radiusIdName]: ''
      })
    }
  }, [isRadSecRadius])

  useEffect(() => {
    if (!watchedRadius) return

    const currentDataAaaProfileId = data && data[type]?.id
    if (watchedRadius.id !== currentDataAaaProfileId) {
      setData && setData({
        ...data,
        [type]: watchedRadius,
        [radiusIdName]: watchedRadius.id
      })
    }

  }, [watchedRadius])

  useEffect(() => {
    if (watchedRadiusId === watchedRadius?.id) return

    if (watchedRadiusId) {
      getAaaPolicy({ params: { ...params, policyId: watchedRadiusId }, enableRbac })
        .unwrap()
        .then(aaaPolicy => form.setFieldValue(type, aaaPolicy))
        // eslint-disable-next-line no-console
        .catch(console.log)
    } else {
      form.setFieldValue(type, undefined)
    }
  }, [watchedRadiusId])
  return (
    <>
      <Form.Item
        label={<>
          {serverLabel}
          {excludeRadSec && networkType === NetworkTypeEnum.DPSK && type === 'authRadius' &&
          <Tooltip.Question
            title={
              'For a DPSK network with WPA2/WPA3 mixed mode,'+
              ' only Cloudpath RADIUS server configured in non-proxy mode is supported.'
            }
            placement='bottom'
          />}
        </>
        }
        required
      >
        <Space>
          <Form.Item
            name={radiusIdName}
            noStyle
            rules={[
              { required: true }
            ]}
            initialValue={watchedRadiusId ?? ''}
            children={<Select
              style={{ width: 210 }}
              showSearch
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
              options={[
                { label: $t({ defaultMessage: 'Select RADIUS' }), value: '' },
                ...aaaDropdownItems
              ]}
            />}
          />
          <AAAPolicyModal updateInstance={(data) => {
            setAaaDropdownItems([...aaaDropdownItems, { label: data.name, value: data.id }])
            form.setFieldValue(radiusIdName, data.id)
            form.setFieldValue(type, data)
          }}
          aaaCount={aaaDropdownItems.length}
          type={radiusType}
          forceDisableRadsec={excludeRadSec && networkType === NetworkTypeEnum.DPSK}
          />
        </Space>
      </Form.Item>
      <div style={{ marginTop: 6, backgroundColor: 'var(--acx-neutrals-20)',
        width: 210, paddingLeft: 5 }}>
        {!isEmpty(get(watchedRadius, 'id')) && <>
          {primaryRadius &&
            <Form.Item
              label={$t(contents.aaaServerTypes[AaaServerOrderEnum.PRIMARY])}
              children={$t({ defaultMessage: '{ipAddress}:{port}' }, {
                ipAddress: get(watchedRadius, `${AaaServerOrderEnum.PRIMARY}.ip`),
                port: get(watchedRadius, `${AaaServerOrderEnum.PRIMARY}.port`)
              })} />}
          {primaryRadius && !get(watchedRadius, 'radSecOptions.tlsEnabled') &&
            <Form.Item
              label={$t({ defaultMessage: 'Shared Secret' })}
              children={<PasswordInput
                readOnly
                bordered={false}
                value={get(watchedRadius, `${AaaServerOrderEnum.PRIMARY}.sharedSecret`)}
              />}
            />}
          {secondaryRadius &&
            <Form.Item
              label={$t(contents.aaaServerTypes[AaaServerOrderEnum.SECONDARY])}
              children={$t({ defaultMessage: '{ipAddress}:{port}' }, {
                ipAddress: get(watchedRadius, `${AaaServerOrderEnum.SECONDARY}.ip`),
                port: get(watchedRadius, `${AaaServerOrderEnum.SECONDARY}.port`)
              })} />}
          {secondaryRadius && !get(watchedRadius, 'radSecOptions.tlsEnabled') &&
            <Form.Item
              label={$t({ defaultMessage: 'Shared Secret' })}
              children={<PasswordInput
                readOnly
                bordered={false}
                value={get(watchedRadius, `${AaaServerOrderEnum.SECONDARY}.sharedSecret`)}
              />}
            />}
          {supportRadsec &&
            <Form.Item
              label={$t({ defaultMessage: 'RadSec' })}
              children={$t({ defaultMessage: '{tlsEnabled}' }, {
                tlsEnabled: get(watchedRadius, 'radSecOptions.tlsEnabled') ? 'On' : 'Off'
              })}
            />}
        </>}
      </div>
      <Form.Item
        name={type}
        children={<></>}
        hidden
      />
    </>
  )
}

//export default AAAInstance

function canFindRadSecItem (aaaList?: AAAViewModalType[], targetRadiusId?: string): boolean {
  if (!aaaList || !targetRadiusId) return false
  return !!aaaList?.find(aaa => aaa.id === targetRadiusId && aaa.radSecOptions?.tlsEnabled)
}
