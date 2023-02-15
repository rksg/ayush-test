/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect, useState } from 'react'

import { Button, Empty }  from 'antd'
import * as d3            from 'd3'
import { select }         from 'd3-selection'
import * as dagreD3       from 'dagre-d3'
import { debounce }       from 'lodash'
import { renderToString } from 'react-dom/server'
import { useIntl }        from 'react-intl'
import { useParams }      from 'react-router-dom'

import { Loader }                                                                                                                                                                                                             from '@acx-ui/components'
import { CloudIconSolid, MagnifyingGlassMinusOutlined, MagnifyingGlassPlusOutlined, MeshAPDevice, MeshRootAPDevice, SearchFitOutlined, SwitchStackDevice, TopologyAPIcon, TopologySwitchSolid, UnKnownDevice, WiredAPDevice } from '@acx-ui/icons'
import { useGetTopologyQuery }                                                                                                                                                                                                from '@acx-ui/rc/services'
import { ConnectionStates, ConnectionStatus, DeviceStates, DeviceStatus, DeviceTypes, GraphData, Link, Node, UINode }                                                                                                         from '@acx-ui/rc/utils'

import LinkTooltip      from './LinkTooltip'
import NodeTooltip      from './NodeTooltip'
import * as UI          from './styledComponents'
import { getPathColor } from './utils'



