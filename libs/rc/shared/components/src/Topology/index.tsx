/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect, useState } from 'react'

import { AutoComplete, Button, Col, Empty, Input, Row, Typography } from 'antd'
import * as d3                                                      from 'd3'
import { select }                                                   from 'd3-selection'
import * as dagreD3                                                 from 'dagre-d3'
import { debounce }                                                 from 'lodash'
import { renderToString }                                           from 'react-dom/server'
import { useIntl }                                                  from 'react-intl'
import { useParams }                                                from 'react-router-dom'

import { Loader }                                                                                                                                                                                                                     from '@acx-ui/components'
import { CloudSolid, MagnifyingGlassMinusOutlined, MagnifyingGlassPlusOutlined, AccessPointWifiMesh, AccessPointWifiMeshRoot, SearchFitOutlined, StackDevice, AccessPointWifi, Switch, Unknown, AccessPointWifiPort, SearchOutlined } from '@acx-ui/icons'
import { useGetTopologyQuery }                                                                                                                                                                                                        from '@acx-ui/rc/services'
import { ConnectionStates, ConnectionStatus, DeviceStates, DeviceStatus, DeviceTypes, GraphData, Link, Node, ShowTopologyFloorplanOn, UINode }                                                                                        from '@acx-ui/rc/utils'
import { TenantLink }                                                                                                                                                                                                                 from '@acx-ui/react-router-dom'
import { hasAccess }                                                                                                                                                                                                                  from '@acx-ui/user'

import LinkTooltip      from './LinkTooltip'
import NodeTooltip      from './NodeTooltip'
import * as UI          from './styledComponents'
import { getPathColor } from './utils'


type OptionType = {
  value: string;
  label: string | JSX.Element;
  key: string;
  children: string;
  item: Node;
}

