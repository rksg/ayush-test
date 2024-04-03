import { Button }    from 'antd'
import { NodeProps } from 'reactflow'


import { useWorkflowContext } from '../WorkflowPanel'

import { StarterNode } from './styledComponents'


export default function StartActionNode (props: NodeProps) {
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
          {'Click Me to Start'}
        </Button>
      </div>
    </StarterNode>
  )
}
