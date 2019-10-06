import { LinearGradient } from '@vx/gradient'
import { Group } from '@vx/group'
import { ParentSize } from '@vx/responsive'
import { scaleBand, scaleLinear, scaleOrdinal } from '@vx/scale'
import { Bar, BarGroupHorizontal } from '@vx/shape'
import { Text } from '@vx/text'
import React from 'react'
import { ClientProfile, ClientID } from '../../store/models/client'
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
  x: number
  y: number
  width: number
  height: number
  fill: string
  clientId: ClientID
  amountCents: number
  profile?: ClientProfile
}
const HoverBar: React.FC<BarProps> = ({
  x,
  y,
  width,
  height,
  fill,
  profile,
  amountCents,
  clientId
}) => {
  const [hovering, setHovering] = React.useState<boolean>(false)

  return (
    <>
      <Bar
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={4}
        onTouchStart={() => setHovering(true)}
        onTouchMove={() => setHovering(true)}
        onMouseMove={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        filter={hovering ? 'url(#glow)' : null}
      />
      <defs>
        <rect
          id="rect"
          x={x - height - 5}
          y={y}
          width={height}
          height={height}
          rx={height}
          fill="#ffffff"
        />
        <clipPath id="clip">
          <use xlinkHref="#rect" />
        </clipPath>
      </defs>
      <use xlinkHref="#rect" strokeWidth="2" stroke="white" />
      <a href={`/u/${clientId}`}>
        {profile.avatar_version && profile.avatar_version > 0 && (
          <image
            x={x - height - 5}
            y={y}
            xlinkHref={getAvatarImgSrc(profile, 'tiny', 'jpg')}
            width={height}
            height={height}
            clipPath="url(#clip)"
          />
        )}
        <Text
          y={y + height / 2}
          x={x + 5}
          width={width}
          verticalAnchor="middle"
          fontSize={hovering ? '1.1em' : '1em'}
          onTouchStart={() => setHovering(true)}
          onTouchMove={() => setHovering(true)}
          onMouseMove={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {profile.full_name}
        </Text>
      </a>
      <Text
        y={y + height / 2}
        x={x + width + 5}
        width={width}
        verticalAnchor="middle"
        textAnchor="start"
        fontSize={hovering ? '1.1em' : '1em'}
      >
        {`$${(amountCents / 100.0).toFixed(0)}`}
      </Text>
    </>
  )
}

const ChartInner: React.FC<Props> = ({ axisPrefix, width, height, margin, data }) => {
  // bounds
  const xMax = Math.max(width - margin - margin - 5, 50)
  const yMax = height
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
  xScale.rangeRound([xMax - margin - 5, margin])

  return (
    <svg width={width} height={height}>
      <Gradient width={width} height={height} />
      <GlowBlur />
      <Group top={0} left={margin + 15}>
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
                        <HoverBar
                          x={bar.x}
                          y={bar.y}
                          width={bar.width}
                          height={bar.height}
                          fill={bar.color}
                          clientId={data[barGroup.index].client_id}
                          profile={data[barGroup.index].profile}
                          amountCents={data[barGroup.index].amount_cents}
                        />
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
