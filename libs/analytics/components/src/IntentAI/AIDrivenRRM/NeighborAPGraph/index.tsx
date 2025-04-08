import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Card, nodeTypes, Drawer, DrawerTypes, Loader, NeighborAPGraph as NeighborAPGraphComponent, ProcessedCloudRRMGraph } from '@acx-ui/components'

import { useIntentContext }     from '../../IntentContext'
import { GraphTitle }           from '../RRMGraph'
import { Legend }               from '../RRMGraph/Legend'
import { useIntentAICRRMQuery } from '../RRMGraph/services'
import * as UI                  from '../RRMGraph/styledComponents'

export function DataGraph (props: {
  graphs: ProcessedCloudRRMGraph[],
  width: number,
  zoom: number
}) {
  const nodes = { nonInterfering: 12, interfering: 9, rogue: 5 }
  const nodeSize = {
    max: 120,
    min: 50
  }

  if (!props.graphs?.length) return null

  return <>
    <div style={{
      margin: 'auto',
      zoom: props.zoom
    }}>
      <NeighborAPGraphComponent
        title=''
        nodeSize={nodeSize}
        nodes={nodes}
        width={props.width}
        height={400}
        backgroundColor='transparent'
      />
    </div>
    <UI.CrrmArrow children={<UI.RightArrow/>} />
    <div style={{
      margin: 'auto',
      zoom: props.zoom
    }}>
      <NeighborAPGraphComponent
        title=''
        nodeSize={nodeSize}
        nodes={nodes}
        width={props.width}
        height={400}
        backgroundColor='transparent'
      />
    </div>
  </>
}

export const NeighborAPGraph = ({
  width = 300
}: {
  width?: number
}) => {
  const { $t } = useIntl()
  const { intent, state } = useIntentContext()
  const [ visible, setVisible ] = useState<boolean>(false)
  const [ key, setKey ] = useState(0)

  const showDrawer = () => setVisible(true)
  const closeDrawer = () => setVisible(false)
  useEffect(() => setKey(Math.random()), [visible])

  const queryResult = useIntentAICRRMQuery()
  const crrmData = queryResult.data!
  const title = $t({ defaultMessage: 'Neighbor AP Graph' })
  const noData = state === 'no-data'

  const entries = Object.entries(nodeTypes)
  const [, ...rest] = entries
  const trimmed = Object.fromEntries(rest)

  return <UI.Wrapper>
    <Loader states={[queryResult]}>
      <Card>
        <UI.GraphWrapper data-testid='graph-wrapper'
          key={'graph-details'}
        >
          <DataGraph {...{ graphs: crrmData }} width={width} zoom={0.8}/>
          <GraphTitle details={intent} />
          <UI.GraphLegendWrapper><Legend {...trimmed}/></UI.GraphLegendWrapper>
        </UI.GraphWrapper>
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <UI.ViewMoreButton
            hidden={noData}
            onClick={showDrawer}
            children={$t({ defaultMessage: 'View More' })}
          />
        </div>
      </Card>
      <Drawer
        key={key}
        drawerType={DrawerTypes.FullHeight}
        width={'90vw'}
        title={title}
        visible={visible}
        onClose={closeDrawer}
        children={
          <UI.GraphWrapper>
            <DataGraph {...{ graphs: crrmData }} width={width} zoom={1.5}/>
            <GraphTitle details={intent} />
            <UI.GraphLegendWrapper><Legend {...trimmed}/></UI.GraphLegendWrapper>
          </UI.GraphWrapper>
        }
      />
    </Loader>
  </UI.Wrapper>
}
