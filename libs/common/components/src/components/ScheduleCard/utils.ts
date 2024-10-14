import { MutableRefObject } from 'react'

import { boxesIntersect }    from '@air/react-drag-to-select'
import { Box, SelectionBox } from '@air/react-drag-to-select/dist/utils/types'
import { FormInstance }      from 'antd'
import _                     from 'lodash'

export const genTimeTicks = (is12H:boolean, intervalUnit:number) => {
  const timeticks: string[] = []
  if (is12H) {
    const unit = intervalUnit === 15 ? 2 : 3
    const range = 12 / unit
    timeticks.push('Midnight')
    for (let i = 1; i < range; i++) {
      timeticks.push((i * unit) + ' AM')
    }
    timeticks.push('Noon')
    for (let i = 1; i < range; i++) {
      timeticks.push((i * unit) + ' PM')
    }
    timeticks.push('Midnight')
  } else {
    for (let i = 0; i <= 8; i++) {
      timeticks.push(`${i*3}`)
    }
  }
  return timeticks
}

export const shouldStartSelecting = (target: EventTarget | null) => {
  if (target instanceof HTMLElement) {
    let el = target
    while (el.parentElement && !el.dataset.disableselect) {
      el = el.parentElement
    }
    return el.dataset.disableselect !== 'true'
  }
  return true

}

interface indexDayType {
    [key: string]: number
  }

export const dayIndex: indexDayType = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6
}

export const onSelectionChange =
// eslint-disable-next-line max-len
(box:SelectionBox, disabled:boolean, selectedItems:MutableRefObject<string[]>, intervalsCount:number
)=> {
  selectedItems.current = []
  if(disabled){
    return
  }
  const { scrollY, scrollX } = window
  const scrollAwareBox: Box = {
    ...box,
    top: box.top + scrollY,
    left: box.left + scrollX
  }

  for (let daykey in dayIndex) {
    // eslint-disable-next-line no-loop-func
    Array.from({ length: intervalsCount }, (_, i) => {
      const itemKey = `${daykey}_${i}`
      const item = document.getElementById(itemKey)
      if(item){
        const { left, top, width, height } = item.getBoundingClientRect()
        const boxItem = { left: left + scrollX, top: top + scrollY, width, height }
        if (boxesIntersect(scrollAwareBox, boxItem)) {
          selectedItems.current.push(itemKey)
        }
      }
      return null
    })
  }
}

export const parseNonePrefixScheduler = (key:string, values: string[]) => {
  return values.map((item: string) => `${key}_${item}`)
}


const memoUniqSchedule = (schedule: string[], handleItems: string[], daykey: string) => {
  // eslint-disable-next-line max-len
  return _.uniq(_.xor(schedule, handleItems.filter((item: string) => item.indexOf(daykey) > -1))) || []
}

export const onSelectionEnd = (fieldNamePath:string[], prefix:boolean,items:string[],
  intervalsCount:number, form:FormInstance, arrCheckAll:boolean[], arrIndeterminate:boolean[]
) => {
  const selectedItems = _.uniq(items)
  for (let daykey in dayIndex) {
    const daySchedule = form.getFieldValue(fieldNamePath.concat(daykey)) ?? []
    const schedule = prefix ? daySchedule : parseNonePrefixScheduler(daykey, daySchedule)
    if(selectedItems.filter((item: string) => item.indexOf(daykey) > -1)){
      let uniqSchedule = memoUniqSchedule(schedule, selectedItems, daykey)
      form.setFieldValue(fieldNamePath.concat(daykey),
        uniqSchedule.map((item: string) => prefix?item:`${item.split('_')[1]}`)
      )
      if(uniqSchedule && uniqSchedule.length === intervalsCount){
        arrCheckAll[dayIndex[daykey]] = true
        arrIndeterminate[dayIndex[daykey]] = false
      }else if(uniqSchedule && uniqSchedule.length > 0 && uniqSchedule.length < intervalsCount){
        arrIndeterminate[dayIndex[daykey]] = true
      }else{
        arrCheckAll[dayIndex[daykey]] = false
        arrIndeterminate[dayIndex[daykey]] = false
      }
    }
  }
  return [arrCheckAll, arrIndeterminate]
}