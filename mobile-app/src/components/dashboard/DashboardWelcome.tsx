import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserProfile } from '../../services/api/userApi';

interface DashboardWelcomeProps {
  profile: UserProfile | null;
  userName?: string | null;
  weddingDate?: string | null;
  daysUntilWedding: number | string;
}

const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({
  profile,
  userName,
  weddingDate,
  daysUntilWedding,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome back, {userName || profile?.display_name || 'User'}!</Text>
      {weddingDate && (
        <Text style={styles.countdownText}>
          {daysUntilWedding} days until your wedding
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 16,
    color: '#666',
  },
});

export default DashboardWelcome;
