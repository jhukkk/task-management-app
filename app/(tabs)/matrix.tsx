import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, PanResponder, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useTask } from '@/context/TaskContext';
import { Task } from '@/types/Task';
import Flag2Icon from '../../components/Flag2Icon';

export default function MatrixScreen() {
  const { state, toggleTask, deleteTask, updateTask } = useTask();
  const animatedValues = useRef<{[key: string]: Animated.Value}>({});

  // Get all tasks and sort by priority
  const getPriorityOrder = (priority?: string) => {
    switch (priority) {
      case 'high': return 1;
      case 'medium': return 2;
      case 'low': return 3;
      case 'none':
      default: return 4;
    }
  };

  const sortedTasks = state.tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      const priorityA = getPriorityOrder(a.priority);
      const priorityB = getPriorityOrder(b.priority);
      return priorityA - priorityB;
    });

  // Initialize animated values for tasks
  useEffect(() => {
    sortedTasks.forEach(task => {
      if (!animatedValues.current[task.id]) {
        animatedValues.current[task.id] = new Animated.Value(1);
      }
    });
  }, [sortedTasks]);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return '#FF4444';
      case 'medium': return '#FFA500';
      case 'low': return '#4772fa';
      case 'none':
      default: return '#cccccc';
    }
  };

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      case 'none':
      default: return 'No Priority';
    }
  };

  const handleToggleTask = (taskId: string) => {
    const animValue = animatedValues.current[taskId];
    
    // Animate out then toggle
    Animated.timing(animValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      toggleTask(taskId);
    });
  };

  const TaskItem = ({ task, isLast }: { task: Task, isLast: boolean }) => {
    const animValue = animatedValues.current[task.id] || new Animated.Value(1);
    
    // Swipe gesture handling
    const translateX = useRef(new Animated.Value(0)).current;
    
    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 100;
        },
        onPanResponderGrant: () => {
          // No need to set offset for this simple implementation
        },
        onPanResponderMove: (evt, gestureState) => {
          // Only allow left swipes (negative dx)
          if (gestureState.dx <= 0) {
            translateX.setValue(gestureState.dx);
          }
        },
        onPanResponderRelease: (evt, gestureState) => {
          // If swiped more than 120px to the left, delete the task
          if (gestureState.dx < -120) {
            // Animate out and delete
            Animated.timing(translateX, {
              toValue: -400,
              duration: 300,
              useNativeDriver: false,
            }).start(() => {
              deleteTask(task.id);
            });
          } else {
            // Snap back to original position
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: false,
              tension: 100,
              friction: 8,
            }).start();
          }
        },
      })
    ).current;

    // Calculate red background opacity based on swipe distance
    const redBackgroundOpacity = translateX.interpolate({
      inputRange: [-200, -50, 0],
      outputRange: [1, 0.3, 0],
      extrapolate: 'clamp',
    });
    
    return (
      <Animated.View 
        style={[
          styles.taskItemContainer,
          isLast && styles.lastTaskItem,
          {
            opacity: animValue,
            transform: [
              {
                scale: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                })
              }
            ]
          }
        ]}
      >
        {/* Red delete background */}
        <Animated.View 
          style={[
            styles.deleteBackground,
            {
              opacity: redBackgroundOpacity,
            }
          ]}
        >
          <MaterialIcons name="delete" size={24} color="#FFFFFF" />
        </Animated.View>
        
        {/* Swipeable task content */}
        <Animated.View
          style={[
            styles.taskItem,
            {
              transform: [{ translateX }],
            }
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            style={styles.taskCheckbox}
            onPress={() => handleToggleTask(task.id)}
          >
            <MaterialIcons
              name="check-box-outline-blank"
              size={20}
              color={getPriorityColor(task.priority)}
            />
          </TouchableOpacity>
          <View style={styles.taskContent}>
            <Text style={styles.taskText}>
              {task.title}
            </Text>
            <Text style={[styles.priorityLabel, { color: getPriorityColor(task.priority) }]}>
              {getPriorityLabel(task.priority)}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    );
  };

  // Group tasks by priority for better visual organization
  const groupedTasks = {
    high: sortedTasks.filter(task => task.priority === 'high'),
    medium: sortedTasks.filter(task => task.priority === 'medium'),
    low: sortedTasks.filter(task => task.priority === 'low'),
    none: sortedTasks.filter(task => !task.priority || task.priority === 'none'),
  };

  const EmptyStateIllustration = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialIcons name="checklist" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>No active tasks</Text>
      <Text style={styles.emptySubtitle}>Tasks will appear here organized by priority</Text>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Priority Matrix</Text>
          <Text style={styles.headerSubtitle}>Tasks organized by priority</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {sortedTasks.length === 0 ? (
            <EmptyStateIllustration />
          ) : (
            <View style={styles.tasksList}>
              {/* High Priority Tasks */}
              {groupedTasks.high.length > 0 && (
                <View style={styles.prioritySection}>
                  <View style={styles.prioritySectionHeader}>
                    <Flag2Icon size={18} color="#FF4444" filled={true} />
                    <Text style={[styles.prioritySectionTitle, { color: '#FF4444' }]}>
                      High Priority ({groupedTasks.high.length})
                    </Text>
                  </View>
                  <View style={styles.tasksContainer}>
                    {groupedTasks.high.map((task, index) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        isLast={index === groupedTasks.high.length - 1}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Medium Priority Tasks */}
              {groupedTasks.medium.length > 0 && (
                <View style={styles.prioritySection}>
                  <View style={styles.prioritySectionHeader}>
                    <Flag2Icon size={18} color="#FFA500" filled={true} />
                    <Text style={[styles.prioritySectionTitle, { color: '#FFA500' }]}>
                      Medium Priority ({groupedTasks.medium.length})
                    </Text>
                  </View>
                  <View style={styles.tasksContainer}>
                    {groupedTasks.medium.map((task, index) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        isLast={index === groupedTasks.medium.length - 1}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Low Priority Tasks */}
              {groupedTasks.low.length > 0 && (
                <View style={styles.prioritySection}>
                  <View style={styles.prioritySectionHeader}>
                    <Flag2Icon size={18} color="#4772fa" filled={true} />
                    <Text style={[styles.prioritySectionTitle, { color: '#4772fa' }]}>
                      Low Priority ({groupedTasks.low.length})
                    </Text>
                  </View>
                  <View style={styles.tasksContainer}>
                    {groupedTasks.low.map((task, index) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        isLast={index === groupedTasks.low.length - 1}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* No Priority Tasks */}
              {groupedTasks.none.length > 0 && (
                <View style={styles.prioritySection}>
                  <View style={styles.prioritySectionHeader}>
                    <Flag2Icon size={18} color="#cccccc" filled={false} />
                    <Text style={[styles.prioritySectionTitle, { color: '#cccccc' }]}>
                      No Priority ({groupedTasks.none.length})
                    </Text>
                  </View>
                  <View style={styles.tasksContainer}>
                    {groupedTasks.none.map((task, index) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        isLast={index === groupedTasks.none.length - 1}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f5fe',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f2f5fe',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  tasksList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  prioritySection: {
    marginBottom: 24,
  },
  prioritySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  prioritySectionTitle: {
    fontSize: 14,
    fontWeight: 'normal',
    marginLeft: 8,
  },
  tasksContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  taskItemContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  lastTaskItem: {
    borderBottomWidth: 0,
  },
  taskCheckbox: {
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'normal',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  },
}); 