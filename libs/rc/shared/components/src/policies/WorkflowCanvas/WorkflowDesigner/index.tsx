import { useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Button }                                                  from '@acx-ui/components'
import { BrushSolid, EyeOpenOutlined, EyeOpenSolid }               from '@acx-ui/icons'
import { useGetWorkflowStepsByIdQuery }                            from '@acx-ui/rc/services'
import { WorkflowPanelMode, InitialEmptyStepsCount, WorkflowUrls } from '@acx-ui/rc/utils'
import { hasAllowedOperations }                                    from '@acx-ui/user'
import { getOpsApi }                                               from '@acx-ui/utils'

import { EnrollmentPortalDesignModal } from '../../../EnrollmentPortalDesignModal'
import { WorkflowActionPreviewModal }  from '../../../WorkflowActionPreviewModal'
import { PanelType, WorkflowPanel }    from '../WorkflowPanel'

import * as UI from './styledComponents'

interface WorkflowDesignerProps {
  workflowId: string,
  onClose: () => void
}

export function WorkflowDesigner (props: WorkflowDesignerProps) {
  const { $t } = useIntl()
  const { workflowId, onClose } = props
  const [isPortalVisible, setIsPortalVisible] = useState(false)
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)

  const { data: stepsData } = useGetWorkflowStepsByIdQuery({
    params: {
      policyId: workflowId, pageSize: '1', page: '0', sort: 'id,ASC', excludeContent: 'true'
    }
  })
  const emptySteps = (stepsData?.paging?.totalCount ?? 0 ) <= InitialEmptyStepsCount

  const title =
    <UI.WorkflowDesignerHeader>
      {$t({ defaultMessage: 'Workflow Designer' })}
      <Space direction={'horizontal'}>
        <Button
          rbacOpsIds={[getOpsApi(WorkflowUrls.updateWorkflowUIConfig)]}
          disabled={!hasAllowedOperations([getOpsApi(WorkflowUrls.updateWorkflowUIConfig)])}
          icon={<BrushSolid/>}
          onClick={() => setIsPortalVisible(true)}
        >
          {$t({ defaultMessage: 'Portal Look & Feel' })}
        </Button>
        <Button
          icon={emptySteps ? <EyeOpenOutlined/> : <EyeOpenSolid/>}
          disabled={emptySteps}
          onClick={() => setIsPreviewVisible(true)}
        >
          {$t({ defaultMessage: 'Preview' })}
        </Button>
        <Button
          type={'primary'}
          onClick={onClose}
        >
          {$t({ defaultMessage: 'Close' })}
        </Button>
      </Space>
    </UI.WorkflowDesignerHeader>

  return (<>
    <UI.Drawer
      visible
      title={title}
      width={'100vw'}
      push={false}
      closable={false}
      onClose={(e) => e && onClose()}
    >
      <WorkflowPanel
        workflowId={workflowId}
        type={PanelType.NoCard}
        mode={WorkflowPanelMode.Design}
      />
    </UI.Drawer>

    {(isPortalVisible && workflowId) &&
      <EnrollmentPortalDesignModal
        id={workflowId}
        onFinish={() => setIsPortalVisible(false)}
      />
    }

    {(isPreviewVisible && workflowId) &&
      <WorkflowActionPreviewModal
        workflowId={workflowId}
        onClose={() => setIsPreviewVisible(false)}
      />
    }
  </>
  )
}
