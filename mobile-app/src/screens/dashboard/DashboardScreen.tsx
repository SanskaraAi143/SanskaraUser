import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { useDashboardData } from '../../hooks/useDashboardData';
import DashboardWelcome from '../../components/dashboard/DashboardWelcome';
import DashboardOverviewCards from '../../components/dashboard/DashboardOverviewCards';

const DashboardScreen = ({ navigation }: any) => {
  const {
    profile,
    weddingDetails,
    loading,
    error,
    daysUntilWedding,
    confirmedGuests,
    invitedGuests,
    totalBudget,
    spentBudget,
    completedTasks,
    totalTasks,
    shouldRedirectToOnboarding,
  } = useDashboardData();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  if (shouldRedirectToOnboarding) {
    // In a real app, you'd navigate to the onboarding screen.
    // For now, we'll just show a message.
    return (
      <View style={styles.centered}>
        <Text>You need to complete the onboarding process.</Text>
        {/* <Button title="Go to Onboarding" onPress={() => navigation.navigate('Onboarding')} /> */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DashboardWelcome
        profile={profile}
        userName={profile?.display_name}
        weddingDate={weddingDetails?.wedding_date}
        daysUntilWedding={daysUntilWedding}
      />
      <DashboardOverviewCards
        daysUntilWedding={daysUntilWedding}
        weddingDate={weddingDetails?.wedding_date}
        confirmedGuests={confirmedGuests}
        invitedGuests={invitedGuests}
        spentBudget={spentBudget}
        totalBudget={totalBudget}
        completedTasks={completedTasks}
        totalTasks={totalTasks}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardScreen;
