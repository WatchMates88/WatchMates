// src/components/common/EmptyState.tsx
// Premium empty states with illustrations

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Film, Users, MessageCircle, Bookmark, Search } from 'lucide-react-native';
import { colors, spacing, typography } from '../../theme';

interface EmptyStateProps {
  type: 'feed' | 'comments' | 'watchlist' | 'followers' | 'search';
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  message,
  actionText,
  onAction,
}) => {
  const getConfig = () => {
    switch (type) {
      case 'feed':
        return {
          icon: <Film size={56} color="rgba(139, 92, 255, 0.3)" strokeWidth={1.5} />,
          defaultTitle: 'Your feed is quiet',
          defaultMessage: 'Follow movie lovers to see what they\'re watching and discover new content.',
          defaultAction: 'Find Friends',
        };
      case 'comments':
        return {
          icon: <MessageCircle size={56} color="rgba(139, 92, 255, 0.3)" strokeWidth={1.5} />,
          defaultTitle: 'No comments yet',
          defaultMessage: 'Be the first to share your thoughts on this post.',
          defaultAction: null,
        };
      case 'watchlist':
        return {
          icon: <Bookmark size={56} color="rgba(139, 92, 255, 0.3)" strokeWidth={1.5} />,
          defaultTitle: 'Your watchlist is empty',
          defaultMessage: 'Start adding movies and shows you want to watch.',
          defaultAction: 'Browse Movies',
        };
      case 'followers':
        return {
          icon: <Users size={56} color="rgba(139, 92, 255, 0.3)" strokeWidth={1.5} />,
          defaultTitle: 'No followers yet',
          defaultMessage: 'Share great reviews to attract fellow movie enthusiasts.',
          defaultAction: 'Create Post',
        };
      case 'search':
        return {
          icon: <Search size={56} color="rgba(139, 92, 255, 0.3)" strokeWidth={1.5} />,
          defaultTitle: 'No results found',
          defaultMessage: 'Try adjusting your search or filters.',
          defaultAction: null,
        };
    }
  };

  const config = getConfig();

  return (
    <View style={styles.container}>
      {/* Icon Circle */}
      <View style={styles.iconCircle}>
        {config.icon}
      </View>

      {/* Title */}
      <Text style={styles.title}>
        {title || config.defaultTitle}
      </Text>

      {/* Message */}
      <Text style={styles.message}>
        {message || config.defaultMessage}
      </Text>

      {/* Action Button */}
      {(actionText || config.defaultAction) && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.actionText}>
            {actionText || config.defaultAction}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56, // spacing['5xl'] = 56
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(139, 92, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: spacing.xl,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: '#000000',
    letterSpacing: 0.3,
  },
});