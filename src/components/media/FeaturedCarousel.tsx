// src/components/media/FeaturedCarousel.tsx
// Premium: Enhanced visuals, better performance, smoother animations

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Movie, TVShow } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 340;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList) as React.ComponentType<any>;

type Props = {
  items: (Movie | TVShow)[];
  onPress: (item: Movie | TVShow) => void;
  parentHorizontalPadding?: number;
};

export const FeaturedCarousel: React.FC<Props> = ({ 
  items, 
  onPress, 
  parentHorizontalPadding = 0 
}) => {
  const listRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (!items || items.length <= 1) return;
    
    const timer = setInterval(() => {
      const next = (index + 1) % items.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setIndex(next);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [index, items.length]);

  // Memoize renderItem
  const renderItem = useCallback(({ item, index }: { item: Movie | TVShow; index: number }) => {
    const title = 'title' in item ? item.title : item.name;
    const backdropPath = (item as any).backdrop_path;

    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const translateX = scrollX.interpolate({
      inputRange,
      outputRange: [-60, 0, 60],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onPress(item)}
        style={styles.bannerContainer}
      >
        <Animated.Image
          source={{
            uri: `https://image.tmdb.org/t/p/w1280${backdropPath}`,
          }}
          style={[styles.bannerImage, { transform: [{ translateX }] }]}
        />

        {/* Premium Gradient Overlay */}
        <LinearGradient
          colors={[
            'rgba(0,0,0,0)',
            'rgba(0,0,0,0.3)',
            'rgba(0,0,0,0.85)',
          ]}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        />

        {/* Title Overlay (Optional - Premium Look) */}
        <View style={styles.titleOverlay}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [onPress, scrollX]);

  if (!items || items.length === 0) return null;

  return (
    <View style={[styles.wrapper, { marginHorizontal: -parentHorizontalPadding }]}>
      <AnimatedFlatList
        ref={listRef}
        data={items}
        keyExtractor={(item: Movie | TVShow) => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
        getItemLayout={(_: any, i: number) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * i,
          index: i,
        })}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(e: any) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setIndex(newIndex);
        }}
        renderItem={renderItem}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={3}
      />

      {/* Premium Pagination Dots */}
      <View style={styles.dotsWrapper}>
        {items.map((_, i) => {
          const isActive = index === i;
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: isActive ? 1 : 0.3,
                  transform: [{ scale: isActive ? 1.2 : 1 }],
                  width: isActive ? 24 : 8,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: SCREEN_WIDTH,
  },
  bannerContainer: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '115%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  dotsWrapper: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
});