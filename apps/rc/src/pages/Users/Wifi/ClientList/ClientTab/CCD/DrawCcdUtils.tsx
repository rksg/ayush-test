import { CcdDataMessage } from './contents'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const RectArrowWidth = 56
export const RectArrowHeight = 10

export const GetInfo = (data: CcdDataMessage) => {
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

export const DrawRectangle = (svg: d3.Selection<SVGElement, {}, HTMLElement, any>,
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

export const DrawRectangleArrow = (svg: d3.Selection<SVGElement, {}, HTMLElement, any>,
  headX: number, tailX: number, y: number) => {

  const arrowWidth = RectArrowHeight + RectArrowHeight / 2
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
      y: y - RectArrowHeight / 2
    }, {
      x: headX,
      y: y + RectArrowHeight / 2
    }, {
      x: headX - arrowWidth,
      y: y + RectArrowHeight + RectArrowHeight / 2
    }, {
      x: headX - arrowWidth,
      y: y + RectArrowHeight
    }, {
      x: tailX,
      y: y + RectArrowHeight
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
      y: y - RectArrowHeight / 2
    }, {
      x: headX,
      y: y + RectArrowHeight / 2
    }, {
      x: headX + arrowWidth,
      y: y + RectArrowHeight + RectArrowHeight / 2
    }, {
      x: headX + arrowWidth,
      y: y + RectArrowHeight
    }, {
      x: tailX,
      y: y + RectArrowHeight
    }]
  }

  return svg.append('polygon').data([pointData]).attr('points', function (d) {
    return d.map(function (d) {
      return [d.x, d.y].join(',')
    }).join(' ')
  })
}