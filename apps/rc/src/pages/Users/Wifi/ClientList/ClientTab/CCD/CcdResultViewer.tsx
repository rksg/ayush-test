/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react'

import * as d3     from 'd3'
import { select }  from 'd3-selection'
import { isEmpty } from 'lodash'
import { useIntl } from 'react-intl'

import { useRunCcdMutation }  from '@acx-ui/rc/services'
import { CatchErrorResponse } from '@acx-ui/rc/utils'

import { CcdEndPoints, CcdEndPointRectX, CcdDataMessage, CcdStatus, CcdMsg } from './contents'
import { useCcd }                                                            from './useCcd'


const msgWidth = 220
const columnWidth = 24
const initColumnHeight = 400
const rectArrowWidth = 56
const rectArrowHeight = 10
const initRowY = 30
const rowHeight = 40
const rowSeperatorHeight = 0
const infoRectWidth = 70
const infoRectHeight = 15

let rowX = 10
let rowY = 30
let hasInitSvg = false
let columnHeight = 400

export interface CcdResultViewerProps {
  state?: string,
  venueId?: string,
  payload?: {
    state: string,
    clientMac: string,
    aps?: string[]
  },
  currentViewAp?: string,
  currentCcdAp?: string,
  updateCcdAp?: (apMac: string) => void
}

