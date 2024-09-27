import { useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Button, GridCol, GridRow, Loader }                                       from '@acx-ui/components'
import { useGetWorkflowStepsByIdQuery, useLazySearchInProgressWorkflowListQuery } from '@acx-ui/rc/services'
import { checkObjectNotExists, WorkflowPanelMode, WorkflowStepsEmptyCount, trailingNorLeadingSpaces }       from '@acx-ui/rc/utils'

import { WorkflowDesigner } from '../../policies/WorkflowCanvas/WorkflowDesigner'
import { WorkflowPanel }    from '../../policies/WorkflowCanvas/WorkflowPanel'

import * as UI from './styledComponents'

export function WorkflowSettingForm (props: { policyId?: string }) {
  const { $t } = useIntl()
  const { policyId } = props
  const form = Form.useFormInstance()
  const [isDesignerOpen, setIsDesignerOpen] = useState(false)
  const { data: stepsData, ...stepsState } = useGetWorkflowStepsByIdQuery({
    params: { policyId, pageSize: '1', page: '0', sort: 'id,ASC', excludeContent: 'true' }
  }, { skip: !policyId })
  const emptySteps = (stepsData?.paging?.totalCount ?? 0 ) <= WorkflowStepsEmptyCount
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

  const openWorkflowDesigner = () => {
    setIsDesignerOpen(true)
  }

  const closeWorkflowDesigner = () => {
    setIsDesignerOpen(false)
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
                { validator: (_, value) => trailingNorLeadingSpaces(value) },
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
        <GridCol col={{ span: 8 }} style={{ paddingBottom: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>
              {$t({ defaultMessage: 'Onboarding Experience' })}
            </span>
            {policyId && !emptySteps &&
              <Button
                type={'primary'}
                size={'small'}
                onClick={openWorkflowDesigner}
              >
                {$t({ defaultMessage: 'Change Flow' })}
              </Button>
            }
          </div>
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 8 }}>
          <div style={{ height: '60vh' }}>
            <Loader states={[{ ...stepsState }]}>
              {policyId && !emptySteps
                ? <WorkflowPanel workflowId={policyId} mode={WorkflowPanelMode.Edit} />
                : <UI.EmptyButton onClick={openWorkflowDesigner}>
                  {$t({ defaultMessage: 'Start designing the workflow' })}
                </UI.EmptyButton>
              }
            </Loader>
          </div>
        </GridCol>
      </GridRow>

      {(isDesignerOpen && policyId) &&
        <WorkflowDesigner
          workflowId={policyId}
          onClose={closeWorkflowDesigner}
        />
      }
    </>)
}
