// src/screens/media/TrailerPlayerModal.tsx
// Simple in-app YouTube player

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLAYER_HEIGHT = SCREEN_WIDTH * (9/16); // 16:9 aspect

type Props = NativeStackScreenProps<RootStackParamList, 'TrailerPlayer'>;

export const TrailerPlayerModal: React.FC<Props> = ({ navigation, route }) => {
  const { videoKey, title = 'Trailer' } = route.params || {};
  const [playing, setPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header with Close Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeBtn} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* YouTube Player */}
      <View style={styles.playerContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#8B5CFF" />
          </View>
        )}
        
        <YoutubePlayer
          height={PLAYER_HEIGHT}
          width={SCREEN_WIDTH}
          videoId={videoKey}
          play={playing}
          onReady={() => setLoading(false)}
          onChangeState={(state: string) => {
            if (state === 'ended') {
              setPlaying(false);
            }
          }}
          webViewProps={{
            androidLayerType: 'hardware',
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 44,
  },

  playerContainer: {
    width: SCREEN_WIDTH,
    height: PLAYER_HEIGHT,
    backgroundColor: '#000000',
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    zIndex: 10,
  },
});