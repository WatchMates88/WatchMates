import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Animated } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  segments,
  selectedIndex,
  onChange,
}) => {
  const [animation] = React.useState(new Animated.Value(selectedIndex));

  React.useEffect(() => {
    Animated.spring(animation, {
      toValue: selectedIndex,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [selectedIndex]);

  // Multiple pastel gradient options
  const getGradientColor = (index: number) => {
    const gradients = [
      { bg: '#E0BBE4', border: '#D4A5D4', shadow: '#C899CC', text: '#5A3A5C' }, // Lavender
      { bg: '#A8D8EA', border: '#8AC4D8', shadow: '#7AB5C9', text: '#3A5A6C' }, // Sky Blue
      { bg: '#FFD1DC', border: '#FFB8C6', shadow: '#FF9FB2', text: '#6C3A4A' }, // Pink
    ];
    return gradients[index % gradients.length];
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {segments.map((segment, index) => {
          const isSelected = index === selectedIndex;
          const gradient = getGradientColor(index);

          const scale = animation.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0.95, 1, 0.95],
            extrapolate: 'clamp',
          });

          const opacity = animation.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
          });

          return (
            <TouchableOpacity
              key={index}
              style={styles.segmentWrapper}
              onPress={() => onChange(index)}
              activeOpacity={0.9}
            >
              <Animated.View
                style={[
                  styles.segment,
                  isSelected && [
                    styles.segmentSelected,
                    { 
                      backgroundColor: gradient.bg,
                      borderColor: gradient.border,
                      transform: [{ scale }],
                    }
                  ],
                ]}
              >
                {isSelected && <View style={styles.glassOverlay} />}
                <Animated.Text 
                  style={[
                    styles.text, 
                    isSelected && [styles.textSelected, { color: gradient.text }],
                    { opacity }
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {segment}
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingVertical: 4,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 28,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  segmentWrapper: {
    flex: 1,
    marginHorizontal: 3,
  },
  segment: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    position: 'relative',
    overflow: 'hidden',
  },
  segmentSelected: {
    backgroundColor: '#E0BBE4',
    borderWidth: 1.5,
    borderColor: '#D4A5D4',
    ...Platform.select({
      ios: {
        shadowColor: '#C899CC',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
  },
  text: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: '500',
    color: 'rgba(100, 100, 120, 0.75)',
    letterSpacing: 0.3,
    zIndex: 1,
    textAlign: 'center',
  },
  textSelected: {
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});