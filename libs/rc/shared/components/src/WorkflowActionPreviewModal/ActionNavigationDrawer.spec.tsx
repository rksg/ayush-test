import { Path } from 'react-router-dom'
import {
  Node
} from 'reactflow'

import { ActionType, WorkflowStep } from '@acx-ui/rc/utils'
import { Provider }                 from '@acx-ui/store'
import { render, screen }           from '@acx-ui/test-utils'

import { ActionNavigationDrawer } from './ActionNavigationDrawer'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

const nodes : Node<WorkflowStep, ActionType>[] = [
  {
    id: 'id1',
    type: ActionType.AUP,
    data: {
      id: 'id1',
      enrollmentActionId: 'actionId1',
      actionType: ActionType.AUP
    },
    position: {
      x: 0,
      y: 0
    }
  },
  {
    id: 'id2',
    type: ActionType.DISPLAY_MESSAGE,
    data: {
      id: 'id2',
      enrollmentActionId: 'actionId2',
      actionType: ActionType.DISPLAY_MESSAGE
    },
    position: {
      x: 0,
      y: 0
    }
  },
  {
    id: 'id3',
    type: ActionType.DATA_PROMPT,
    data: {
      id: 'id3',
      enrollmentActionId: 'actionId3',
      actionType: ActionType.DATA_PROMPT
    },
    position: {
      x: 0,
      y: 0
    }
  }
]

describe('Action Navigation Drawer', () => {
  const params = { tenantId: 't1', policyId: 'id' }

  it('should render correctly', async () => {
    render(<Provider>
      <div id='actiondemocontent'></div>
      <ActionNavigationDrawer visible={true} onClose={()=>{}} nodes={nodes} onSelect={()=>{}} />
    </Provider>, {
      route: { params }
    })

    await screen.findByText('Preview Navigator')
    await screen.findByText('Acceptable Use Policy (AUP)')
    await screen.findByText('Display a Form')
    await screen.findByText('Custom Message')
  })
})