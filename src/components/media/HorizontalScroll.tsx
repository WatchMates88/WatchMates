import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { spacing, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
}

interface HorizontalScrollProps {
  title: string;
  data: any[];
  type: 'cast' | 'media';
  onItemPress?: (item: any) => void;
}

export const HorizontalScroll: React.FC<HorizontalScrollProps> = ({
  title,
  data,
  type,
  onItemPress,
}) => {
  const { colors } = useTheme();
  
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {data.map((item, index) => (
          <TouchableOpacity
            key={item.id || index}
            style={styles.item}
            onPress={() => onItemPress?.(item)}
            activeOpacity={0.7}
          >
            {type === 'cast' ? (
              <>
                <Image
                  source={{
                    uri: item.profile_path
                      ? `https://image.tmdb.org/t/p/w185${item.profile_path}`
                      : 'https://via.placeholder.com/185x278/333333/999999?text=No+Image',
                  }}
                  style={styles.castImage}
                />
                <Text style={[styles.castName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.character && (
                  <Text style={[styles.castCharacter, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.character}
                  </Text>
                )}
              </>
            ) : (
              <>
                <Image
                  source={{
                    uri: item.poster_path
                      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                      : 'https://via.placeholder.com/342x513/333333/999999?text=No+Image',
                  }}
                  style={styles.posterImage}
                />
              </>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  item: {
    marginRight: spacing.md,
  },
  castImage: {
    width: 100,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
  castName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.sm,
    width: 100,
    letterSpacing: -0.2,
  },
  castCharacter: {
    fontSize: 12,
    width: 100,
    marginTop: 2,
  },
  posterImage: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
});