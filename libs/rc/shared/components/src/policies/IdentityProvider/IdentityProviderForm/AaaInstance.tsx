import { useEffect, useState } from 'react'

import { Form, Select, Space } from 'antd'
import { DefaultOptionType }   from 'antd/lib/select'
import { get, isEmpty }        from 'lodash'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { PasswordInput }                                           from '@acx-ui/components'
import { Features, useIsSplitOn }                                  from '@acx-ui/feature-toggle'
import { AAAViewModalType, AaaServerOrderEnum, useConfigTemplate } from '@acx-ui/rc/utils'


import AAAPolicyModal           from '../../../NetworkForm/AAAInstance/AAAPolicyModal'
import { aaaServerTypes }       from '../../../NetworkForm/contentsMap'
import {
  useGetAAAPolicyInstanceList,
  useLazyGetAAAPolicyInstance
} from '../../AAAForm/aaaPolicyQuerySwitcher'


const radiusTypeMap: { [key:string]: string } = {
  authRadius: 'AUTHENTICATION',
  accountingRadius: 'ACCOUNTING'
} as const

type AaaInstanceProps = {
   serverLabel: string,
   type: 'authRadius' | 'accountingRadius',
   onChange?: (radiusId: string) => void
}

export const AaaInstance = (props: AaaInstanceProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()

  const { type, serverLabel } = props
  const radiusType = radiusTypeMap[type]
  const radiusIdName = type + 'Id'

  const watchedRadius = Form.useWatch(type) || form.getFieldValue(type)
  const watchedRadiusId = Form.useWatch(radiusIdName) || form.getFieldValue(radiusIdName)

  const { data: aaaListQuery } = useGetAAAPolicyInstanceList({
    queryOptions: { refetchOnMountOrArgChange: 10 }
  })
  const [ getAaaPolicy ] = useLazyGetAAAPolicyInstance()
  // eslint-disable-next-line max-len
  const [ aaaDropdownItems, setAaaDropdownItems ]= useState(convertAaaListToDropdownItems(radiusType, aaaListQuery?.data))
  const { isTemplate } = useConfigTemplate()
  const isServicePolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const enableRbac = isTemplate ? isConfigTemplateRbacEnabled : isServicePolicyRbacEnabled
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const supportRadsec = isRadsecFeatureEnabled && !isTemplate
  const primaryRadius = watchedRadius?.[AaaServerOrderEnum.PRIMARY]
  const secondaryRadius = watchedRadius?.[AaaServerOrderEnum.SECONDARY]

  useEffect(()=>{
    if (aaaListQuery?.data) {
      setAaaDropdownItems(convertAaaListToDropdownItems(radiusType, aaaListQuery.data))
    }
  },[aaaListQuery])



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
      <Form.Item label={serverLabel} required><Space>
        <Form.Item
          name={radiusIdName}
          noStyle
          label={serverLabel}
          rules={[
            { required: true }
          ]}
          initialValue={watchedRadiusId ?? ''}
          children={<Select
            style={{ width: 210 }}
            options={[
              { label: $t({ defaultMessage: 'Select RADIUS' }), value: '' },
              ...aaaDropdownItems
            ]}
          />}
        />
        <AAAPolicyModal updateInstance={(data) => {
          setAaaDropdownItems([...aaaDropdownItems, { label: data.name, value: data.id }])
          form.setFieldValue(radiusIdName, data.id)
          form.setFieldValue(props.type, data)
        }}
        aaaCount={aaaDropdownItems.length}
        type={radiusType}
        />
      </Space>
      </Form.Item>
      <div style={{ marginTop: 6, backgroundColor: 'var(--acx-neutrals-20)',
        width: 210, paddingLeft: 5 }}>
        {!isEmpty(get(watchedRadius, 'id')) && <>
          {primaryRadius &&
            <Form.Item
              label={$t(aaaServerTypes[AaaServerOrderEnum.PRIMARY])}
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
              label={$t(aaaServerTypes[AaaServerOrderEnum.SECONDARY])}
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

function convertAaaListToDropdownItems (
  targetRadiusType: typeof radiusTypeMap[keyof typeof radiusTypeMap],
  aaaList?: AAAViewModalType[]
): DefaultOptionType[] {
  // eslint-disable-next-line max-len
  return aaaList?.filter(m => m.type === targetRadiusType).map(m => ({ label: m.name, value: m.id })) ?? []
}
