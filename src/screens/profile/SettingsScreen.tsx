import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types';
import { colors, spacing, typography } from '../../theme';
import { useAuthStore } from '../../store';
import { authService } from '../../services/supabase/auth.service';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const [darkMode, setDarkMode] = useState(false);

  const handleEditPhoto = () => {
    Alert.alert('Coming Soon', 'Profile picture upload will be available soon!');
  };

  const handleChangeUsername = () => {
    Alert.alert('Coming Soon', 'Username change will be available soon!');
  };

  const handleChangeEmail = () => {
    Alert.alert('Coming Soon', 'Email change will be available soon!');
  };

  const handleChangePassword = () => {
    Alert.alert('Coming Soon', 'Password change will be available soon!');
  };

  const handleConnectedAccounts = () => {
    Alert.alert('Coming Soon', 'Connected accounts management will be available soon!');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Coming Soon', 'Account deletion will be available soon. Contact support for assistance.');
          },
        },
      ]
    );
  };

  const handleLanguage = () => {
    Alert.alert('Coming Soon', 'Language selection coming soon!');
  };

  const handleRegion = () => {
    Alert.alert('Coming Soon', 'Region selection coming soon!');
  };

  const handleGenrePreferences = () => {
    Alert.alert('Coming Soon', 'Genre preferences coming soon!');
  };

  const handleTerms = async () => {
    const url = 'https://watchmates.app/terms';
    Alert.alert('Terms of Service', 'Terms of Service will open in your browser.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: () => Linking.openURL(url).catch(() => {}) },
    ]);
  };

  const handlePrivacy = async () => {
    const url = 'https://watchmates.app/privacy';
    Alert.alert('Privacy Policy', 'Privacy Policy will open in your browser.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: () => Linking.openURL(url).catch(() => {}) },
    ]);
  };

  const handleLicenses = () => {
    Alert.alert('Open Source Licenses', 'This app uses the following open-source libraries:\n\n• React Native\n• Expo\n• Supabase\n• React Navigation\n• Zustand\n• Ionicons');
  };

  const handleSupport = async () => {
    const email = 'support@watchmates.app';
    const subject = 'Support Request';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Contact Support', `Email us at: ${email}`);
    });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              logout();
              navigation.goBack();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingsRow = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    destructive = false,
    showChevron = true,
    isLast = false,
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    onPress: () => void;
    destructive?: boolean;
    showChevron?: boolean;
    isLast?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingsRow, isLast && styles.settingsRowLast]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, destructive && styles.iconContainerDestructive]}>
        <Ionicons 
          name={icon as any} 
          size={20} 
          color={destructive ? colors.error : colors.primary} 
        />
      </View>
      <View style={styles.settingsRowText}>
        <Text style={[styles.settingsRowTitle, destructive && styles.settingsRowTitleDestructive]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingsRowSubtitle}>{subtitle}</Text>
        )}
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      )}
    </TouchableOpacity>
  );

  const ToggleRow = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onValueChange,
    isLast = false,
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    value: boolean; 
    onValueChange: (value: boolean) => void;
    isLast?: boolean;
  }) => (
    <View style={[styles.settingsRow, isLast && styles.settingsRowLast]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
      </View>
      <View style={styles.settingsRowText}>
        <Text style={styles.settingsRowTitle}>{title}</Text>
        {subtitle && (
          <Text style={styles.settingsRowSubtitle}>{subtitle}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary + '40' }}
        thumbColor={value ? colors.primary : '#f4f3f4'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 1. Account Settings */}
        <SettingsSection title="Account">
          <SettingsRow
            icon="camera-outline"
            title="Edit Profile Picture"
            subtitle="Upload or change your avatar"
            onPress={handleEditPhoto}
          />
          <SettingsRow
            icon="person-outline"
            title="Change Username"
            subtitle={`@${user?.username}`}
            onPress={handleChangeUsername}
          />
          <SettingsRow
            icon="mail-outline"
            title="Change Email"
            subtitle="Update your email address"
            onPress={handleChangeEmail}
          />
          <SettingsRow
            icon="lock-closed-outline"
            title="Change Password"
            onPress={handleChangePassword}
          />
          <SettingsRow
            icon="link-outline"
            title="Connected Accounts"
            subtitle="Google, Apple, Email"
            onPress={handleConnectedAccounts}
            isLast
          />
        </SettingsSection>

        {/* 2. App Preferences */}
        <SettingsSection title="App Preferences">
          <ToggleRow
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Switch between themes"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          <SettingsRow
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={handleLanguage}
          />
          <SettingsRow
            icon="globe-outline"
            title="Region"
            subtitle="India"
            onPress={handleRegion}
          />
          <SettingsRow
            icon="film-outline"
            title="Preferred Genres"
            subtitle="Refine recommendations"
            onPress={handleGenrePreferences}
            isLast
          />
        </SettingsSection>

        {/* 3. Support & Legal */}
        <SettingsSection title="Support & Legal">
          <SettingsRow
            icon="help-circle-outline"
            title="Contact Support"
            subtitle="Get help with your account"
            onPress={handleSupport}
          />
          <SettingsRow
            icon="document-text-outline"
            title="Terms of Service"
            onPress={handleTerms}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={handlePrivacy}
          />
          <SettingsRow
            icon="code-outline"
            title="Open Source Licenses"
            onPress={handleLicenses}
            isLast
          />
        </SettingsSection>

        {/* 4. Account Actions */}
        <SettingsSection title="Account Actions">
          <SettingsRow
            icon="log-out-outline"
            title="Logout"
            onPress={handleLogout}
            showChevron={false}
          />
          <SettingsRow
            icon="trash-outline"
            title="Delete Account"
            subtitle="This action cannot be undone"
            onPress={handleDeleteAccount}
            destructive={true}
            showChevron={false}
            isLast
          />
        </SettingsSection>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerVersion}>WatchMates v1.0.0</Text>
          <Text style={styles.footerText}>Made with 💜 for movie lovers</Text>
          <Text style={styles.footerCopyright}>© 2024 WatchMates. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingVertical: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsRowLast: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconContainerDestructive: {
    backgroundColor: colors.error + '15',
  },
  settingsRowText: {
    flex: 1,
  },
  settingsRowTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  settingsRowTitleDestructive: {
    color: colors.error,
  },
  settingsRowSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  footerVersion: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  footerCopyright: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
});