import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../types';
import { colors, spacing, typography } from '../../theme';
import { useAuthStore, useThemeStore } from '../../store';
import { authService } from '../../services/supabase/auth.service';
import { supabase } from '../../services/supabase/supabase.client';
import { useTheme } from '../../hooks/useTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, setUser } = useAuthStore();
  const { colors, isDark, toggleTheme } = useTheme();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleEditPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please grant camera roll permissions in your phone settings');
      return;
    }

    Alert.alert(
      'Choose Photo',
      'Select a source',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraStatus.status !== 'granted') {
              Alert.alert('Permission Needed', 'Please grant camera permissions');
              return;
            }
            
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });

            if (!result.canceled && user) {
              await uploadPhoto(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Photo Library',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });

            if (!result.canceled && user) {
              await uploadPhoto(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const uploadPhoto = async (uri: string) => {
    if (!user) return;

    try {
      setUploadingPhoto(true);
      const avatarUrl = await authService.uploadAvatar(user.id, uri);
      
      // Update local user state
      const updatedProfile = await authService.getProfile(user.id);
      if (updatedProfile) {
        setUser(updatedProfile);
      }
      
      Alert.alert('Success', 'Profile picture updated!');
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChangeUsername = () => {
    if (!user) return;

    Alert.prompt(
      'Change Username',
      `Current: @${user.username}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Update',
          onPress: async (newUsername?: string) => {
            if (!newUsername || newUsername.trim().length < 3) {
              Alert.alert('Error', 'Username must be at least 3 characters');
              return;
            }

            try {
              await authService.updateProfile(user.id, { username: newUsername.trim() });
              const updatedProfile = await authService.getProfile(user.id);
              if (updatedProfile) setUser(updatedProfile);
              Alert.alert('Success', 'Username updated!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update username');
            }
          },
        },
      ],
      'plain-text',
      user.username
    );
  };

  const handleChangeEmail = () => {
    Alert.prompt(
      'Change Email',
      'Enter your new email address',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Update',
          onPress: async (newEmail?: string) => {
            if (!newEmail || !newEmail.includes('@')) {
              Alert.alert('Error', 'Please enter a valid email');
              return;
            }

            try {
              const { error } = await supabase.auth.updateUser({ email: newEmail });
              if (error) throw error;
              Alert.alert('Success', 'Check your new email for verification link!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update email');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleChangePassword = () => {
    Alert.prompt(
      'Change Password',
      'Enter your new password (min 6 characters)',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Update',
          onPress: async (newPassword?: string) => {
            if (!newPassword || newPassword.length < 6) {
              Alert.alert('Error', 'Password must be at least 6 characters');
              return;
            }

            try {
              const { error } = await supabase.auth.updateUser({ password: newPassword });
              if (error) throw error;
              Alert.alert('Success', 'Password updated successfully!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update password');
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const handleConnectedAccounts = () => {
    Alert.alert('Coming Soon', 'Connected accounts management will be available soon!');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
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

  const handleSupport = async () => {
    const email = 'support@watchmates.app';
    const url = `mailto:${email}?subject=${encodeURIComponent('Support Request')}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Contact Support', `Email us at: ${email}`);
    });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
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
    loading = false,
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    onPress: () => void;
    destructive?: boolean;
    showChevron?: boolean;
    isLast?: boolean;
    loading?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingsRow, isLast && styles.settingsRowLast]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={loading}
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
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : showChevron ? (
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      ) : null}
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <SettingsSection title="Account">
          <SettingsRow
            icon="camera-outline"
            title="Edit Profile Picture"
            subtitle="Upload from camera or gallery"
            onPress={handleEditPhoto}
            loading={uploadingPhoto}
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

        <SettingsSection title="App Preferences">
          <ToggleRow
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Cinematic theme"
            value={isDark}
            onValueChange={toggleTheme}
          />
          <SettingsRow
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() => Alert.alert('Coming Soon')}
          />
          <SettingsRow
            icon="globe-outline"
            title="Region"
            subtitle="India"
            onPress={() => Alert.alert('Coming Soon')}
          />
          <SettingsRow
            icon="film-outline"
            title="Preferred Genres"
            onPress={() => Alert.alert('Coming Soon')}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Support & Legal">
          <SettingsRow
            icon="help-circle-outline"
            title="Contact Support"
            onPress={handleSupport}
          />
          <SettingsRow
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => Linking.openURL('https://watchmates.app/terms')}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={() => Linking.openURL('https://watchmates.app/privacy')}
          />
          <SettingsRow
            icon="code-outline"
            title="Open Source Licenses"
            onPress={() => Alert.alert('Open Source', 'React Native, Expo, Supabase, React Navigation, Zustand, Ionicons')}
            isLast
          />
        </SettingsSection>

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

        <View style={styles.footer}>
          <Text style={styles.footerVersion}>WatchMates v1.0.0</Text>
          <Text style={styles.footerText}>Made with 💜 for movie lovers</Text>
          <Text style={styles.footerCopyright}>© 2024 WatchMates</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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