import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

type Props = {
  route: {
    params: {
      images: string[];
      index: number;
    };
  };
  navigation: any;
};

export const FullScreenImageViewer: React.FC<Props> = ({ navigation, route }) => {
  const { images, index } = route.params;
  const [currentIndex, setCurrentIndex] = useState(index);
  const scrollViewRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: index * width, y: 0, animated: false });
    }, 50);
  }, []);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, y: 0, animated: true });
      setCurrentIndex(nextIndex);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      scrollViewRef.current?.scrollTo({ x: prevIndex * width, y: 0, animated: true });
      setCurrentIndex(prevIndex);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {images.map((uri, idx) => (
          <View key={idx} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.image} resizeMode="contain" />
          </View>
        ))}
      </ScrollView>

      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.8}>
          <X size={22} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {currentIndex > 0 && (
        <TouchableOpacity onPress={handlePrev} style={styles.leftArrow} activeOpacity={0.8}>
          <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      )}

      {currentIndex < images.length - 1 && (
        <TouchableOpacity onPress={handleNext} style={styles.rightArrow} activeOpacity={0.8}>
          <ChevronRight size={28} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      )}

      {images.length > 1 && (
        <View style={styles.bottomBar}>
          <View style={styles.indicator}>
            <Text style={styles.indexText}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  imageWrapper: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: width,
    height: height,
  },

  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 20,
    zIndex: 100,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  leftArrow: {
    position: 'absolute',
    left: 20,
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    zIndex: 100,
  },
  rightArrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    zIndex: 100,
  },

  bottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  indicator: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  indexText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 0.5,
  },
});