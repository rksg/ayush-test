/* eslint-disable max-len */
// import { cloneDeep } from 'lodash'

import { round } from 'lodash'

const defaultGranularity = 10 * 60 * 1000 // 10 minutes
const cpuDataRemainProbability = 0.1 // 10% chance for the CPU data to remain the same as the previous value.
const memoryDataRemainProbability = 0.03 // 3% chance for the Memory data to remain the same as the previous value.
const diskDataRemainProbability = 0.3 // 30% chance for the Disk data to remain the same as the previous value.

const baseCpuData = [
  12, 1, 9, 7, 15, 8, 11, 6, 13, 4, 10, 5, 14, 3, 9, 12, 7, 16, 5, 11,
  8, 13, 4, 10, 6, 15, 3, 9, 12, 7, 14, 5, 11, 8, 13, 4, 10, 6, 15, 3,
  9, 12, 7, 14, 5, 11, 8, 13, 4, 10, 6, 15, 3, 9, 12, 7, 14, 5, 11, 8,
  13, 4, 10, 6, 15, 3, 9, 12, 7, 14, 5, 11, 8, 13, 4, 10, 6, 15, 3, 9,
  12, 7, 14, 5, 11, 8, 13, 4, 10, 6, 15, 3, 9, 12, 7, 14, 5, 11, 8, 13,
  4, 10, 6, 15, 3
]

const baseMemoryData = [
  91.52, 91.55, 91.56, 92.00, 91.85, 91.90, 91.75, 91.95, 92.10, 91.80, 91.70, 91.88, 92.05, 91.78, 91.92,
  91.83, 91.97, 92.15, 91.73, 91.86, 91.94, 92.08, 91.76, 91.89, 91.98, 92.12, 91.79, 91.93, 92.02, 91.82,
  91.96, 92.18, 91.72, 91.87, 91.99, 92.09, 91.77, 91.91, 92.04, 91.81, 91.95, 92.14, 91.74, 91.88, 92.01,
  91.84, 91.97, 92.11, 91.78, 91.92, 92.06, 91.83, 91.96, 92.16, 91.75, 91.89, 92.03, 91.82, 91.95, 92.13,
  91.76, 91.90, 92.07, 91.81, 91.94, 92.19, 91.77, 91.91, 92.05, 91.80, 91.93, 92.17, 91.74, 91.88, 92.02,
  91.79, 91.92, 92.15, 91.73, 91.87, 92.04, 91.78, 91.91, 92.12, 91.75, 91.89, 92.06, 91.77, 91.90, 92.14,
  91.72, 91.86, 92.03, 91.76, 91.89, 92.11, 91.74, 91.88, 92.07, 91.75, 91.87, 92.13, 91.73
]

const baseDiskData = [
  7.95, 7.96, 7.80, 7.90, 7.88, 7.92, 7.85, 7.93, 7.87, 7.91, 7.83, 7.94, 7.86, 7.89, 7.82,
  7.95, 7.84, 7.90, 7.88, 7.93, 7.81, 7.92, 7.87, 7.91, 7.85, 7.94, 7.83, 7.89, 7.86, 7.90,
  7.82, 7.95, 7.84, 7.91, 7.88, 7.93, 7.81, 7.92, 7.87, 7.90, 7.85, 7.94, 7.83, 7.89, 7.86,
  7.91, 7.82, 7.95, 7.84, 7.90, 7.88, 7.93, 7.81, 7.92, 7.87, 7.91, 7.85, 7.94, 7.83, 7.89,
  7.86, 7.90, 7.82, 7.95, 7.84, 7.91, 7.88, 7.93, 7.81, 7.92, 7.87, 7.90, 7.85, 7.94, 7.83,
  7.89, 7.86, 7.91, 7.82, 7.95, 7.84, 7.90, 7.88, 7.93, 7.81, 7.92, 7.87, 7.91, 7.85, 7.94,
  7.83, 7.89, 7.86, 7.90, 7.82, 7.95, 7.84, 7.91, 7.88, 7.93, 7.81, 7.92, 7.87
]

export const generateRandomChartData = (endTime: Date, dataPoints: number):
{ time: number[], cpu: number[], memory: number[], disk: number[] } => {
  const time: number[] = []
  const cpu: number[] = []
  const memory: number[] = []
  const disk: number[] = []

  for (let i = 0; i < dataPoints; i++) {
    // Generate time data with interval
    time.push(endTime.getTime() - i * defaultGranularity)

    if (i === 0) {
      // For the first data point, use the base data directly
      cpu.push(baseCpuData[i % baseCpuData.length])
      memory.push(baseMemoryData[i % baseMemoryData.length])
      disk.push(baseDiskData[i % baseDiskData.length])
    } else {
      processCpuData(cpu, i)
      processMemoryData(memory, i)
      processDiskData(disk, i)
    }
  }

  return { time, cpu, memory, disk }
}

const processCpuData = (cpu: number[], currentIdx: number) => {
  // Randomly decide whether to keep the same value (low probability)
  const keepSameValue = Math.random() < cpuDataRemainProbability
  if (keepSameValue) {
    cpu.push(cpu[currentIdx - 1])
  } else {
    // Generate CPU data based on the baseCpuData pattern
    const baseIndex = currentIdx % baseCpuData.length
    const variation = Math.random() * 4 - 2 // Random variation between -2 and 2
    const newValue = Math.max(1, Math.min(100, baseCpuData[baseIndex] + variation)) // Ensure CPU percentage is between 1 and 100
    cpu.push(round(newValue, 1))
  }
}

const processMemoryData = (memory: number[], currentIdx: number) => {
  // Randomly decide whether to keep the same value (low probability)
  const keepSameValue = Math.random() < memoryDataRemainProbability
  if (keepSameValue) {
    memory.push(memory[currentIdx - 1])
  } else {
    // Generate Memory data based on the baseMemoryData pattern
    const baseMemoryIndex = currentIdx % baseMemoryData.length
    const memoryVariation = Math.random() * 0.2 - 0.1 // Random variation between -0.1 and 0.1
    const newMemoryValue = Math.max(1, Math.min(100, baseMemoryData[baseMemoryIndex] + memoryVariation)) // Ensure Memory percentage is between 1 and 100
    memory.push(round(newMemoryValue, 1))
  }
}

const processDiskData = (disk: number[], currentIdx: number) => {
  // Randomly decide whether to keep the same value (higher probability than the others)
  const keepSameValue = Math.random() < diskDataRemainProbability
  if (keepSameValue) {
    disk.push(disk[currentIdx - 1])
  } else {
    // Generate Disk data based on the baseDiskData pattern
    const baseDiskIndex = currentIdx % baseDiskData.length
    const diskVariation = Math.random() * 2 - 0.5 // Random variation between -0.5 and 1.5
    const newDiskValue = Math.max(1, Math.min(100, baseDiskData[baseDiskIndex] + diskVariation)) // Ensure Disk percentage is between 1 and 100
    disk.push(round(newDiskValue, 1))
  }
}