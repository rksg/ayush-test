

import { Form, Input, Space } from 'antd'
import TextArea               from 'antd/lib/input/TextArea'
import { useIntl }            from 'react-intl'

import { GridCol,GridRow }                   from '@acx-ui/components'
import {
  useLazySearchInProgressWorkflowListQuery
} from '@acx-ui/rc/services'
import {
  Workflow,
  checkObjectNotExists,
  trailingNorLeadingSpaces } from '@acx-ui/rc/utils'


export interface WorkflowFormField extends Workflow {
  workflowValid: boolean
}

export function WorkflowForm (props: {
  policyId?: string,
  isEdit: boolean
}) {
  const { $t } = useIntl()
  const { policyId, isEdit } = props
  const [searchWorkflowList] = useLazySearchInProgressWorkflowListQuery()
  const nameValidator = async (name: string) => {
    try {
      const list = (await searchWorkflowList({
        payload: { filters: { name: name }, pageSize: '2000', page: '1' },
        params: { excludeContent: 'false' }
      }, true)
        .unwrap()).data.filter(g => g.id !== policyId ?? '')
        .map(g => ({ name: g.name }))
      return checkObjectNotExists(list, { name } , $t({ defaultMessage: 'Workflow' }))
    } catch (e) {
      return Promise.resolve()
    }
  }



  return (
    <GridRow>
      <GridCol col={isEdit ? { span: 20 } : { span: 8 }}>
        <Space direction='vertical'>
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
                { validator: (_, value) => trailingNorLeadingSpaces(value) },
                { validator: (_, value) => nameValidator(value) }
              ]
            }
            hasFeedback
            children={<Input/>}
            extra={
              // eslint-disable-next-line max-len
              !isEdit ? $t({ defaultMessage: 'Entering a name and clicking the Next button, automatically creates a draft version of your workflow.' }): undefined
            }
          />
          <Form.Item
            name='description'
            label={$t({ defaultMessage: 'Description' })}
            children={<TextArea rows={5} />}
            rules={[
              { max: 255 }
            ]}
          />
        </Space>
      </GridCol>
    </GridRow>
  )
}
