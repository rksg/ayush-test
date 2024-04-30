import { createContext } from 'react'

export const ApGroupsTabContext = createContext({} as {
  setApGroupsCount: (data: number) => void
})