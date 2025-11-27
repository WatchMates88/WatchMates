import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

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
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
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
                      : 'https://via.placeholder.com/185x278/cccccc/666666?text=No+Image',
                  }}
                  style={styles.castImage}
                />
                <Text style={styles.castName} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.character && (
                  <Text style={styles.castCharacter} numberOfLines={1}>
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
                      : 'https://via.placeholder.com/342x513/cccccc/666666?text=No+Image',
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
    marginVertical: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
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
    borderRadius: 8,
    backgroundColor: colors.backgroundTertiary,
  },
  castName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.xs,
    width: 100,
  },
  castCharacter: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    width: 100,
  },
  posterImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: colors.backgroundTertiary,
  },
});