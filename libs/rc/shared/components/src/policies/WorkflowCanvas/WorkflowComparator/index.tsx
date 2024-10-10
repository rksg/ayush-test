import { useEffect, useState } from 'react'

import { Space, Typography }                                      from 'antd'
import moment                                                     from 'moment'
import { useIntl }                                                from 'react-intl'
import { Panel, ReactFlowProvider, useEdgesState, useNodesState } from 'reactflow'

import { Button, GridCol, GridRow, Loader }                      from '@acx-ui/components'
import { DateFormatEnum, userDateTimeFormat }                    from '@acx-ui/formatter'
import { useGetWorkflowStepsByIdQuery, useGetWorkflowByIdQuery } from '@acx-ui/rc/services'
import { toReactFlowData, Workflow, WorkflowPanelMode }          from '@acx-ui/rc/utils'

import WorkflowCanvas from '../WorkflowPanel/WorkflowCanvas'

import * as UI from './styledComponents'
interface WorkflowComparatorProps {
  draftWorkflowId: string
  publishedWorkflowId: string,
  onClose: () => void
}

function ComparatorDivision (props: { data: Workflow }) {
  const { data } = props
  const [nodes, setNodes] = useNodesState([])
  const [edges, setEdges] = useEdgesState([])
  const { $t } = useIntl()
  const { Title, Text } = Typography
  const { data: stepsData, ...stepQuery } = useGetWorkflowStepsByIdQuery({
    params: { policyId: data.id, pageSize: '1000', page: '0', sort: 'id,ASC' }
  })


  useEffect(() => {
    if (!stepsData?.content ) return

    const {
      nodes: inputNodes,
      edges: inputEdges
    } = toReactFlowData(stepsData?.content, WorkflowPanelMode.Default)
    setNodes(inputNodes)
    setEdges(inputEdges)
  }, [stepsData])

  const panelContent = data.publishedDetails?.publishedDate ?
    <div>
      <div>{<Title level={3}>{$t({ defaultMessage: 'Published' })}</Title>}</div>
      <div>{
        // eslint-disable-next-line max-len
        <Text>{$t({ defaultMessage: 'Current version, published on {publishDate}' }, { publishDate: moment(data.publishedDetails?.publishedDate).format(userDateTimeFormat(DateFormatEnum.DateFormat)) })}</Text>}
      </div>
    </div>
    : <div>
      <div>{<Title level={3}>{$t({ defaultMessage: 'Modified' })}</Title>}</div>
      <div>{<Text>{$t({ defaultMessage: 'Latest version' })}</Text>}</div>
    </div>

  return (<Loader states={[stepQuery]}>
    <ReactFlowProvider>
      <WorkflowCanvas
        initialNodes={nodes}
        initialEdges={edges}
        mode={WorkflowPanelMode.Custom}
        customPanel={<Panel
          position='top-center'
          style={{ textAlign: 'center' }}>
          {panelContent}
        </Panel>}
      />
    </ReactFlowProvider>
  </Loader>)
}


export function WorkflowComparator (props: WorkflowComparatorProps) {
  const { $t } = useIntl()
  const { draftWorkflowId, publishedWorkflowId, onClose } = props
  const draftQuery = useGetWorkflowByIdQuery({ params: { id: draftWorkflowId } })
  const publishedQuery = useGetWorkflowByIdQuery({ params: { id: publishedWorkflowId } })
  const [draftData, setDraftData] = useState<Workflow>()
  const [publishedData, setPublishedData] = useState<Workflow>()
  useEffect(()=>{
    if (draftQuery.isLoading || !draftQuery.data) return
    setDraftData(draftQuery.data)
  }, [draftQuery.isLoading, draftQuery.data])

  useEffect(()=>{
    if ( publishedQuery.isLoading ||!publishedQuery.data) return
    setPublishedData(publishedQuery.data)
  }, [publishedQuery.isLoading, publishedQuery.data])


  const title =
    <UI.WorkflowComparatorHeader>
      {draftData?.name}
      <Space direction={'horizontal'}>
        <Button
          type={'default'}
          onClick={onClose}
        >
          {$t({ defaultMessage: 'Close' })}
        </Button>
      </Space>
    </UI.WorkflowComparatorHeader>

  return (
    <Loader states={[{ isLoading: draftQuery.isLoading || publishedQuery.isLoading }]}>
      <UI.Drawer
        destroyOnClose
        visible
        title={title}
        width={'100vw'}
        push={false}
        closable={false}
        onClose={(e) => e && onClose()}
      >
        <GridRow style={{ minHeight: '800px' }}>
          <GridCol col={{ span: 12 }} style={{ backgroundColor: '#eeeeee' }}>
            {draftData && <ComparatorDivision data={draftData}/>}
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ backgroundColor: '#eeeeee' }}>
            {publishedData && <ComparatorDivision data={publishedData}/>}
          </GridCol>
        </GridRow>
      </UI.Drawer>
    </Loader>
  )
}