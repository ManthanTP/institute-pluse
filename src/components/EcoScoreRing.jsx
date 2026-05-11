import { getScoreGrade } from '../lib/carbonCalc'

export default function EcoScoreRing({ score = 0, size = 140, strokeWidth = 10, showLabel = true, animated = true }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const { grade, label, color } = getScoreGrade(score)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="hero-ring-wrapper" style={{ width: size, height: size }}>
        {animated && <div className="ring-pulse" />}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          <circle
            className="eco-ring"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: animated ? 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none' }}
          />
          {/* Score number */}
          <text
            x={size / 2}
            y={size / 2 - 4}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={size < 100 ? 24 : 36}
            fontWeight="800"
            fill={color}
            fontFamily="Inter, sans-serif"
          >
            {score}
          </text>
          <text
            x={size / 2}
            y={size / 2 + (size < 100 ? 14 : 20)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={size < 100 ? 9 : 11}
            fontWeight="600"
            fill="#94a3b8"
            fontFamily="Inter, sans-serif"
          >
            /100
          </text>
        </svg>
      </div>
      {showLabel && (
        <div className="text-center">
          <div className="font-semibold text-sm" style={{ color }}>
            {grade}
          </div>
          <div className="text-xs text-gray-500">{label}</div>
        </div>
      )}
    </div>
  )
}
