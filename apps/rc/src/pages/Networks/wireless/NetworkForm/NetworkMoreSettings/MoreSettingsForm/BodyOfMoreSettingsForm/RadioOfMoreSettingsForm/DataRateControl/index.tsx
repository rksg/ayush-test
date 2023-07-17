import React from 'react'

import { Form, FormInstance, Select } from 'antd'
import { useIntl }                    from 'react-intl'

import * as UI from '../../../../styledComponents'

const { Option } = Select

enum BssMinRateEnum {
  VALUE_NONE = 'default',
  VALUE_1 = '1',
  VALUE_2 = '2',
  VALUE_5_5 = '5.5',
  VALUE_12 = '12',
  VALUE_24 = '24'
}

enum MgmtTxRateEnum {
  VALUE_1 = '1',
  VALUE_2 = '2',
  VALUE_5_5 = '5.5',
  VALUE_6 = '6',
  VALUE_9 = '9',
  VALUE_11 = '11',
  VALUE_12 = '12',
  VALUE_18 = '18',
  VALUE_24 = '24'
}


interface DataRateControlProps {
  form: FormInstance
  enableOfdmOnly: boolean
  bssMinimumPhyRate: string
}

export function DataRateControl (props: DataRateControlProps) {
  const { $t } = useIntl()

  const onBbsMinRateChange = function (value: BssMinRateEnum) {
    if (value === BssMinRateEnum.VALUE_NONE) {
      const managementFrameMinimumPhyRate =
        props.enableOfdmOnly ? MgmtTxRateEnum.VALUE_6 : MgmtTxRateEnum.VALUE_2
      props.form.setFieldsValue(managementFrameMinimumPhyRate)
    } else {
      props.form.setFieldsValue({ managementFrameMinimumPhyRate: value })
    }
  }


  return (
    <>
      <UI.Subtitle>
        {$t({ defaultMessage: 'Data Rate Control (2.4 GHz & 5 GHz)' })}
      </UI.Subtitle>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          columnGap: '20px'
        }}
      >
        <Form.Item
          name='bssMinimumPhyRate'
          label={$t({ defaultMessage: 'BSS Min Rate:' })}
          style={{ marginBottom: '15px' }}
          children={
            <Select
              onChange={onBbsMinRateChange}
              defaultValue={BssMinRateEnum.VALUE_NONE}
              style={{ width: '150px' }}
            >
              <Option value={BssMinRateEnum.VALUE_NONE}>
                {$t({ defaultMessage: 'None' })}
              </Option>
              {!props.enableOfdmOnly && (
                <>
                  <Option value={BssMinRateEnum.VALUE_1}>
                    {$t({ defaultMessage: '1 Mbps' })}
                  </Option>
                  <Option value={BssMinRateEnum.VALUE_2}>
                    {$t({ defaultMessage: '2 Mbps' })}
                  </Option>
                  <Option value={BssMinRateEnum.VALUE_5_5}>
                    {$t({ defaultMessage: '5.5 Mbps' })}
                  </Option>
                </>
              )}
              <Option value={BssMinRateEnum.VALUE_12}>
                {$t({ defaultMessage: '12 Mbps' })}
              </Option>
              <Option value={BssMinRateEnum.VALUE_24}>
                {$t({ defaultMessage: '24 Mbps' })}
              </Option>
            </Select>
          }
        />

        <Form.Item
          name='managementFrameMinimumPhyRate'
          label={$t({ defaultMessage: 'Mgmt Tx Rate:' })}
          style={{ marginBottom: '15px' }}
          children={
            <Select
              data-testid='mgmtTxRateSelect'
              disabled={
                props.enableOfdmOnly || props.bssMinimumPhyRate !== BssMinRateEnum.VALUE_NONE
              }
              defaultValue={MgmtTxRateEnum.VALUE_6}
              style={{ width: '150px' }}
            >
              <Option value={MgmtTxRateEnum.VALUE_1}>
                {$t({ defaultMessage: '1 Mbps' })}
              </Option>
              <Option value={MgmtTxRateEnum.VALUE_2}>
                {$t({ defaultMessage: '2 Mbps' })}
              </Option>
              <Option value={MgmtTxRateEnum.VALUE_5_5}>
                {$t({ defaultMessage: '5.5 Mbps' })}
              </Option>
              <Option value={MgmtTxRateEnum.VALUE_6}>
                {$t({ defaultMessage: '6 Mbps' })}
              </Option>
              <Option value={MgmtTxRateEnum.VALUE_9}>
                {$t({ defaultMessage: '9 Mbps' })}
              </Option>
              <Option value={MgmtTxRateEnum.VALUE_11}>
                {$t({ defaultMessage: '11 Mbps' })}
              </Option>
              <Option value={MgmtTxRateEnum.VALUE_12}>
                {$t({ defaultMessage: '12 Mbps' })}
              </Option>
              <Option value={MgmtTxRateEnum.VALUE_18}>
                {$t({ defaultMessage: '18 Mbps' })}
              </Option>
              <Option value={MgmtTxRateEnum.VALUE_24}>
                {$t({ defaultMessage: '24 Mbps' })}
              </Option>
            </Select>
          }
        />
      </div>
    </>
  )
}

export default DataRateControl