import { Form, Space }       from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { isEmpty }           from 'lodash'
import { useIntl }           from 'react-intl'

import { PasswordInput, Select }                           from '@acx-ui/components'
import { useAaaPolicyQuery, useGetAAAPolicyTemplateQuery } from '@acx-ui/rc/services'
import { useConfigTemplate }                               from '@acx-ui/rc/utils'

const { useWatch } = Form

type VenueRadiusServiceFormProps = {
  label: string,
  fieldName: string,
  disabled?: boolean,
  options: DefaultOptionType[] | undefined,
  onRadiusChanged?: ((v: string)=> void)
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

  const { label, fieldName, disabled, options, onRadiusChanged } = props

  const radiusId = useWatch<string>(fieldName)

  const { data: radiusData } = useGetRadiusDetail(radiusId)


  const { primary: primaryRadius, secondary: secondaryRadius } = radiusData ?? {}


  const handleRadiusSelectChanged = (value: string) => {
    onRadiusChanged?.(value)
  }

  return (<>
    <Space>
      <Form.Item
        name={fieldName}
        label={label}
        rules={[
          { required: true }
        ]}
        children={<Select
          style={{ width: 210 }}
          disabled={disabled}
          options={options}
          onChange={handleRadiusSelectChanged}
        />}
      />
      {/*
      <AAAPolicyModal updateInstance={(data) => {
        setAaaDropdownItems([...aaaDropdownItems, { label: data.name, value: data.id }])
        form.setFieldValue(radiusIdName, data.id)
        form.setFieldValue(type, data)
      }}
      aaaCount={aaaDropdownItems.length}
      type={radiusType}
      forceDisableRadsec={excludeRadSec && networkType === NetworkTypeEnum.DPSK}
      />
      */}
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