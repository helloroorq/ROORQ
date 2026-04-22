import { Image, ImageStyle } from 'react-native'

interface RoorqLogoProps {
  width?: number
  style?: ImageStyle
}

export function RoorqLogo({ width = 100, style }: RoorqLogoProps) {
  // Uses cream logo for dark backgrounds
  return (
    <Image
      source={require('../../../assets/images/roorq-logo-cream.png')}
      style={[{ width, height: width * 0.35, resizeMode: 'contain', tintColor: '#FFFFFF' }, style]}
    />
  )
}