export function CcdResultViewer (props: CcdResultViewerProps) {
  const { $t } = useIntl()
  const graphRef = useRef<SVGSVGElement>(null)
  const endPointXsRef = useRef<CcdEndPointRectX[]>([])

  const { state, venueId, payload, currentViewAp, currentCcdAp, updateCcdAp } = props

  const { setRequestId, handleError } = useCcd(socketHandler)

  const [ diagnosisClientConnection ] = useRunCcdMutation()

  useEffect(() => {
    const doActions = async () => {

      if (state === 'START') {
        //console.log('Action is STARTING')
        try {
          const result = await diagnosisClientConnection({
            params: { venueId },
            payload: payload
          }).unwrap()

          setRequestId(result.requestId)
        } catch (error) {
          setRequestId('')
          handleError(error as CatchErrorResponse)
        }

      } else if (state === 'STOP') {
        //console.log('Action is STOP')
        try {
          setRequestId('')
          hasInitSvg = false
          await diagnosisClientConnection({
            params: { venueId },
            payload: payload
          }).unwrap()
        } catch (error) {
          setRequestId('')
          handleError(error as CatchErrorResponse)
        }

      } else if (state === 'CLEAR') {
        //console.log('Action is CLEAR')
        hasInitSvg = false
        select(graphRef.current).selectAll('*').remove()
        updateCcdAp?.('')
      }
    }

    doActions()
  }, [state])

  async function socketHandler (msg: string) {
    const data = JSON.parse(msg)
    //console.log('data: ', data)
    const m = data?.message && JSON.parse(data.message)
    //console.log('msg: ', m)

    const messageData = m?.dataMessage || {}
    const { apMac, messageId } = messageData

    if (isEmpty(apMac)) {
      return
    }

    if (messageId !== 1 ) {
      //console.log('megData: ', messageData)
      const mac = apMac.toUpperCase()
      //console.log('apMac: ', mac)
      //console.log('currentCcdAp:', currentCcdAp)
      //console.log('currentViewAp:', currentViewAp)

      if (mac !== currentCcdAp) {
        updateCcdAp?.(mac)
      }

      if (mac !== currentViewAp) {
        if (hasInitSvg) {
          hasInitSvg = false
          select(graphRef.current).selectAll('*').remove()
        }
        return
      }

      if (!hasInitSvg) {
        initSvg(messageData)
        hasInitSvg = true
      }

      const hasDraw = drawProcessToRow(messageData)

      if (hasDraw) {
        // jump to next row
        rowY += rowHeight + rowSeperatorHeight

        if (rowY > columnHeight) {
          const newHeight = rowY + 30
          adjustmentHeight(newHeight)
        }
      }
    } /*else {
      console.log('probeData: ', messageData)
    }*/
  }

  const initSvg = (data: CcdDataMessage) => {
    select(graphRef.current).selectAll('*').remove()
    d3.select(graphRef.current).append('g')

    columnHeight = initColumnHeight
    rowY = initRowY

    drawEndPoints(data)
  }

  const getSvg = () => {
    return d3.select(graphRef.current)
  }

  const getContainerGroup = () => {
    const svg = getSvg()
    return svg && svg.select('g')
  }

  const drawEndPoints = (data: CcdDataMessage) => {
    const containerGroup = getContainerGroup()
    let group,
      rectangle,
      rectX = msgWidth + 10,
      rectY = 10

    const endPointsXs: CcdEndPointRectX[] = []

    CcdEndPoints.forEach((item) => {
      const { id, name, fullName } = item
      let identity = fullName

      if ( name === 'AP' && data?.apMac) {
        identity += ` (${ data.apMac })`
      }

      group = containerGroup.append('g') as any
      rectangle = drawRectangle(group, rectX, rectY, columnWidth, columnHeight)
      rectangle.attr('fill', '#555555').attr('class', 'endpoint')

      group.append('text')
        .text(identity)
        .attr('transform', function () {
          let tx = rectX + columnWidth / 2
          let ty = rectY + columnHeight / 2
          let t = 'translate(' + tx + ',' + ty + ')'
          t += ' rotate(90)'
          return t
        })
        .attr('dy', '0.5em')
        .attr('fill', '#ffffff')
        .attr('class', 'endpoint-text')
        .style('text-anchor', 'middle')

      endPointsXs.push({
        id,
        x1: rectX,
        x2: rectX + columnWidth
      })

      rectX += columnWidth + rectArrowWidth
    })

    endPointXsRef.current = endPointsXs
  }

  const adjustmentHeight = (value: number) => {
    columnHeight = value

    const rectY = 10
    const svg = getSvg()
    const containerGroup = svg.select('g')
    const endPointRects = containerGroup.selectAll('.endpoint')
    endPointRects.attr('height', columnHeight)

    const endPointTexts = containerGroup.selectAll('.endpoint-text')
    const endPointXs = endPointXsRef.current

    endPointTexts.attr('transform', function (d, i) {
      const x = endPointXs[i].x1
      let tx = x + columnWidth / 2
      let ty = rectY + columnHeight / 2
      let t = 'translate(' + tx + ',' + ty + ')'
      t += ' rotate(90)'
      return t
    })

    svg.attr('height', columnHeight)
  }

  const drawProcessToRow = (data: CcdDataMessage) => {
    const { messageId, statusCode, sourceServerType, destinationServerType } = data
    const containerGroup = getContainerGroup()

    const statusTextColor = (statusCode === CcdStatus.SUCCESS)? '#555'
      : (statusCode === CcdStatus.FAIL)? '#941100' : 'orange'

    // draw message text
    const msg = $t(CcdMsg[messageId])
    containerGroup.append('text')
      .attr('x', rowX)
      .attr('y', rowY + rowHeight / 2)
      .attr('fill', statusTextColor)
      .text(msg)
      .attr('dy', '.4em')


    // draw process arrow
    const endPointXs = endPointXsRef.current
    const srcX = endPointXs.find((item) => item.id === sourceServerType )
    const destX = endPointXs.find((item) => item.id === destinationServerType)

    if (!srcX || !destX) {
      return false
    }

    let tailX: number, headX: number, infoRectX: number

    if (srcX.x1 < destX.x1) {
      tailX = srcX.x2
      headX = destX.x1
      infoRectX = tailX - 5 - infoRectWidth
    } else {
      tailX = srcX.x1
      headX = destX.x2
      infoRectX = tailX + 5
    }

    const group = containerGroup.append('g') as any
    const rectArrowY = rowY + (rowHeight - rectArrowHeight) / 2

    let rectArrow = null

    if (statusCode !== CcdStatus.WARRING) {
      const statusArrowColor = (statusCode === CcdStatus.SUCCESS)? '#74D7C7' : '#941100'
      rectArrow = drawRectangleArrow(group, headX, tailX, rectArrowY)
      rectArrow.attr('fill', statusArrowColor)
    }

    const info = getInfo(data)
    if (info) {
      const infoRectDisplayText = (statusCode === CcdStatus.SUCCESS)? 'Info'
        : (statusCode === CcdStatus.FAIL)? 'Fail' : 'Warning'
      const infoRectColor = (statusCode === CcdStatus.SUCCESS)? '#74D7C7' : statusTextColor
      const infoRectY = rowY + 13
      const infoRect = drawRectangle(group, infoRectX, infoRectY,
        infoRectWidth, infoRectHeight, 5, 5 )
      infoRect.attr('fill', infoRectColor)
      infoRect.append('title').text(info)

      const infoRectTextY = rectArrowY + rectArrowHeight / 2
      const infoRectText = group.append('text')
        .attr('x', infoRectX + 5)
        .attr('y', infoRectTextY)
        .attr('dy', '.35em')
        .text(infoRectDisplayText)
      infoRectText.attr('fill', 'white')
        .append('title').text(info)
        //.attr('data-qtip', info)
        //.style('font-size', '14px')

      const infoIcon = group.append('text')
        .attr('x', infoRectX + 50)
        .attr('y', infoRectTextY)
        .attr('dy', '.4em')
        .text('\u24D8')

      infoIcon.attr('fill', 'white')
        //.attr('data-qtip', info)
        .style('font-weight', 'bold')
        .append('title').text(info)
    }

    return true
  }

  const getInfo = (data: CcdDataMessage) => {
    const { info, protocol } = data
    let infoList = []

    if (info) {
      infoList.push(`Info: ${info}`)
    }

    if(protocol) {
      infoList.push(`Protocol: ${protocol}`)
    }

    return (infoList.length === 0) ? ''
      : infoList.join('<br/>').replace(/[;|,]/g, '<br/>')
  }

  const drawRectangle = (svg: d3.Selection<SVGElement, {}, HTMLElement, any>,
    x: number, y: number,
    width: number, height: number,
    rx?: number, ry?: number) => {

    const rect = svg.append('rect')
      .attr('x', x).attr('y', y)
      .attr('width', width).attr('height', height)

    if (rx) rect.attr('rx', rx)
    if (ry) rect.attr('ry', ry)

    return rect
  }

  const drawRectangleArrow = (svg: d3.Selection<SVGElement, {}, HTMLElement, any>,
    headX: number, tailX: number, y: number) => {

    const arrowWidth = rectArrowHeight + rectArrowHeight / 2
    let pointData

    if (headX > tailX) {
      pointData = [{
        x: tailX,
        y: y
      }, {
        x: headX - arrowWidth,
        y: y
      }, {
        x: headX - arrowWidth,
        y: y - rectArrowHeight / 2
      }, {
        x: headX,
        y: y + rectArrowHeight / 2
      }, {
        x: headX - arrowWidth,
        y: y + rectArrowHeight + rectArrowHeight / 2
      }, {
        x: headX - arrowWidth,
        y: y + rectArrowHeight
      }, {
        x: tailX,
        y: y + rectArrowHeight
      }]
    } else {
      pointData = [{
        x: tailX,
        y: y
      }, {
        x: headX + arrowWidth,
        y: y
      }, {
        x: headX + arrowWidth,
        y: y - rectArrowHeight / 2
      }, {
        x: headX,
        y: y + rectArrowHeight / 2
      }, {
        x: headX + arrowWidth,
        y: y + rectArrowHeight + rectArrowHeight / 2
      }, {
        x: headX + arrowWidth,
        y: y + rectArrowHeight
      }, {
        x: tailX,
        y: y + rectArrowHeight
      }]
    }

    return svg.append('polygon').data([pointData]).attr('points', function (d) {
      return d.map(function (d) {
        return [d.x, d.y].join(',')
      }).join(' ')
    })
  }



  return (
    <div style={{ borderLeft: '1px solid var(--acx-neutrals-30)' }}>
      <svg ref={graphRef} width='100%' height='100%'/>
    </div>
  )
}