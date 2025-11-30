import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Animated } from 'react-native';
import { spacing, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';

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
  const { colors, isDark } = useTheme();
  const [animation] = React.useState(new Animated.Value(selectedIndex));

  React.useEffect(() => {
    Animated.spring(animation, {
      toValue: selectedIndex,
      useNativeDriver: false,
      tension: 68,
      friction: 12,
    }).start();
  }, [selectedIndex]);

  const segmentWidth = 100 / segments.length;
  const pillPosition = animation.interpolate({
    inputRange: segments.map((_, i) => i),
    outputRange: segments.map((_, i) => `${i * segmentWidth}%`),
  });

  if (!isDark) {
    // Light mode - keep original pastel design
    return (
      <View style={[styles.containerLight, { backgroundColor: 'rgba(255, 255, 255, 0.6)' }]}>
        {segments.map((segment, index) => {
          const isSelected = index === selectedIndex;
          return (
            <TouchableOpacity
              key={index}
              style={styles.segmentWrapperLight}
              onPress={() => onChange(index)}
              activeOpacity={0.9}
            >
              <Animated.View
                style={[
                  styles.segmentLight,
                  { backgroundColor: 'rgba(255, 255, 255, 0.35)' },
                  isSelected && [
                    styles.segmentSelectedLight,
                    { backgroundColor: '#E0BBE4', borderColor: '#D4A5D4' }
                  ],
                ]}
              >
                {isSelected && <View style={styles.glassOverlayLight} />}
                <Text 
                  style={[
                    styles.textLight, 
                    isSelected && [styles.textSelectedLight, { color: '#5A3A5C' }],
                    { color: 'rgba(100, 100, 120, 0.75)' }
                  ]}
                  numberOfLines={1}
                >
                  {segment}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // Dark mode - Premium Apple capsule style
  return (
    <View style={styles.outerContainer}>
      <View style={[
        styles.container,
        { 
          backgroundColor: colors.toggleContainer,
          borderColor: colors.primaryBorder,
        }
      ]}>
        {/* Animated pill background */}
        <Animated.View
          style={[
            styles.activePill,
            {
              width: `${segmentWidth}%`,
              left: pillPosition,
            }
          ]}
        >
          <LinearGradient
            colors={[colors.toggleActivePillGradientStart, colors.toggleActivePillGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pillGradient}
          />
        </Animated.View>

        {/* Segments */}
        {segments.map((segment, index) => {
          const isSelected = index === selectedIndex;
          
          return (
            <TouchableOpacity
              key={index}
              style={styles.segment}
              onPress={() => onChange(index)}
              activeOpacity={0.7}
            >
              <Animated.Text 
                style={[
                  styles.text,
                  { 
                    color: isSelected ? colors.text : colors.textTertiary,
                    fontWeight: isSelected ? '600' : '500',
                  }
                ]}
                numberOfLines={1}
              >
                {segment}
              </Animated.Text>
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
    borderRadius: 24,
    padding: 4,
    height: 46,
    borderWidth: 1,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activePill: {
    position: 'absolute',
    top: 4,
    height: 38,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#9E73FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  pillGradient: {
    flex: 1,
    borderRadius: 20,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    paddingHorizontal: 8,
  },
  text: {
    fontSize: typography.fontSize.sm,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  
  // Light mode styles (original pastel)
  containerLight: {
    flexDirection: 'row',
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
  segmentWrapperLight: {
    flex: 1,
    marginHorizontal: 3,
  },
  segmentLight: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  segmentSelectedLight: {
    borderWidth: 1.5,
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
  glassOverlayLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
  },
  textLight: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: '500',
    letterSpacing: 0.3,
    zIndex: 1,
    textAlign: 'center',
  },
  textSelectedLight: {
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});