// import { getScheduledAt, ScheduleTiming } from '.'

// TODO:
// refer to libs/common/components/src/components/DateTimeDropdown/index.spec.tsx
// for guide on how to mock and test calendar and time picker
// Please delete component below once all tests are done
// libs/common/components/src/components/DateTimeDropdown/

describe('ScheduleTiming', () => {
  describe('intent status = new/scheduled', () => {
    // TODO: render form and use onFinish to assert submitted value

    // partially in L59 libs/common/components/src/components/DateTimeDropdown/index.spec.tsx
    it.todo('show date & time & handle selection submission')
    it.todo('handle selected date & time, then waited past selected time validation')

    // L109 libs/common/components/src/components/DateTimeDropdown/index.spec.tsx
    it.todo('handle selected today and some time are disable')

    // L90 libs/common/components/src/components/DateTimeDropdown/index.spec.tsx
    it.todo('handle change date clears time field')
  })

  describe('intent status = active/applyscheduled', () => {
    // TODO: render form and use onFinish to assert submitted value
    it.todo('show time only & handle selection submission')
  })
})

describe('ScheduleTiming.FieldSummary', () => {
  describe('intent status = new/scheduled', () => {
    it.todo('show date + time')
  })

  describe('intent status = active/applyscheduled', () => {
    it.todo('show time only')
  })
})

describe('getScheduledAt', () => {
  describe('intent status = new/scheduled', () => {
    it.todo('returns value with date & time given')
  })

  describe('intent status = active/applyscheduled', () => {
    it.todo('returns value with date & time given')
    it.todo('moves date to tomorrow if scheduledAt < bufferedNow')
  })
})

describe('validateScheduleTiming', () => {
  it.todo('handle validate date & time')
  it.todo('handle date & time in past')
})
