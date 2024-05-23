import { Button }    from 'antd'
import { useIntl }   from 'react-intl'
import { NodeProps } from 'reactflow'




import { useWorkflowContext } from '../WorkflowPanel/WorkflowContextProvider'

import { StarterNode } from './styledComponents'


export default function StartNode (props: NodeProps) {
  const { $t } = useIntl()
  const { actionDrawerState } = useWorkflowContext()

  const onClick = () => {
    console.log('Start to add a step')
    actionDrawerState.onOpen()
  }

  return (
    <StarterNode>
      <div>
        <Button
          type={'text'}
          onClick={onClick}
        >
          {$t({ defaultMessage: 'Start building your' })}
          <br/>
          {$t({ defaultMessage: 'Onboarding Workflow' })}
        </Button>
      </div>
    </StarterNode>
  )
}