export function TopologyGraph () {

  const { $t } = useIntl()

  const graphRef = useRef<SVGSVGElement>(null)
  const params = useParams()

  const graph = new dagreD3.graphlib.Graph()
    .setGraph({}) as any

  const { data: topologyData,
    isLoading: isTopologyLoading } = useGetTopologyQuery({ params })

  const [topologyGraphData, setTopologyGraphData] = useState<GraphData>()
  const [showLinkTooltip, setShowLinkTooltip] = useState<boolean>(false)
  const [showDeviceTooltip, setShowDeviceTooltip] = useState<boolean>(false)
  const [tooltipEdge, setTooltipEdge] = useState<Link>()
  const [tooltipNode, setTooltipNode] = useState<Node>()
  const [tooltipSourceNode, setTooltipSourceNode] = useState<Node>()
  const [tooltipTargetNode, setTooltipTargetNode] = useState<Node>()
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    if(topologyData){
      const nodes: Node[] = topologyData?.nodes.map((_node) => {
        return { ..._node } as Node
      })

      const _data: GraphData = {
        type: 'graph',
        categories: [],
        edges: topologyData?.edges as Link[],
        nodes: nodes
      }

      setTopologyGraphData(_data)

    }
  }, [topologyData])

  useEffect(() => {

    if (topologyGraphData && topologyGraphData?.nodes.length) {

      const { edges, nodes } = topologyGraphData as GraphData

      const uiEdges: Link[] = Object.assign([], edges)

      // Add nodes to the graph.

      const uiNodes = nodes.map((node) => {
        return {
          id: node?.id,
          label: node?.name,
          labelType: 'svg',
          config: { ...node },
          expanded: false
        } as UINode })


      // adding default cloud node
      const cloudNode: UINode = {
        id: 'cloud_id',
        label: $t({ defaultMessage: 'Cloud' }),
        config: {
          type: DeviceTypes.Cloud,
          category: 'Cloud',
          name: 'Cloud',
          id: 'cloud_id',
          status: DeviceStatus.Operational,
          states: DeviceStates.Regular,
          childCount: 0
        }
      }
      uiNodes.push(cloudNode)

      const allTargetNodes: Array<string> = []
      uiEdges.forEach(edge => {
        allTargetNodes.push(edge?.to)
      })

      // getting all root nodes to connect to default cloud node
      const rootNodes = uiNodes.filter((node) => {
        if (node.id !== 'cloud_id' && !allTargetNodes.includes(node.id)) {
          return node
        }
        return
      })

      rootNodes.forEach(node => {
        const rootEdge: Link = {
          source: 'cloud_id',
          target: node.id,
          from: 'cloud_id',
          to: node.id,
          connectionType: 'Wired',
          connectionStatus: ConnectionStatus.Good,
          connectionStates: ConnectionStates.Regular
        }
        uiEdges.push(rootEdge)
      })

      uiNodes.forEach(node => {
        graph.setNode(node.id, {
          label: node?.label,
          width: 64,
          height: 48,
          expanded: false })
      })

      // Add edges to the graph.
      uiEdges.forEach((edge: Link) => {

        graph.setEdge(edge.from, edge.to, {
          // curveBumpY, curveMonotoneY, curveStepBefore
          curve: d3.curveMonotoneY,
          SVGAnimatedAngle: true,
          angle: 15,
          style: `fill:transparent;
          stroke:${getPathColor(edge.connectionStatus as ConnectionStatus)}` })
      })

      const render = new dagreD3.render()

      select(graphRef.current).selectAll('*').remove()
      const svg = d3.select(graphRef.current),
        svgGroup = svg.append('g').append('g') as any,
        zoom = d3.zoom().on('zoom',
          function (event: any) {
            svgGroup.attr('transform', event.transform)
          }
        ) as any

      svg.call(zoom)
      // disable zoom on scrolling and mouse double click
      svg.on('wheel.zoom', null)
      svg.on('dblclick.zoom', null)

      svg.attr('data-testid', 'topologyGraph')

      render(svgGroup, graph)

      select(graphRef.current).selectAll('g.node rect').remove()

      select(graphRef.current).selectAll('g.node')
        .data(uiNodes)
        .attr('data-testid', 'topologyNode')
        .append('foreignObject')
        .attr('width', 32)
        .attr('height', 32)
        .attr('x', -16)
        .attr('y', -24)
        .html((node: UINode) => renderToString(<DeviceIcon
          deviceType={node.config.type as DeviceTypes}
          deviceStatus={node.config.status as DeviceStatus}/>))

      select(graphRef.current).selectAll('g.node g.label')
        .attr('transform', 'translate(0,16)')

      // default Center the graph and fit to container

      defaultScreenFit(nodes.length, graph, svg, zoom)

      d3.select('#graph-zoom-in').on('click', function () {
        zoom.scaleBy(svg.transition().duration(750), 1.2)
      })

      d3.select('#graph-zoom-out').on('click', function () {
        zoom.scaleBy(svg.transition().duration(750), 0.8)
      })

      d3.select('#graph-zoom-fit').on('click', function () {
        defaultScreenFit(nodes.length, graph, svg, zoom)
      })

      highlightPath(svg)

      hoverNode(svg)

      // setting circle marker
      d3.selectAll('g.edgePath defs').remove()


      d3.selectAll('g.edgePath')
        .data(uiEdges)
        .append('marker')
        .attr('id', (edge) => edge?.connectionStatus + 'marker')
        .attr('viewBox', '0 -5 10 10')
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('refX', 3)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .append('circle')
        .attr('cx', 3)
        .attr('cy', 0)
        .attr('r', 3)
        .style('fill', (edge) => {
          return getPathColor(edge.connectionStatus as ConnectionStatus)})

      d3.selectAll('g.edgePath path')
        .data(uiEdges)
        .attr('data-testid', 'topologyEdge')
        .attr('marker-start', (edge) => `url(#${edge?.connectionStatus}marker)`)
        .attr('marker-end', (edge) => `url(#${edge?.connectionStatus}marker)`)
    }

  },[graphRef, topologyGraphData])


  // fit graph to screen
  function fitToScreen (graph: any,
    svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
    zoom: any) {
    const graphWidth = graph.graph().width
    const graphHeight = graph.graph().height
    const width = parseInt(svg.style('width').replace(/px/, ''), 10)
    const height = parseInt(svg.style('height').replace(/px/, ''), 10)
    const zoomScale = Math.min(width / graphWidth, height / graphHeight) > 1 ? 1.2
      : Math.min(width / graphWidth, height / graphHeight)
    const translate = [
      (width/2) - ((graphWidth*zoomScale)/2),
      (height/2) - ((graphHeight*zoomScale)/2)
    ]
    zoom.transform(svg, d3.zoomIdentity.translate(translate[0], translate[1]).scale(zoomScale))
  }

  // original graph scale in case of large scale it will persist device icons
  // and label size so that user can see. in this case user need to drag / zoom out to fit entire hierarchy.
  function originalGraphScale (graph: any,
    svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
    zoom: any) {
    const graphWidth = graph.graph().width
    const graphHeight = graph.graph().height
    const width = parseInt(svg.style('width').replace(/px/, ''), 10)
    const height = parseInt(svg.style('height').replace(/px/, ''), 10)
    const translate = [(width - graphWidth) / 2, (height - graphHeight) / 2]
    zoom.transform(svg, d3.zoomIdentity.translate(translate[0], translate[1]))
  }

  function defaultScreenFit (nodeCount: number, graph: any,
    svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
    zoom: any) {
    nodeCount < 20
      ? fitToScreen(graph, svg, zoom)
      : originalGraphScale(graph, svg, zoom)
  }

  // Highlight path and show tooltip for connection on link mouseover
  function highlightPath (svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>) {
    const edgelabels = svg.selectAll('.edgeLabel')
    const allnodes = svg.selectAll('g.node')
    const onmousepath = d3.selectAll('g.edgePath')

    const allpathes = onmousepath.select('.path')

    allpathes
      .on('mouseout',function (){
		 edgelabels.style('opacity', 1)
	      allpathes.style('opacity', 1)/* set all edges to opacity 1 */
        allnodes.style('opacity', 1)/* set all nodes visibillity */
        setShowLinkTooltip(false)
		 })

      .on('mouseover',function (d: MouseEvent, edge: any): void{
        if (edge.from === 'cloud_id')
          return
        setShowLinkTooltip(true)
        setTooltipEdge(edge)
        setTooltipPosition({ x: d.offsetX, y: d.offsetY })
	      edgelabels.style('opacity', 0.2)
        allpathes.style('opacity', 0.2)      // set all edges opacity 0.2
		 allnodes.style('opacity', 0.2)
	     d3.select(this).style('opacity', 1)    // just set the actual edge to opacity 1
		 allnodes.each(function (d: any){
          if(edge.from === d.id) {
            d3.select(this).style('opacity',1)   // make all neighbors visible
            setTooltipSourceNode(d.config)
          }
          if(edge.to === d.id) {
            d3.select(this).style('opacity',1)
            setTooltipTargetNode(d.config)
          }
        })
		 })
  }

  // Highlight Node on mouseover

  function hoverNode (svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>) {
    const edgelabels = svg.selectAll('.edgeLabel')
    const allnodes = svg.selectAll('g.node')
    const onmousepath = d3.selectAll('g.edgePath')
    const allpathes = onmousepath.select('.path')

    const debouncedHandleMouseEnter = debounce(function (node, d, self){
      setShowDeviceTooltip(true)
      setTooltipNode(node.config)
      setTooltipPosition({ x: d?.layerX
        , y: d?.layerY - 50 })
      edgelabels.style('opacity', 0.2)
      allnodes.style('opacity', 0.2)
      allpathes.style('opacity', 0.2)
      d3.select(self).style('opacity', 1)    /*  just set the actual node to opacity 1 */
    }, 500)

    const handleOnMouseLeave = () => {
      edgelabels.style('opacity', 1)
      allnodes.style('opacity', 1) /* set all edges to opacity 1 */
      allpathes.style('opacity', 1)
      setShowDeviceTooltip(false)
      debouncedHandleMouseEnter.cancel()
    }

    allnodes
      .on('mouseout',function (){
        handleOnMouseLeave()
      })
      .on('mouseover',function (d: any, node: any){
        if (node.id === 'cloud_id')
          return
        const self = this
        // delay 500s to avoid multiple calls
        debouncedHandleMouseEnter.call(this, node, d, self)
      })
  }

  return <Loader states={
    [
      { isLoading: false, isFetching: isTopologyLoading }
    ]
  }>
    <div style={{
      width: '100%',
      height: 'calc(100% - 80px)'
    }}>{ topologyData?.nodes.length ?
        <UI.Graph ref={graphRef} width='100%' height='100%' />
        : <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}><Empty /></div>
      }
      {
        showLinkTooltip && <LinkTooltip
          tooltipPosition={tooltipPosition}
          tooltipSourceNode={tooltipSourceNode as Node}
          tooltipTargetNode={tooltipTargetNode as Node}
          tooltipEdge={tooltipEdge as Link} />
      }

      { showDeviceTooltip && <NodeTooltip
        tooltipPosition={tooltipPosition}
        tooltipNode={tooltipNode as Node} />
      }

      {
        !! topologyData?.nodes.length && <UI.ImageButtonsContainer>
          <Button
            data-testid='graph-zoom-in'
            id='graph-zoom-in'
            type='link'
            size='middle'
            icon={<MagnifyingGlassPlusOutlined />} />
          <Button
            data-testid='graph-zoom-out'
            id='graph-zoom-out'
            type='link'
            size='middle'
            icon={<MagnifyingGlassMinusOutlined />} />
          <Button
            data-testid='graph-zoom-fit'
            id='graph-zoom-fit'
            size='middle'
            type='link'
            icon={<SearchFitOutlined />}/>
        </UI.ImageButtonsContainer>
      }
    </div>
  </Loader>
}

export function DeviceIcon (props: { deviceType: DeviceTypes, deviceStatus: DeviceStatus }) {
  const { deviceType, deviceStatus } = props

  function getDeviceIcon () {
    switch (deviceType) {
      case DeviceTypes.Switch:
        return <TopologySwitchSolid />
      case DeviceTypes.SwitchStack:
        return <SwitchStackDevice />
      case DeviceTypes.Ap:
        return <TopologyAPIcon />
      case DeviceTypes.Cloud:
        return <CloudIconSolid />
      case DeviceTypes.ApMesh:
        return <MeshAPDevice />
      case DeviceTypes.ApMeshRoot:
        return <MeshRootAPDevice />
      case DeviceTypes.ApWired:
        return <WiredAPDevice />
      default:
        return <UnKnownDevice />
    }
  }

  return (
    <UI.Device deviceStatus={deviceStatus}>
      {
        getDeviceIcon()
      }
    </UI.Device>
  )
}
