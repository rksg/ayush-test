import { useContext, useEffect, useState } from 'react'

import { Form, Select, Space } from 'antd'
import { get, isEmpty }        from 'lodash'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { Tooltip, PasswordInput }                                                   from '@acx-ui/components'
import { Features, useIsSplitOn }                                                   from '@acx-ui/feature-toggle'
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
  networkType?: NetworkTypeEnum
  excludeRadSec?: boolean
}

export const AAAInstance = (props: AAAInstanceProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  const radiusType = radiusTypeMap[props.type]
  const radiusIdName = props.type + 'Id'
  const watchedRadius = Form.useWatch(props.type) || form.getFieldValue(props.type)
  const watchedRadiusId = Form.useWatch(radiusIdName) || form.getFieldValue(radiusIdName)
  const { isTemplate } = useConfigTemplate()
  const isServicePolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const enableRbac = isTemplate ? isConfigTemplateRbacEnabled : isServicePolicyRbacEnabled
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const supportRadsec = isRadsecFeatureEnabled && !isTemplate
  const primaryRadius = watchedRadius?.[AaaServerOrderEnum.PRIMARY]
  const secondaryRadius = watchedRadius?.[AaaServerOrderEnum.SECONDARY]

  const { data: aaaListQuery } = useGetAAAPolicyInstanceList({
    queryOptions: { refetchOnMountOrArgChange: 10 }
  })
  const [ getAaaPolicy ] = useLazyGetAAAPolicyInstance()

  // eslint-disable-next-line max-len
  const [ aaaDropdownItems, setAaaDropdownItems ]= useState(convertAaaListToDropdownItems(radiusType, aaaListQuery?.data))
  const { data, setData } = useContext(NetworkFormContext)

  const verifyRadSecRadius = (aaaList: AAAViewModalType[]) => {
    if (!supportRadsec) return

    const { networkType, excludeRadSec } = props
    const aaaListWithoutTls = aaaList.filter(m => m.radSecOptions?.tlsEnabled !== true)

    if (networkType === NetworkTypeEnum.PSK ||
      (networkType === NetworkTypeEnum.DPSK && radiusType === 'ACCOUNTING') ||
      excludeRadSec
    ) {
      const target = aaaListWithoutTls.find(aaa => aaa.id === watchedRadiusId)

      if (target) return

      if ((props.type === 'authRadius' && networkType === NetworkTypeEnum.PSK)
        || props.type === 'accountingRadius') {
        form.setFieldValue(props.type, null)
        form.setFieldValue(radiusIdName, '')
      }
    }
  }

  useEffect(()=>{
    if (aaaListQuery?.data) {
      setAaaDropdownItems(convertAaaListToDropdownItems(radiusType, aaaListQuery.data))
      verifyRadSecRadius(aaaListQuery.data)
    }
  },[aaaListQuery])

  useEffect(() => {
    if (!watchedRadius) return

    const currentDataAaaProfileId = data && data[props.type]?.id
    if (watchedRadius.id !== currentDataAaaProfileId) {
      setData && setData({
        ...data,
        [props.type]: watchedRadius,
        [radiusIdName]: watchedRadius.id
      })
    }

  }, [watchedRadius])

  useEffect(() => {
    if (watchedRadiusId === watchedRadius?.id) return

    if (watchedRadiusId) {
      getAaaPolicy({ params: { ...params, policyId: watchedRadiusId }, enableRbac })
        .unwrap()
        .then(aaaPolicy => form.setFieldValue(props.type, aaaPolicy))
        // eslint-disable-next-line no-console
        .catch(console.log)
    } else {
      form.setFieldValue(props.type, undefined)
    }
  }, [watchedRadiusId])

  return (
    <>
      <Form.Item label={props.serverLabel} required><Space>
        <Form.Item
          name={radiusIdName}
          noStyle
          label={props.serverLabel}
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
        <Tooltip>
          <AAAPolicyModal updateInstance={(data) => {
            setAaaDropdownItems([...aaaDropdownItems, { label: data.name, value: data.id }])
            form.setFieldValue(radiusIdName, data.id)
            form.setFieldValue(props.type, data)
          }}
          aaaCount={aaaDropdownItems.length}
          type={radiusType}
          />
        </Tooltip></Space>
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
        name={props.type}
        children={<></>}
        hidden
      />
    </>
  )
}

//export default AAAInstance

function convertAaaListToDropdownItems (
  targetRadiusType: typeof radiusTypeMap[keyof typeof radiusTypeMap],
  aaaList?: AAAViewModalType[]
) {
  // eslint-disable-next-line max-len
  return aaaList?.filter(m => m.type === targetRadiusType).map(m => ({ label: m.name, value: m.id })) ?? []
}
