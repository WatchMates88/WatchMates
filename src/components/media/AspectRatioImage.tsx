// src/components/media/AspectRatioImage.tsx

import React, { useState } from 'react';
import { Image, View, StyleSheet, ActivityIndicator } from 'react-native';

interface Props {
  uri: string;
  style?: any;
  maxWidth?: number;
  onPress?: () => void;
}

export const AspectRatioImage: React.FC<Props> = ({ uri, style, maxWidth = 320 }) => {
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    Image.getSize(
      uri,
      (width, height) => {
        const ratio = width / height;
        setAspectRatio(ratio);
        setLoading(false);
      },
      (error) => {
        console.error('Failed to get image size:', error);
        setAspectRatio(1);
        setLoading(false);
      }
    );
  }, [uri]);

  if (loading) {
    return (
      <View style={[styles.placeholder, { width: maxWidth, aspectRatio: 1 }]}>
        <ActivityIndicator size="small" color="rgba(255,255,255,0.3)" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[
        {
          width: '100%',
          aspectRatio,
          maxWidth,
        },
        style,
      ]}
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
});