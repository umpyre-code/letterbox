import { AxisLeft } from '@vx/axis'
import { LinearGradient } from '@vx/gradient'
import { Group } from '@vx/group'
import { ParentSize } from '@vx/responsive'
import { scaleBand, scaleLinear } from '@vx/scale'
import { Bar } from '@vx/shape'
import { Text } from '@vx/text'
import { timeFormat } from 'd3-time-format'
import React from 'react'

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

const GlowBlur: React.FC<{}> = () => (
  <filter id="glow">
    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
    <feMerge>
      <feMergeNode in="coloredBlur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
)
interface BarProps {
  barX: number
  barY: number
  width: number
  height: number
  value: string
}
const HoverBar: React.FC<BarProps> = ({ barX, barY, width, height, value }) => {
  const [hovering, setHovering] = React.useState<boolean>(false)
  return (
    <>
      <Bar
        x={barX}
        y={barY}
        width={width}
        height={height}
        fill="url(#gradient)"
        rx={4}
        onTouchStart={() => setHovering(true)}
        onTouchEnd={() => setHovering(false)}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        filter={hovering ? 'url(#glow)' : null}
      />
      {hovering && (
        <Text x={barX + width / 2} y={barY - 5} textAnchor="middle" verticalAnchor="end">
          {value}
        </Text>
      )}
    </>
  )
}

const ChartInner: React.FC<Props> = ({ axisPrefix, width, height, margin, data }) => {
  // bounds
  const xMax = width - margin
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
      <GlowBlur />
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
            <HoverBar
              key={`bar-${amount.getTime()}`}
              barX={barX}
              barY={barY}
              width={barWidth}
              height={barHeight}
              value={`${axisPrefix}${y(d)}`}
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
