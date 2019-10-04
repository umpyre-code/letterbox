import { AxisBottom, AxisLeft } from '@vx/axis'
import { LinearGradient } from '@vx/gradient'
import { Group } from '@vx/group'
import { ParentSize } from '@vx/responsive'
import { scaleBand, scaleLinear } from '@vx/scale'
import { Bar } from '@vx/shape'
import { timeFormat } from 'd3-time-format'
import React from 'react'
import { AmountByDate } from '../../store/models/stats'

interface TimeDatum {
  year: number
  month: number
  day: number
  value: number
}

const format = timeFormat('%b %d')
const formatDate = date => format(date)

// accessors
const x = d => new Date(d.year, d.month - 1, d.day)
const y = d => d.value

interface Props {
  axisPrefix: string
  width: number
  height: number
  margin?: number
  data: TimeDatum[]
}

interface GradProps {
  width: number
  height: number
}

const Gradient: React.FC<GradProps> = ({ width, height }) => (
  <>
    <LinearGradient from="#ffd740" to="rgba(255, 215, 64, 0.5)" id="gradient" />
    {/* <rect width={width} height={height} fill="url(#gradient)" rx={14} /> */}
  </>
)

const ChartInner: React.FC<Props> = ({ axisPrefix, width, height, margin, data }) => {
  // bounds
  const xMax = width - margin - margin
  const yMax = height - margin - margin

  // scales
  const xScale = scaleBand({
    rangeRound: [0, xMax],
    domain: data.map(x),
    padding: 0.2
  })
  const yScale = scaleLinear({
    rangeRound: [yMax, 0],
    domain: [Math.min(...data.map(y)), Math.max(...data.map(y))]
  })

  return (
    <svg width={width} height={height}>
      <Gradient width={width} height={height} />
      <Group left={margin} top={margin}>
        <AxisLeft
          scale={yScale}
          numTicks={5}
          hideTicks
          hideAxisLine
          tickFormat={t => `${axisPrefix}${t}`}
        />

        {data.map((d, i) => {
          const amount = x(d)
          const barWidth = xScale.bandwidth()
          const barHeight = yMax - yScale(y(d))
          const barX = xScale(amount)
          const barY = yMax - barHeight
          return (
            <Bar
              key={`bar-${amount.getTime()}`}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill="url(#gradient)"
              rx={4}
            />
          )
        })}
      </Group>
    </svg>
  )
}

interface ChartProps {
  axisPrefix: string
  height: number
  margin: number
  data: TimeDatum[]
}
export const BarChart: React.FC<ChartProps> = ({ axisPrefix, height, margin, data }) => (
  <ParentSize>
    {({ width: w }) => {
      return (
        <ChartInner width={w} height={height} margin={margin} data={data} axisPrefix={axisPrefix} />
      )
    }}
  </ParentSize>
)
