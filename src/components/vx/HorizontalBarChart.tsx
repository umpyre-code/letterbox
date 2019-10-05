import { LinearGradient } from '@vx/gradient'
import { Group } from '@vx/group'
import { ParentSize } from '@vx/responsive'
import { scaleBand, scaleLinear, scaleOrdinal } from '@vx/scale'
import { Bar, BarGroupHorizontal } from '@vx/shape'
import { Text } from '@vx/text'
import React from 'react'
import { ClientProfile } from '../../store/models/client'
import { getAvatarImgSrc } from '../../store/client/types'

interface Datum {
  index: number
  client_id: string
  amount_cents: number
  profile?: ClientProfile
}

// accessors
const y0 = d => d.index

interface Props {
  axisPrefix: string
  width: number
  height: number
  margin?: number
  data: Datum[]
}

interface GradProps {
  width: number
  height: number
}

const Gradient: React.FC<GradProps> = ({ width, height }) => (
  <>
    <LinearGradient rotate={270} to="#ffd740" from="rgba(255, 215, 64, 0.5)" id="gradient" />
    {/* <rect width={width} height={height} fill="url(#gradient)" rx={14} /> */}
  </>
)

const ChartInner: React.FC<Props> = ({ axisPrefix, width, height, margin, data }) => {
  // bounds
  const xMax = width - margin - margin
  const yMax = height - margin - margin
  const keys = ['amount_cents']

  // scales
  const max = (arr, fn) => Math.max(...arr.map(fn))
  const xScale = scaleLinear({
    domain: [0, max(data, d => max(keys, key => d[key]))]
  })

  const y0Scale = scaleBand({
    domain: data.map(y0),
    padding: 0.2
  })
  const y1Scale = scaleBand({
    domain: keys,
    padding: 0.1
  })
  const color = scaleOrdinal({
    domain: keys,
    range: ['url(#gradient)']
  })

  // scales
  y0Scale.rangeRound([0, yMax])
  y1Scale.rangeRound([0, y0Scale.bandwidth()])
  xScale.rangeRound([xMax, 0])

  return (
    <svg width={width} height={height}>
      <Gradient width={width} height={height} />
      <Group top={margin} left={margin}>
        <BarGroupHorizontal
          data={data}
          keys={keys}
          width={xMax}
          y0={y0}
          y0Scale={y0Scale}
          y1Scale={y1Scale}
          xScale={xScale}
          color={color}
        >
          {barGroups => {
            return barGroups.map(barGroup => {
              return (
                <Group
                  key={`bar-group-horizontal-${barGroup.index}-${barGroup.y0}`}
                  top={barGroup.y0}
                >
                  {barGroup.bars.map(bar => {
                    return (
                      <React.Fragment key={`${barGroup.index}-${bar.index}-${bar.key}`}>
                        <Bar
                          x={bar.x}
                          y={bar.y}
                          width={bar.width}
                          height={bar.height}
                          fill={bar.color}
                          rx={4}
                        />
                        <defs>
                          <rect
                            id="rect"
                            x={bar.x - bar.height - 5}
                            y={bar.y}
                            width={bar.height}
                            height={bar.height}
                            rx={bar.height}
                            fill="#ffffff"
                          />
                          <clipPath id="clip">
                            <use xlinkHref="#rect" />
                          </clipPath>
                        </defs>
                        <use xlinkHref="#rect" strokeWidth="2" stroke="white" />
                        <a href={`/u/${data[barGroup.index].client_id}`}>
                          <image
                            x={bar.x - bar.height - 5}
                            y={bar.y}
                            xlinkHref={getAvatarImgSrc(data[barGroup.index].profile, 'tiny', 'jpg')}
                            width={bar.height}
                            height={bar.height}
                            clipPath="url(#clip)"
                          />
                          <Text
                            y={bar.y + bar.height / 2}
                            x={bar.x + 5}
                            width={bar.width}
                            verticalAnchor="middle"
                          >
                            {data[barGroup.index].profile.full_name}
                          </Text>
                        </a>
                        <Text
                          y={bar.y + bar.height / 2}
                          x={bar.x + bar.width - 5}
                          width={bar.width}
                          verticalAnchor="middle"
                          textAnchor="end"
                        >
                          {`$${(data[barGroup.index].amount_cents / 100.0).toFixed(0)}`}
                        </Text>
                      </React.Fragment>
                    )
                  })}
                </Group>
              )
            })
          }}
        </BarGroupHorizontal>
      </Group>
    </svg>
  )
}

interface ChartProps {
  axisPrefix: string
  height: number
  margin: number
  data: Datum[]
}
export const HorizontalBarChart: React.FC<ChartProps> = ({ axisPrefix, height, margin, data }) => (
  <ParentSize>
    {({ width: w }) => {
      return (
        <ChartInner width={w} height={height} margin={margin} data={data} axisPrefix={axisPrefix} />
      )
    }}
  </ParentSize>
)
