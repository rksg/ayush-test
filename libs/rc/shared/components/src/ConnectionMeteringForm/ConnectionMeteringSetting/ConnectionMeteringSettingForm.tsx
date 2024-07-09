import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { GridCol, GridRow }                         from '@acx-ui/components'
import { useLazySearchConnectionMeteringListQuery } from '@acx-ui/rc/services'
import {  checkObjectNotExists }                    from '@acx-ui/rc/utils'

import { DataConsumptionSettingForm } from './DataConsumptionSettingForm'
import { DataRateSettingForm }        from './DataRateSettingForm'



export function ConnectionMeteringSettingForm () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const [searchConnectionMeteringList] = useLazySearchConnectionMeteringListQuery()
  const nameValidator = async (name: string) => {
    try {
      const list = (await searchConnectionMeteringList({
        payload: { keyword: name, pageSize: '2147483647', page: '1' }
      }, true)
        .unwrap()).data.filter(g => g.id !== form.getFieldValue('id') ?? '')
        .map(g => ({ name: g.name }))
      return checkObjectNotExists(list, { name } , $t({ defaultMessage: 'Data Usage Metering' }))
    } catch (e) {
      return Promise.resolve()
    }
  }

  return (
    <>
      <GridRow>
        <GridCol col={{ span: 8 }}>
          <Form.Item
            name={'name'}
            label={$t({ defaultMessage: 'Profile Name' })}
            validateFirst
            validateTrigger={['onBlur']}
            rules={
              [
                { required: true },
                { min: 2 },
                { max: 64 },
                { validator: (_, value) => nameValidator(value) }
              ]
            }
            hasFeedback
            initialValue={form.getFieldValue('name')}
            children={<Input/>}
          />
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 7 }}>
          <DataRateSettingForm/>
        </GridCol>
      </GridRow>
      <GridRow style={{ marginTop: '10px' }}>
        <GridCol col={{ span: 6 }}>
          <DataConsumptionSettingForm/>
        </GridCol>
      </GridRow>
    </>)
}