export function TopologyGraph (props:{ venueId?: string,
  showTopologyOn: ShowTopologyFloorplanOn,
  deviceMac?: string }) {

  const { $t } = useIntl()
  const { venueId, showTopologyOn, deviceMac } = props

  const graphRef = useRef<SVGSVGElement>(null)
  const params = useParams()

  const graph = new dagreD3.graphlib.Graph({ multigraph: true })
    .setGraph({ }) as any

  const _venueId = params.venueId || venueId

  const { data: topologyData,
    isLoading: isTopologyLoading } = useGetTopologyQuery({ params: { ...params,
    venueId: _venueId } })

  const [topologyGraphData, setTopologyGraphData] = useState<GraphData>()
  const [showLinkTooltip, setShowLinkTooltip] = useState<boolean>(false)
  const [showDeviceTooltip, setShowDeviceTooltip] = useState<boolean>(false)
  const [tooltipEdge, setTooltipEdge] = useState<Link>()
  const [tooltipNode, setTooltipNode] = useState<Node>()
  const [tooltipSourceNode, setTooltipSourceNode] = useState<Node>()
  const [tooltipTargetNode, setTooltipTargetNode] = useState<Node>()
  const [filterNodes, setFilterNodes] = useState<OptionType[]>()
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    if(topologyData) {
      const nodes: Node[] = topologyData?.nodes

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

      const uiEdges: Link[] = edges.map(
        (edge, idx) => { return { ...edge, id: 'edge_'+idx } as Link })

      // Add nodes to the graph.

      const uiNodes = nodes.map((node) => {
        return {
          id: node?.id,
          label: node?.name,
          labelType: 'svg',
          config: { ...node },
          expanded: false
        } as UINode })


      // creating filter datasource

      const _formattedNodes = nodes.map(node => ({
        value: (node.name as string).toString(),
        key: (node.id as string).toString(),
        label: <div><Typography.Title style={{ margin: 0 }} level={5} ellipsis={true}>
          {node.name as string}</Typography.Title>
        <Typography.Text type='secondary'>{(node.mac as string)}</Typography.Text></div>,
        children: node.label,
        item: node
      })) as OptionType[]
      setFilterNodes(_formattedNodes)

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

      // if 2 switches are interconnected with 2 edges then it needs to
      // find if any / both nodes connected to cloud. For this purpose we are using
      // cloudPort check
      uiNodes.forEach(node => {
        if(node.config?.cloudPort)
          rootNodes.push(node)
      })

      // if no root node available then remove cloud node
      if (!rootNodes?.length) {
        const cloudNodeIndex = uiNodes?.findIndex((node) => node.id === 'cloud_id')
        if (cloudNodeIndex > -1)
          uiNodes.splice(cloudNodeIndex,1)
      }

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
          label: truncateLabel(node?.label as string, 15),
          width: 64,
          height: 48,
          expanded: false })
      })

      // Add edges to the graph.
      uiEdges.forEach((edge: Link) => {

        graph.setEdge(edge.from, edge.to, {
          // curveBumpY, curveMonotoneY, curveStepBefore
          curve: d3.curveMonotoneY,
          lineInterpolate: 'basis',
          SVGAnimatedAngle: true,
          angle: 15,
          style: `fill:transparent;
          stroke:${getPathColor(edge.connectionStatus as ConnectionStatus)}` }, edge.id)
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

      select(graphRef.current)
        .selectAll('g.node rect')
        .attr('width', 32)
        .attr('height', 32)
        .attr('x', -16)
        .attr('y', -24)

      select(graphRef.current).selectAll('g.node')
        .data(uiNodes)
        .attr('data-testid', 'topologyNode')
        .append('foreignObject')
        .attr('pointer-events', 'none')
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

      defaultScreenFit(zoom)

      d3.select('#graph-zoom-in').on('click', function () {
        zoom.scaleBy(svg.transition().duration(750), 1.2)
      })

      d3.select('#graph-zoom-out').on('click', function () {
        zoom.scaleBy(svg.transition().duration(750), 0.8)
      })

      d3.select('#graph-zoom-fit').on('click', function () {
        defaultScreenFit(zoom)
      })

      const selectedNode = getSelectedNode(deviceMac as string)

      highlightPath(selectedNode)

      hoverNode(selectedNode)

      onNodeClick()

      onLinkClick()

      if (showTopologyOn !== ShowTopologyFloorplanOn.VENUE_OVERVIEW) {
        searchNodeByid(svg, zoom, selectedNode)
      }

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

  function truncateLabel (label: string, maxWidth: number) {
    const ellipsis = '...'
    if (label.length <= maxWidth) {
      return label
    } else {
      return label.slice(0, maxWidth - ellipsis.length) + ellipsis
    }
  }


  // fit graph to screen
  function fitToScreen (svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
    zoom: any) {
    const _graph = (d3.select('g.output').node() as SVGGElement)
    const graphWidth = _graph.getBBox().width
    const graphHeight = _graph.getBBox().height
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
  function originalGraphScale (svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
    zoom: any) {
    const _graph = (d3.select('g.output').node() as SVGGElement)
    const graphWidth = _graph.getBBox().width
    const graphHeight = _graph.getBBox().height
    const width = parseInt(svg.style('width').replace(/px/, ''), 10)
    const height = parseInt(svg.style('height').replace(/px/, ''), 10)
    const translate = [(width - graphWidth) / 2, (height - graphHeight) / 2]
    zoom.transform(svg, d3.zoomIdentity.translate(translate[0], translate[1]))
  }

  function defaultScreenFit (zoom: any) {
    const svg = d3.select(graphRef.current)
    const _graph = (d3.select('g.output').node() as SVGGElement)
    if (_graph) {
      const graphWidth = _graph.getBBox().width
      const graphHeight = _graph.getBBox().height
      const width = parseInt(svg.style('width').replace(/px/, ''), 10)
      const height = parseInt(svg.style('height').replace(/px/, ''), 10)
      graphWidth > width || graphHeight > height
        ? fitToScreen(svg, zoom)
        : originalGraphScale(svg, zoom)
    }
  }

  // Highlight path and show tooltip for connection on link mouseover
  function highlightPath (selectedNode: any) {
    const svg = d3.select(graphRef.current)
    const allnodes = svg.selectAll('g.node')
    const onmousepath = d3.selectAll('g.edgePath')

    const allpathes = onmousepath.select('.path')

    allpathes
      .on('mouseout', function (){
        highlightNodeOnMouseout(selectedNode)
		 })

      .on('mouseover',function (d: MouseEvent, edge: any): void {
        if (edge.from === 'cloud_id')
          return
	      lowVisibleAll()
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

  function onLinkClick () {
    const onmousepath = d3.selectAll('g.edgePath')

    const allpathes = onmousepath.select('.path')

    allpathes
      .on('click',function (d: MouseEvent, edge: any): void {
        if (edge.from === 'cloud_id')
          return
        setShowLinkTooltip(true)
        setShowDeviceTooltip(false) // close device detail tooltip if already opened.
        setTooltipEdge(edge)
        setTooltipPosition({ x: d.offsetX, y: d.offsetY })
	    })
  }

  function closeLinkTooltipHandler () {
    setShowLinkTooltip(false)
  }

  // Highlight Node on mouseover

  function hoverNode (selectedNode: any) {
    const svg = d3.select(graphRef.current)
    const allnodes = svg.selectAll('g.node')

    const handleOnMouseLeave = () => {
      highlightNodeOnMouseout(selectedNode)
    }

    allnodes
      .on('mouseout',function (){
        handleOnMouseLeave()
      })
      .on('mouseover',function (d: any, node: any){
        if (node.id === 'cloud_id')
          return
        const self = this
        lowVisibleAll()
        d3.select(self).style('opacity', 1)    /*  just set the actual node to opacity 1 */
      })
  }

  const debouncedHandleMouseEnter = debounce(function (node, d){
    setShowDeviceTooltip(true)
    setTooltipNode(node.config)
    setTooltipPosition({ x: d?.layerX + 30
      , y: d?.layerY })
  }, 100)

  function onNodeClick () {
    const svg = d3.select(graphRef.current)
    const allnodes = svg.selectAll('g.node')

    allnodes
      .on('click',function (d: any, node: any){
        setShowLinkTooltip(false) // close link details tooltip if already opened.
        if (node.id === 'cloud_id')
          return
        // delay 100s to avoid multiple calls
        debouncedHandleMouseEnter.call(this, node, d)
      })
  }

  function closeTooltipHandler () {
    setShowDeviceTooltip(false)
    debouncedHandleMouseEnter.cancel()
  }

  function highlightNodeOnMouseout (selectedNode: SVGGElement) {
    if (selectedNode) {
      lowVisibleAll();
      (selectedNode as SVGGElement).style.opacity = '1'
    } else {
      highlightAll()
    }
  }

  function searchNodeByid (svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
    zoom: any,
    selectedNode: any) {
    const onmousepath = d3.selectAll('g.edgePath')

    const allpathes = onmousepath.select('.path')
    lowVisibleAll()

    const _graph = (d3.select('g.output').node() as SVGGElement)

    if (selectedNode && selectedNode.__data__) {
      const nodeId = selectedNode.__data__.id;
      (selectedNode as SVGGElement).style.opacity = '1' as string;

      // make default zoom before navigate to selectedNode
      (d3.select('#graph-zoom-fit').node() as HTMLButtonElement).click()

      allpathes.each(function (d: any){
        if(d.v === nodeId) {
          d3.select(this).style('opacity',1)
        }
        if(d.w === nodeId) {
          d3.select(this).style('opacity',1)
        }
      })
      const targetX = (selectedNode as SVGGElement).getBoundingClientRect().x

      const graphWidth = _graph.getBBox().width
      const graphHeight = _graph.getBBox().height
      const width = parseInt(svg.style('width').replace(/px/, ''), 10)
      const height = parseInt(svg.style('height').replace(/px/, ''), 10)

      const coordX = ((width-graphWidth) / 2) + (width / 2) - targetX

      if (graphWidth > width) {
        const translate = [coordX + 100, (height - graphHeight) / 2]
        zoom.transform(svg.transition().duration(750),
          d3.zoomIdentity.translate(translate[0], translate[1]))
      } else {
        originalGraphScale(svg, zoom)
      }

    }
  }

  function getSelectedNode (deviceMac: string) {
    const svg = d3.select(graphRef.current)
    const allnodes = svg.selectAll('g.node')
    // this is selected / searched node
    const selectedNode = allnodes.nodes().filter((node: any) =>{
      return ((node.__data__.config.mac)?.toLowerCase() === deviceMac?.toLowerCase())
      && node.__data__.id !== 'cloud_id'
    })

    return selectedNode && selectedNode[0]
  }

  function highlightAll () {
    const svg = d3.select(graphRef.current)
    const edgelabels = svg.selectAll('.edgeLabel')
    const allnodes = svg.selectAll('g.node')
    const onmousepath = d3.selectAll('g.edgePath')

    const allpathes = onmousepath.select('.path')
    edgelabels.style('opacity', 1)
    allpathes.style('opacity', 1)/* set all edges to opacity 1 */
    allnodes.style('opacity', 1)/* set all nodes visibillity */
  }

  function lowVisibleAll () {
    const svg = d3.select(graphRef.current)
    const edgelabels = svg.selectAll('.edgeLabel')
    const allnodes = svg.selectAll('g.node')
    const onmousepath = d3.selectAll('g.edgePath')

    const allpathes = onmousepath.select('.path')
    edgelabels.style('opacity', 0.2)
    allpathes.style('opacity', 0.2)
    allnodes.style('opacity', 0.2)
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
        <>
          {
            (showTopologyOn === ShowTopologyFloorplanOn.VENUE_OVERVIEW)
            && !!filterNodes?.length
            && <AutoComplete
              id='searchNodes'
              data-testid='searchNodes'
              options={filterNodes}
              filterOption={(inputValue, option) =>{
                return !!((option as OptionType).item.id as string).toLowerCase()
                  .includes(inputValue.toLowerCase()) ||
                  !!((option as OptionType).item.name as string).toLowerCase()
                    .includes(inputValue.toLowerCase()) ||
                  !!((option as OptionType).item.mac as string).toLowerCase()
                    .includes(inputValue.toLowerCase())
              }
              }
              style={{ width: 280 }}
              onSelect={(value: any, option: OptionType) => {
                searchNodeByid(d3.select(graphRef.current), d3.zoom(),
                  getSelectedNode(option.item.mac as string))
                highlightPath(getSelectedNode(option.item.mac as string))
                hoverNode(getSelectedNode(option.item.mac as string))
              }}
              allowClear={true}
              onSearch={
                (inputValue) => {
                  if (inputValue === '') {
                    highlightPath(undefined)
                    hoverNode(undefined)
                    highlightAll()
                    return false
                  }
                  return
                }
              }
              onClear={() => {
                highlightPath(undefined)
                hoverNode(undefined)
                highlightAll()
              }}
            >
              <Input
                prefix={<SearchOutlined />}
                placeholder={$t({ defaultMessage: 'Search by device name or MAC address' })}/>
            </AutoComplete>
          }
          <UI.Graph ref={graphRef} width='100%' height='100%' />
        </>
        : <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>
          {
            (showTopologyOn === ShowTopologyFloorplanOn.VENUE_OVERVIEW)
              ? <Empty description={$t({ defaultMessage: 'No devices added yet to this venue' })}>
                { hasAccess() && <Row>
                  <Col span={12}>
                    <TenantLink to='devices/wifi/add'>
                      {$t({ defaultMessage: 'Add Access Point' })}
                    </TenantLink>
                  </Col>
                  <Col span={8} offset={4}>
                    <TenantLink to='devices/switch/add'>
                      {$t({ defaultMessage: 'Add Switch' })}
                    </TenantLink>
                  </Col>
                </Row>}
              </Empty>
              : <Empty description={$t({ defaultMessage: 'This device not added to any venue' })} />
          }
        </div>
      }
      {
        showLinkTooltip && <LinkTooltip
          tooltipPosition={tooltipPosition}
          tooltipSourceNode={tooltipSourceNode as Node}
          tooltipTargetNode={tooltipTargetNode as Node}
          tooltipEdge={tooltipEdge as Link}
          onClose={closeLinkTooltipHandler} />
      }

      { showDeviceTooltip && <NodeTooltip
        tooltipPosition={tooltipPosition}
        tooltipNode={tooltipNode as Node}
        closeTooltip={closeTooltipHandler} />
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
        return <Switch />
      case DeviceTypes.SwitchStack:
        return <StackDevice />
      case DeviceTypes.Ap:
        return <AccessPointWifi />
      case DeviceTypes.Cloud:
        return <CloudSolid />
      case DeviceTypes.ApMesh:
        return <AccessPointWifiMesh />
      case DeviceTypes.ApMeshRoot:
        return <AccessPointWifiMeshRoot />
      case DeviceTypes.ApWired:
        return <AccessPointWifiPort />
      default:
        return <Unknown />
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
