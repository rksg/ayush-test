import { useContext, useEffect, useState } from 'react'

import { Form, Select, Space } from 'antd'
import { DefaultOptionType }   from 'antd/lib/select'
import { get }                 from 'lodash'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { Tooltip, PasswordInput }               from '@acx-ui/components'
import { AaaServerOrderEnum, AAAViewModalType } from '@acx-ui/rc/utils'

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
  type: 'authRadius' | 'accountingRadius'
}

export const AAAInstance = (props: AAAInstanceProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  const radiusType = radiusTypeMap[props.type]
  const radiusIdName = props.type + 'Id'
  const watchedRadius = Form.useWatch(props.type) || form.getFieldValue(props.type)
  const watchedRadiusId = Form.useWatch(radiusIdName) || form.getFieldValue(radiusIdName)

  const { data: aaaListQuery } = useGetAAAPolicyInstanceList({
    queryOptions: { refetchOnMountOrArgChange: 10 }
  })
  const [ getAaaPolicy ] = useLazyGetAAAPolicyInstance()
  // eslint-disable-next-line max-len
  const [ aaaDropdownItems, setAaaDropdownItems ]= useState(convertAaaListToDropdownItems(radiusType, aaaListQuery?.data))
  const { data, setData } = useContext(NetworkFormContext)

  useEffect(()=>{
    if (aaaListQuery?.data) {
      setAaaDropdownItems(convertAaaListToDropdownItems(radiusType, aaaListQuery.data))
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
      getAaaPolicy({ params: { ...params, policyId: watchedRadiusId } })
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
      <Form.Item label={props.serverLabel}><Space>
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
        {watchedRadius?.[AaaServerOrderEnum.PRIMARY] && <>
          <Form.Item
            label={$t(contents.aaaServerTypes[AaaServerOrderEnum.PRIMARY])}
            children={$t({ defaultMessage: '{ipAddress}:{port}' }, {
              ipAddress: get(watchedRadius, `${AaaServerOrderEnum.PRIMARY}.ip`),
              port: get(watchedRadius, `${AaaServerOrderEnum.PRIMARY}.port`)
            })} />
          <Form.Item
            label={$t({ defaultMessage: 'Shared Secret' })}
            children={<PasswordInput
              readOnly
              bordered={false}
              value={get(watchedRadius, `${AaaServerOrderEnum.PRIMARY}.sharedSecret`)}
            />}
          /></>}
        {watchedRadius?.[AaaServerOrderEnum.SECONDARY] && <>
          <Form.Item
            label={$t(contents.aaaServerTypes[AaaServerOrderEnum.SECONDARY])}
            children={$t({ defaultMessage: '{ipAddress}:{port}' }, {
              ipAddress: get(watchedRadius, `${AaaServerOrderEnum.SECONDARY}.ip`),
              port: get(watchedRadius, `${AaaServerOrderEnum.SECONDARY}.port`)
            })} />
          <Form.Item
            label={$t({ defaultMessage: 'Shared Secret' })}
            children={<PasswordInput
              readOnly
              bordered={false}
              value={get(watchedRadius, `${AaaServerOrderEnum.SECONDARY}.sharedSecret`)}
            />}
          />
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
): DefaultOptionType[] {
  // eslint-disable-next-line max-len
  return aaaList?.filter(m => m.type === targetRadiusType).map(m => ({ label: m.name, value: m.id })) ?? []
}
