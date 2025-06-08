import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
    Text,
    useTheme
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useTask } from '@/context/TaskContext';
import AddTaskModal from '../../components/AddTaskModal';

export default function TodayScreen() {
  const theme = useTheme();
  const { getTodayTasks, addTask } = useTask();
  const [showNotification, setShowNotification] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  
  const todayTasks = getTodayTasks();

  const handleAddTask = (title: string, description: string) => {
    addTask(title, description, new Date()); // Set to today for now
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f2f5fe',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: '#f2f5fe',
    },
      headerTitle: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#000000',
  },
    headerIcons: {
      flexDirection: 'row',
    },
    notificationBanner: {
      backgroundColor: '#4772fa',
      marginHorizontal: 16,
      marginBottom: 24,
      borderRadius: 8,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
      minHeight: 75,
    },
    notificationIcon: {
      marginRight: 16,
    },
      notificationText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
  },
  notificationSubtext: {
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      marginBottom: 150, // Move content further up from bottom
    },

    emptyStateIcon: {
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: 'normal',
      color: '#000000',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 13,
      color: '#8E8E93',
      textAlign: 'center',
    },
    fab: {
      position: 'absolute',
      margin: 24,
      right: 0,
      bottom: 5, // Even closer to bottom tabs
      backgroundColor: '#4772fa',
      borderRadius: 28,
      width: 56,
      height: 56,
      elevation: 4,
      shadowColor: '#4772fa',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
  });

  const CustomFAB = () => {
    const [scaleValue] = useState(new Animated.Value(1));

    const handlePressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableOpacity
        style={styles.fab}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => setShowAddTaskModal(true)}
        activeOpacity={0.9}
      >
        <Animated.View style={{
          transform: [{ scale: scaleValue }],
          width: 56,
          height: 56,
          backgroundColor: '#4772fa',
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <MaterialIcons name="add" size={28} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const EmptyStateIllustration = () => (
    <View style={styles.emptyStateIcon}>
      <Image 
        source={require('../../assets/images/no-task-icon.png')}
        style={{ width: 180, height: 180 }}
        resizeMode="contain"
      />
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {}}
            style={{ padding: 8 }}
          >
            <MaterialIcons name="density-medium" size={18} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inbox</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              onPress={() => {}}
              style={{ padding: 8 }}
            >
              <MaterialIcons name="more-horiz" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Notification Banner */}
                     {showNotification && (
             <View style={styles.notificationBanner}>
               <View style={styles.notificationIcon}>
                 <MaterialIcons name="inbox" size={32} color="#FFFFFF" />
               </View>
                                <View style={{ flex: 1, position: 'relative' }}>
                   <TouchableOpacity
                     onPress={() => setShowNotification(false)}
                     style={{
                       position: 'absolute',
                       top: -12,
                       right: -12,
                       padding: 8,
                       zIndex: 10,
                     }}
                   >
                     <MaterialIcons name="close" size={16} color="#B3C7FF" />
                   </TouchableOpacity>
                   <Text style={styles.notificationText}>
                     Inbox is a temporary hub
                   </Text>
                   <Text style={styles.notificationSubtext}>
                     Pop-up inspirations, unclassified tasks - all can be captured here.
                   </Text>
                 </View>
            </View>
          )}

          {/* Main Content */}
          <View style={styles.content}>
            <EmptyStateIllustration />
            <Text style={styles.emptyTitle}>No tasks</Text>
            <Text style={styles.emptySubtitle}>Captures all your tasks and ideas</Text>
          </View>
        </ScrollView>

        {/* Custom FAB with hover effect */}
        <CustomFAB />

        {/* Add Task Modal */}
        <AddTaskModal
          visible={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onSave={handleAddTask}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
} 