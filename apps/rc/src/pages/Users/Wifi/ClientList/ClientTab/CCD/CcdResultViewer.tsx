/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react'

import * as d3     from 'd3'
import { select }  from 'd3-selection'
import { isEmpty } from 'lodash'
import { useIntl } from 'react-intl'

import { useRunCcdMutation }  from '@acx-ui/rc/services'
import { CatchErrorResponse } from '@acx-ui/utils'

import { CcdEndPoints, CcdEndPointRectX, CcdDataMessage, CcdStatus, CcdMsg }           from './contents'
import { DrawRectangle, DrawRectangleArrow, GetInfo, RectArrowHeight, RectArrowWidth } from './DrawCcdUtils'
import { useCcd }                                                                      from './useCcd'


const msgWidth = 220
const columnWidth = 24
const initColumnHeight = 400

const initRowY = 30
const rowHeight = 40
const rowSeperatorHeight = 0
const infoRectWidth = 70
const infoRectHeight = 15

let rowX = 10
let rowY = 30
let hasInitSvg = false
let columnHeight = 400
let historicalData: any[][] = []
let curApHistroicalData: any[] = []

export interface CcdResultViewerProps {
  state?: string,
  venueId?: string,
  payload?: {
    state: string,
    clientMac: string,
    aps?: string[]
  },
  addCcdAp?: (apMac: string) => void
  cleanCcdAps?: () => void
  resetCcdButtons?: () => void
  historicalIndex?: number
}

export function CcdResultViewer (props: CcdResultViewerProps) {
  const { $t } = useIntl()
  const graphRef = useRef<SVGSVGElement>(null)
  const endPointXsRef = useRef<CcdEndPointRectX[]>([])
  const currentCcdApRef = useRef<string>('')

  const { state, venueId, payload, addCcdAp, cleanCcdAps, resetCcdButtons, historicalIndex } = props

  const { setRequestId, handleError } = useCcd(socketHandler, resetCcdButtons)

  const [ diagnosisClientConnection ] = useRunCcdMutation()

  useEffect(() => {
    const doActions = async () => {

      if (state === 'START') {
        //console.log('Action is STARTING')
        select(graphRef.current).selectAll('*').remove()
        historicalData = []
        curApHistroicalData = []
        hasInitSvg = false
        currentCcdApRef.current = ''
        cleanCcdAps?.()

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

          saveCurrentApCcdData()
        } catch (error) {
          setRequestId('')
          handleError(error as CatchErrorResponse)
        }
      } else if (state === 'CLEAR') {
        //console.log('Action is CLEAR')
        hasInitSvg = false
        select(graphRef.current).selectAll('*').remove()
        currentCcdApRef.current = ''
        historicalData = []
        curApHistroicalData = []
        cleanCcdAps?.()
      } else if (state === 'HISTORICAL') {
        //console.log('Action is drawing the HISTORICAL data')
        if (historicalIndex !== undefined) {
          hasInitSvg = false
          select(graphRef.current).selectAll('*').remove()
          currentCcdApRef.current = ''
          const data = historicalData[historicalIndex]
          drawHistoricalData(data)
        }
      } else if (state === 'RESET_BUTTONS') {
        // do nothing
      }
    }

    doActions()
  }, [state, historicalIndex])

  const drawHistoricalData = (data: any[]) => {
    if (!data) return

    data.forEach(messageData => {
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
    })
  }

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

      if (mac !== currentCcdApRef.current) {
        currentCcdApRef.current = mac
        addCcdAp?.(mac)
        saveCurrentApCcdData()
        // clean and redraw
        hasInitSvg = false
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

      curApHistroicalData.push(messageData)
    } /*else {
      console.log('probeData: ', messageData)
    }*/
  }

  const saveCurrentApCcdData = () => {
    if (curApHistroicalData?.length > 0) {
      historicalData.push([ ...curApHistroicalData ])
      curApHistroicalData = []

      //console.log('historicalData: ', historicalData)
    }
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
        identity += ` (${ data.apMac.toUpperCase() })`
      }

      group = containerGroup.append('g') as any
      rectangle = DrawRectangle(group, rectX, rectY, columnWidth, columnHeight)
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

      rectX += columnWidth + RectArrowWidth
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
    const msg = $t(CcdMsg[messageId] ?? { defaultMessage: 'Undefined Message' })
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
    const rectArrowY = rowY + (rowHeight - RectArrowHeight) / 2

    let rectArrow = null

    if (statusCode !== CcdStatus.WARRING) {
      const statusArrowColor = (statusCode === CcdStatus.SUCCESS)? '#74D7C7' : '#941100'
      rectArrow = DrawRectangleArrow(group, headX, tailX, rectArrowY)
      rectArrow.attr('fill', statusArrowColor)
    }

    const info = GetInfo(data)
    if (info) {
      const infoRectDisplayText = (statusCode === CcdStatus.SUCCESS)? 'Info'
        : (statusCode === CcdStatus.FAIL)? 'Fail' : 'Warning'
      const infoRectColor = (statusCode === CcdStatus.SUCCESS)? '#74D7C7' : statusTextColor
      const infoRectY = rowY + 13
      const infoRect = DrawRectangle(group, infoRectX, infoRectY,
        infoRectWidth, infoRectHeight, 5, 5 )
      infoRect.attr('fill', infoRectColor)
      infoRect.append('title').text(info)

      const infoRectTextY = rectArrowY + RectArrowHeight / 2
      const infoRectText = group.append('text')
        .attr('x', infoRectX + 5)
        .attr('y', infoRectTextY)
        .attr('dy', '.35em')
        .text(infoRectDisplayText)
      infoRectText.attr('fill', 'white')
        .append('title').text(info)

      const infoIcon = group.append('text')
        .attr('x', infoRectX + 50)
        .attr('y', infoRectTextY)
        .attr('dy', '.4em')
        .text('\u24D8')

      infoIcon.attr('fill', 'white')
        .style('font-weight', 'bold')
        .append('title').text(info)
    }

    return true
  }


  return (
    <div style={{ borderLeft: '1px solid var(--acx-neutrals-30)' }}>
      <svg ref={graphRef} width='100%' height='100%'/>
    </div>
  )
}
