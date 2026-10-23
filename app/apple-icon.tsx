import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          background: '#0e2b25',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#b8935a',
        }}
      >
        CA
      </div>
    ),
    { ...size }
  )
}
