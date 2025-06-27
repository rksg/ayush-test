import { useState } from 'react'

import { Form, Space }       from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { isEmpty }           from 'lodash'
import { useIntl }           from 'react-intl'

import { Button, PasswordInput, Select }                   from '@acx-ui/components'
import { useAaaPolicyQuery, useGetAAAPolicyTemplateQuery } from '@acx-ui/rc/services'
import {
  AAA_LIMIT_NUMBER,
  PolicyOperation,
  PolicyType,
  useConfigTemplate,
  useTemplateAwarePolicyPermission
} from '@acx-ui/rc/utils'

import { VenueRadiusServiceDrawer } from './VenueRadiusServiceDrawer'

const { useWatch } = Form

type VenueRadiusServiceFormProps = {
  label: string,
  fieldName: string,
  type: string,
  disabled?: boolean,
  options: DefaultOptionType[] | undefined,
  radiusTotalCount: number,
  onRadiusChanged?: ((v: string)=> void),
  onRadiusCreated?: ((v: string)=> void)
}

const useGetRadiusDetail = (radiusId: string | undefined) => {
  const { isTemplate } = useConfigTemplate()

  const getRadiusPolicy = useAaaPolicyQuery({
    params: { policyId: radiusId },
    enableRbac: true
  }, { skip: !radiusId || isTemplate })

  const getRadiusTemplatePolicy = useGetAAAPolicyTemplateQuery({
    params: { policyId: radiusId },
    enableRbac: true
  }, { skip: !radiusId || !isTemplate })

  return isTemplate? getRadiusTemplatePolicy : getRadiusPolicy

}

export const VenueRadiusServiceForm = (props: VenueRadiusServiceFormProps) => {
  const { $t } = useIntl()

  const { label, fieldName, type,
    options, radiusTotalCount, disabled,
    onRadiusChanged, onRadiusCreated } = props

  const [ drawerVisible, setDrawerVisible ] = useState(false)

  const radiusId = useWatch<string>(fieldName)

  const { data: radiusData } = useGetRadiusDetail(radiusId)

  const { primary: primaryRadius, secondary: secondaryRadius } = radiusData ?? {}

  const handleRadiusSelectChanged = (value: string) => {
    onRadiusChanged?.(value)
  }

  const handleDrawerClose = () => {
    setDrawerVisible(false)
  }

  // eslint-disable-next-line max-len
  const hasAddRadiusPermission = useTemplateAwarePolicyPermission(PolicyType.AAA, PolicyOperation.CREATE)

  return (<>
    <Space>
      <Form.Item
        name={fieldName}
        label={label}
        rules={[{ required: true }]}
        children={<Select
          style={{ width: 210 }}
          disabled={disabled}
          options={options}
          onChange={handleRadiusSelectChanged}
        />}
      />
      {hasAddRadiusPermission && <>
        <Button type='link'
          onClick={()=>setDrawerVisible(true)}
          disabled={radiusTotalCount>=AAA_LIMIT_NUMBER || disabled}>
          {$t({ defaultMessage: 'Add Server' })}
        </Button>
        <VenueRadiusServiceDrawer
          visible={drawerVisible}
          type={type}
          onClose={handleDrawerClose}
          updateInstance={(data) => {
            onRadiusCreated?.(data.id!)
          }}
        />
      </>}
    </Space>
    <div style={{
      marginTop: 6,
      marginBottom: 20,
      backgroundColor: 'var(--acx-neutrals-20)',
      width: 210,
      paddingLeft: 5
    }}>
      {!isEmpty(radiusId) && <>
        {primaryRadius && <>
          <Form.Item
            label={$t({ defaultMessage: 'Primary Server' })}
            children={`${primaryRadius.ip}:${primaryRadius.port}`}
          />
          <Form.Item
            label={$t({ defaultMessage: 'Shared Secret' })}
            children={<PasswordInput
              readOnly
              bordered={false}
              value={primaryRadius.sharedSecret}
            />}
          />
        </>}
        {secondaryRadius && <>
          <Form.Item
            label={$t({ defaultMessage: 'Secondary Server' })}
            children={`${secondaryRadius.ip}:${secondaryRadius.port}`}
          />
          <Form.Item
            label={$t({ defaultMessage: 'Shared Secret' })}
            children={<PasswordInput
              readOnly
              bordered={false}
              value={secondaryRadius.sharedSecret}
            />}
          />
        </>}
      </>}
    </div>
  </>)
}