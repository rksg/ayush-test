import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { Drawer, Select }                                               from '@acx-ui/components'
import { useGetAllActionsByTypeQuery, useGetSplitOptionsByStepIdQuery } from '@acx-ui/rc/services'
import { ActionType }                                                   from '@acx-ui/rc/utils'

const defaultActionTypePagination = {
  pageSize: '1000',
  page: '0',
  sort: 'name,asc'
}

interface SplitStepDrawerProps {
  visible: boolean,
  onClose: () => void,
  workflowId: string,
  stepId?: string,
  isEdit: boolean
}

export default function SplitStepDrawer (props: SplitStepDrawerProps) {
  const { $t } = useIntl()
  const { visible, onClose, workflowId: serviceId, stepId } = props
  const { data } = useGetSplitOptionsByStepIdQuery({
    params: { serviceId, stepId }
  }, { skip: !serviceId || !stepId })

  const actions = useGetAllActionsByTypeQuery({
    params: {
      actionType: ActionType.USER_SELECTION_SPLIT.toString(),
      ...defaultActionTypePagination
    }
  })

  // console.log('Options: ', data?.content)
  // console.log('Actions: ', actions.data?.content)

  return (
    <Drawer
      visible={false}
      width={600}
      title={$t({ defaultMessage: 'Edit Split Step' })}
    >
      <Select
        options={actions.data?.content?.map(action => ({
          label: action.name,
          value: action.actionId
        }))}
      />
      {data?.content?.map((option, index) => {
        return (
          <Row key={index}>
            <Col>
              <Form.Item
                name={index}
              >
                <>
                  <div>{option.optionName}</div>
                  <div>{option.enrollmentActionId}</div>
                </>
              </Form.Item>
            </Col>
          </Row>
        )
      })}
    </Drawer>
  )
}
