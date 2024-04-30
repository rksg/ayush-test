import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { GridCol, GridRow }                         from '@acx-ui/components'
import { useLazySearchInProgressWorkflowListQuery } from '@acx-ui/rc/services'
import {  checkObjectNotExists }                    from '@acx-ui/rc/utils'



export function WorkflowSettingForm () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const [searchWorkflowList] = useLazySearchInProgressWorkflowListQuery()
  const nameValidator = async (name: string) => {
    try {
      const list = (await searchWorkflowList({
        payload: { filters: { name: name }, pageSize: '2000', page: '1' },
        params: { excludeContent: 'false' }
      }, true)
        .unwrap()).data.filter(g => g.id !== form.getFieldValue('id') ?? '')
        .map(g => ({ name: g.name }))
      return checkObjectNotExists(list, { name } , $t({ defaultMessage: 'Workflow' }))
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
            label={$t({ defaultMessage: 'Workflow Name' })}
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
          <Form.Item
            name={''}
            label={$t({ defaultMessage: 'Onboarding Experience' })}
            validateFirst
            validateTrigger={['onBlur']}
            hasFeedback
            //children={<Input/>}
          />
        </GridCol>
      </GridRow>
    </>)
}