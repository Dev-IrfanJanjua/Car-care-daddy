import { ImageResponse } from 'next/og'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 256,
          fontWeight: 700,
          background: '#0b0b0c',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#d4a24c',
        }}
      >
        C
      </div>
    ),
    { width: 512, height: 512 }
  )
}
