import React from 'react';
import { Image } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import SvgImage from './SvgImage';

const MyImage = React.forwardRef((props, ref) => {
  const { onError } = props;

  const source = resolveAssetSource(props.source);

  if (!source || !source.uri || !source.uri.match('.svg')) {
    return <Image ref={ref} {...props} />;
  }


  const style = props.style || {};

  if (source.__packager_asset && typeof style !== 'number') {
    if (!style.width) {
      style.width = source.width;
    }
    if (!style.height) {
      style.height = source.height;
    }
  }

  return (
    <SvgImage
      ref={ref}
      source={source}
      style={style}
      onError={onError}
      {...props}
    />
  );

});

export default MyImage;
