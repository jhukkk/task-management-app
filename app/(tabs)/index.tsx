import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, PanResponder, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Text,
  useTheme
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useFolder } from '@/context/FolderContext';
import { useTask } from '@/context/TaskContext';
import { Task } from '@/types/Task';
import AddFolderModal from '../../components/AddFolderModal';
import AddTaskModal from '../../components/AddTaskModal';
import DeleteFolderModal from '../../components/DeleteFolderModal';
import FullScreenTaskEditor from '../../components/FullScreenTaskEditor';

/**
 * Main task management screen with folder navigation, task creation, and animations
 * Features: folder sidebar, task completion animations, swipe-to-delete, priority system
 */
export default function TodayScreen() {
  const theme = useTheme();
  const { state, getTodayTasks, addTask, toggleTask, deleteTask, updateTask } = useTask();
  const { folders: allFolders, addFolder, deleteFolder } = useFolder();
  const [showNotification, setShowNotification] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showTaskEditor, setShowTaskEditor] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showMoveNotification, setShowMoveNotification] = useState(false);
  const [movedToFolder, setMovedToFolder] = useState<string>('');
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);
  const animatedValues = useRef<{[key: string]: Animated.Value}>({});
  const completedAnimatedValues = useRef<{[key: string]: Animated.Value}>({});
  const completedContainerAnim = useRef(new Animated.Value(1)).current;
  const sidebarAnim = useRef(new Animated.Value(0)).current;
  
  /**
   * Filter tasks based on selected folder with strict isolation
   */
  const getFolderTasks = () => {
    return state.tasks.filter(task => {
      const taskFolder = task.folder || 'inbox'; // Default to inbox if no folder
      return taskFolder === selectedFolder;
    });
  };

  // Task filtering for active and completed states
  const allTasks = getFolderTasks();
  const activeTasks = allTasks.filter(task => !task.completed);
  const completedTasks = allTasks.filter(task => task.completed);

  /**
   * Calculate task count for each folder for sidebar display
   */
  const getFolderTaskCount = (folderId: string) => {
    return state.tasks.filter(task => {
      const taskFolder = task.folder || 'inbox';
      return taskFolder === folderId;
    }).length;
  };

  // Dynamic folder data with task counts for sidebar
  const folders = allFolders.map(folder => ({
    ...folder,
    count: getFolderTaskCount(folder.id)
  }));

  const selectedFolderData = folders.find(folder => folder.id === selectedFolder);

  /**
   * Check if a folder can be deleted (not a default folder)
   */
  const canDeleteFolder = (folderId: string) => {
    const protectedFolders = ['inbox', 'personal', 'work', 'shopping', 'health', 'finance'];
    return !protectedFolders.includes(folderId);
  };

  /**
   * Get folder data for deletion modal
   */
  const getFolderToDeleteData = () => {
    if (!folderToDelete) return { name: '', count: 0 };
    const folder = folders.find(f => f.id === folderToDelete);
    return {
      name: folder?.name || '',
      count: folder?.count || 0
    };
  };

  /**
   * Handle folder selection from sidebar
   */
  const handleFolderSelect = (folderId: string) => {
    setSelectedFolder(folderId);
    toggleSidebar();
  };

  /**
   * Initialize animation values for tasks when they change
   */
  useEffect(() => {
    // Initialize animated values for active tasks
    allTasks.forEach(task => {
      if (!animatedValues.current[task.id]) {
        animatedValues.current[task.id] = new Animated.Value(1);
      }
    });
    
    // Initialize animated values for completed tasks
    completedTasks.forEach(task => {
      if (!completedAnimatedValues.current[task.id]) {
        completedAnimatedValues.current[task.id] = new Animated.Value(1);
      }
    });
  }, [allTasks, completedTasks, isCompletedExpanded]);

  /**
   * Add new task to current folder or specified folder
   */
  const handleAddTask = (title: string, description: string, priority?: string, folder?: string) => {
    const targetFolder = folder || selectedFolder;
    addTask(title, description, new Date(), priority, targetFolder);
  };

  /**
   * Open task editor for editing existing task
   */
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskEditor(true);
  };

  /**
   * Close task editor and reset editing state
   */
  const handleCloseTaskEditor = () => {
    setShowTaskEditor(false);
    setEditingTask(null);
  };

  /**
   * Handle folder change from task editor with notification
   */
  const handleFolderChangeInEditor = (newFolder: string) => {
    setSelectedFolder(newFolder);
    
    // Show move notification
    const folderData = folders.find(f => f.id === newFolder);
    if (folderData) {
      setMovedToFolder(folderData.name);
      setShowMoveNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowMoveNotification(false);
      }, 3000);
    }
  };

  /**
   * Add new folder and navigate to it
   */
  const handleAddFolder = (name: string) => {
    const newFolderId = addFolder(name);
    // Auto-navigate to newly created folder
    setSelectedFolder(newFolderId);
    toggleSidebar();
  };

  /**
   * Initiate folder deletion with confirmation
   */
  const handleDeleteFolder = (folderId: string) => {
    setFolderToDelete(folderId);
    setShowDeleteFolderModal(true);
  };

  /**
   * Confirm folder deletion and move tasks to inbox
   */
  const handleConfirmDeleteFolder = () => {
    if (!folderToDelete) return;

    deleteFolder(folderToDelete, (deletedFolderId) => {
      // Move all tasks from deleted folder to inbox
      const tasksToMove = state.tasks.filter(task => 
        task.folder === deletedFolderId
      );
      
      tasksToMove.forEach(task => {
        updateTask(task.id, { folder: 'inbox' });
      });
    });

    // If currently viewing the deleted folder, switch to inbox
    if (selectedFolder === folderToDelete) {
      setSelectedFolder('inbox');
    }

    // Reset deletion state
    setFolderToDelete(null);
    setShowDeleteFolderModal(false);
  };

  /**
   * Toggle sidebar with smooth animation
   */
  const toggleSidebar = () => {
    const toValue = showSidebar ? 0 : 1;
    setShowSidebar(!showSidebar);
    
    Animated.timing(sidebarAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Get priority color for visual indication
   */
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return '#FF4444';
      case 'medium': return '#FFA500';
      case 'low': return '#4772fa';
      case 'none':
      default: return '#cccccc';
    }
  };

  /**
   * Handle task completion toggle with smooth gliding animation between sections
   */
  const handleToggleTask = (taskId: string) => {
    const animValue = animatedValues.current[taskId];
    const completedAnimValue = completedAnimatedValues.current[taskId];
    
    // Find task and determine animation direction
    const task = allTasks.find(t => t.id === taskId);
    const isCurrentlyCompleted = task?.completed || false;
    
    // Select appropriate animation value for gliding effect
    const glideAnimation = isCurrentlyCompleted 
      ? animValue  // Moving from completed to active
      : completedAnimValue || animValue; // Moving from active to completed
    
    // Start vertical glide out animation
    Animated.timing(glideAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Toggle task after animation completes
      toggleTask(taskId);
      
      // Initialize animation for new section after delay
      setTimeout(() => {
        if (isCurrentlyCompleted) {
          // Task moving to active section
          if (animValue) {
            animValue.setValue(0);
            Animated.spring(animValue, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }).start();
          }
        } else {
          // Task moving to completed section
          const newCompletedAnimValue = completedAnimatedValues.current[taskId] || new Animated.Value(0);
          completedAnimatedValues.current[taskId] = newCompletedAnimValue;
          
          if (isCompletedExpanded) {
            Animated.spring(newCompletedAnimValue, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }).start();
          } else {
            newCompletedAnimValue.setValue(0);
          }
        }
      }, 150);
    });
  };

  /**
   * Toggle completed tasks section with staggered animations
   */
  const handleCompletedToggle = () => {
    const newExpanded = !isCompletedExpanded;
    
    if (newExpanded) {
      // Expanding - show container and animate items row by row
      setIsCompletedExpanded(true);
      
      // Start container animation
      Animated.spring(completedContainerAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
      
      // Staggered item animations for smooth row-by-row reveal
      completedTasks.forEach((task, index) => {
        const animValue = completedAnimatedValues.current[task.id];
        if (animValue) {
          animValue.setValue(0);
          Animated.spring(animValue, {
            toValue: 1,
            tension: 120,
            friction: 8,
            delay: index * 40, // 40ms stagger for smooth effect
            useNativeDriver: true,
          }).start();
        }
      });
    } else {
      // Collapsing - hide items and container with staggered timing
      const totalDelay = (completedTasks.length - 1) * 25;
      
      // Start container collapse after items begin disappearing
      Animated.timing(completedContainerAnim, {
        toValue: 0,
        duration: 300 + totalDelay,
        delay: 50,
        useNativeDriver: true,
      }).start();
      
      // Staggered item collapse
      const animations = completedTasks.map((task, index) => {
        const animValue = completedAnimatedValues.current[task.id];
        return animValue ? Animated.timing(animValue, {
          toValue: 0,
          duration: 200,
          delay: index * 25, // 25ms stagger for smooth collapse
          useNativeDriver: true,
        }) : null;
      }).filter((anim): anim is Animated.CompositeAnimation => anim !== null);
      
      Animated.parallel(animations).start(() => {
        setIsCompletedExpanded(false);
      });
    }
  };

  const TaskItem = ({ task, isCompleted, isLast }: { task: any, isCompleted: boolean, isLast: boolean }) => {
    const animValue = animatedValues.current[task.id] || new Animated.Value(1);
    const completedAnimValue = isCompleted ? (completedAnimatedValues.current[task.id] || new Animated.Value(1)) : null;
    
    // Swipe gesture handling
    const translateX = useRef(new Animated.Value(0)).current;
    
    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes that are significant
        const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;
        const isSignificantSwipe = Math.abs(gestureState.dx) > 10;
        return isHorizontalSwipe && isSignificantSwipe;
      },
      onPanResponderGrant: (evt, gestureState) => {
        // Prepare for gesture by stopping any existing animations
        translateX.stopAnimation();
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow left swipes (negative dx) for delete action
        if (gestureState.dx <= 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Check if swipe was far enough to delete
        const shouldDelete = gestureState.dx < -120;
        
        if (shouldDelete) {
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
      onPanResponderTerminate: () => {
        // Handle termination - snap back
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      },
    });
    
    const animationStyle = isCompleted && completedAnimValue ? {
      opacity: completedAnimValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      transform: [
        {
          scale: completedAnimValue.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [0.85, 0.95, 1],
          })
        },
        {
          translateY: completedAnimValue.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0], // Glide down from active section
          })
        }
      ]
    } : {
      opacity: animValue.interpolate({
        inputRange: [0, 0.3, 1],
        outputRange: [0, 0.5, 1],
      }),
      transform: [
        {
          translateY: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-15, 0], // Glide up from completed section
          })
        },
        {
          scale: animValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.9, 0.95, 1],
          })
        }
      ]
    };

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
          animationStyle
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
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={isCompleted ? "check-box" : "check-box-outline-blank"}
              size={20}
              color={isCompleted ? "#cccccc" : getPriorityColor(task.priority)}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.taskTextContainer}
            onPress={() => handleEditTask(task)}
            activeOpacity={0.7}
          >
            <Text style={[styles.taskText, isCompleted && styles.taskTextCompleted]}>
              {task.title}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
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
    fontSize: 18,
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
    tasksList: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    tasksContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      marginBottom: 8,
      overflow: 'hidden',
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
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
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
    taskText: {
      flex: 1,
      fontSize: 16,
      color: '#333333',
    },
    taskTextCompleted: {
      textDecorationLine: 'line-through',
      color: '#999999',
    },
    completedSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    completedSectionHeaderCollapsed: {
      borderBottomWidth: 0,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    },
    completedSectionHeaderStandalone: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: 'transparent',
    },
    completedTitle: {
      fontSize: 13,
      fontWeight: 'normal',
      color: '#000000',
    },
    completedCount: {
      fontSize: 12,
      fontWeight: 'normal',
      color: '#8E8E93',
    },
    completedHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    expandArrow: {
      marginLeft: 8,
    },
    sidebarOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
    },
    sidebarBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    sidebar: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: 300,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 10,
    },
    sidebarHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingTop: 60, // Account for status bar
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    sidebarTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333333',
    },
    closeButton: {
      padding: 8,
    },
    folderList: {
      flex: 1,
      paddingTop: 8,
    },
    folderItemContainer: {
      marginHorizontal: 12,
    },
    folderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
    },
    activeFolderItem: {
      backgroundColor: '#f0f4ff',
    },
    folderItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    folderItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    folderIcon: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    folderName: {
      fontSize: 14,
      color: '#333333',
    },
    activeFolderName: {
      color: '#4772fa',
      fontWeight: '500',
    },
    folderCountContainer: {
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
    },
    folderCount: {
      fontSize: 12,
      color: '#999999',
      fontWeight: '500',
    },
    activeFolderCount: {
      color: '#4772fa',
    },
    sidebarFooter: {
      padding: 20,
    },
    addFolderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    addFolderText: {
      marginLeft: 8,
      fontSize: 14,
      color: '#4772fa',
      fontWeight: '500',
    },
    taskTextContainer: {
      flex: 1,
    },
    moveNotificationOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: 100, // Above the FAB
      pointerEvents: 'none', // Allow touches to pass through
      zIndex: 1001,
    },
    moveNotification: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 24,
      marginHorizontal: 20,
    },
    moveNotificationIcon: {
      marginRight: 8,
    },
    moveNotificationText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#FFFFFF',
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
            onPress={toggleSidebar}
            style={{ padding: 8 }}
          >
            <MaterialIcons name="density-medium" size={18} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedFolderData?.name || 'Inbox'}</Text>
          <View style={styles.headerIcons} />
        </View>

        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Notification Banner - only show for inbox */}
          {showNotification && selectedFolder === 'inbox' && (
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
          {allTasks.length === 0 ? (
            <View style={styles.content}>
              <EmptyStateIllustration />
              <Text style={styles.emptyTitle}>No tasks</Text>
              <Text style={styles.emptySubtitle}>Captures all your tasks and ideas</Text>
            </View>
          ) : (
            <View style={styles.tasksList}>
              {/* Active Tasks */}
              {activeTasks.length > 0 && (
                <View style={styles.tasksContainer}>
                  {activeTasks.map((task, index) => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      isCompleted={false} 
                      isLast={index === activeTasks.length - 1}
                    />
                  ))}
                </View>
              )}

              {/* Completed Section */}
              {completedTasks.length > 0 && (
                <View style={[styles.tasksContainer, { marginTop: 16 }]}>
                  {/* Header always visible inside white container */}
                  <TouchableOpacity
                    style={[
                      styles.completedSectionHeader,
                      !isCompletedExpanded && styles.completedSectionHeaderCollapsed
                    ]}
                    onPress={handleCompletedToggle}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.completedTitle}>Completed</Text>
                    <View style={styles.completedHeaderRight}>
                      <Text style={styles.completedCount}>{completedTasks.length}</Text>
                    <MaterialIcons
                        name={isCompletedExpanded ? "keyboard-arrow-down" : "keyboard-arrow-up"} 
                        size={16} 
                        color="#8E8E93" 
                        style={styles.expandArrow}
                    />
                    </View>
                  </TouchableOpacity>
                  
                  {/* Animated container for tasks only */}
                  <Animated.View
                    style={{
                      opacity: completedContainerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                      transform: [
                        {
                          scale: completedContainerAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.95, 1],
                          })
                        },
                        {
                          translateY: completedContainerAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [8, 0],
                          })
                        }
                      ]
                    }}
                  >
                    {/* Only show the tasks when expanded */}
                    {isCompletedExpanded && completedTasks.map((task, index) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        isCompleted={true} 
                        isLast={index === completedTasks.length - 1}
                      />
                    ))}
                  </Animated.View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Custom FAB with hover effect */}
        <CustomFAB />

        {/* Sidebar */}
        {showSidebar && (
          <Animated.View
            style={[
              styles.sidebarOverlay,
              {
                opacity: sidebarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              }
            ]}
          >
            <TouchableOpacity
              style={styles.sidebarBackdrop}
              onPress={toggleSidebar}
              activeOpacity={1}
            />
            <Animated.View
              style={[
                styles.sidebar,
                {
                  transform: [
                    {
                      translateX: sidebarAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-300, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* Sidebar Header */}
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>Folders</Text>
              </View>

              {/* Folder List */}
              <ScrollView style={styles.folderList} showsVerticalScrollIndicator={false}>
                {folders.map((folder) => (
                  <View key={folder.id} style={styles.folderItemContainer}>
                    <TouchableOpacity
                      style={[
                        styles.folderItem,
                        folder.id === selectedFolder && styles.activeFolderItem
                      ]}
                      onPress={() => handleFolderSelect(folder.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.folderItemLeft}>
                        <View style={styles.folderIcon}>
                          <MaterialIcons 
                            name={folder.icon as any} 
                            size={20} 
                            color={folder.id === selectedFolder ? "#4772fa" : "#333333"} 
                          />
                        </View>
                        <Text style={[
                          styles.folderName,
                          folder.id === selectedFolder && styles.activeFolderName
                        ]}>
                          {folder.name}
                        </Text>
                      </View>
                      <View style={styles.folderItemRight}>
                        {/* Hoverable count area with delete functionality */}
                        <TouchableOpacity
                          style={styles.folderCountContainer}
                          onPressIn={() => canDeleteFolder(folder.id) && setHoveredFolder(folder.id)}
                          onPressOut={() => setHoveredFolder(null)}
                          onPress={() => canDeleteFolder(folder.id) && hoveredFolder === folder.id && handleDeleteFolder(folder.id)}
                          activeOpacity={1}
                        >
                          {hoveredFolder === folder.id && canDeleteFolder(folder.id) ? (
                            <MaterialIcons name="close" size={16} color="#FF4444" />
                          ) : (
                            <Text style={[
                              styles.folderCount,
                              folder.id === selectedFolder && styles.activeFolderCount
                            ]}>
                              {folder.count}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              {/* Sidebar Footer */}
              <View style={styles.sidebarFooter}>
                <TouchableOpacity 
                  style={styles.addFolderButton}
                  onPress={() => setShowAddFolderModal(true)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="add" size={20} color="#4772fa" />
                  <Text style={styles.addFolderText}>Add Folder</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        )}

        {/* Add Task Modal */}
        <AddTaskModal
          visible={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          currentFolder={selectedFolder}
          onSave={handleAddTask}
        />

        {/* Full Screen Task Editor */}
        <FullScreenTaskEditor
          visible={showTaskEditor}
          onClose={handleCloseTaskEditor}
          initialTitle={editingTask?.title || ''}
          initialDescription={editingTask?.description || ''}
          initialPriority={editingTask?.priority || 'none'}
          currentFolder={editingTask?.folder || selectedFolder}
          taskId={editingTask?.id}
          onSave={() => {}} // Not used since FullScreenTaskEditor handles saving directly
          onFolderChange={handleFolderChangeInEditor}
        />

        {/* Move Notification Popup */}
        {showMoveNotification && (
          <View style={styles.moveNotificationOverlay}>
            <View style={styles.moveNotification}>
              <MaterialIcons name="folder" size={20} color="#FFFFFF" style={styles.moveNotificationIcon} />
              <Text style={styles.moveNotificationText}>
                Moved to {movedToFolder}
              </Text>
            </View>
          </View>
        )}

        {/* Add Folder Modal */}
        <AddFolderModal
          visible={showAddFolderModal}
          onClose={() => setShowAddFolderModal(false)}
          onSave={handleAddFolder}
        />

        {/* Delete Folder Modal */}
        <DeleteFolderModal
          visible={showDeleteFolderModal}
          onClose={() => {
            setShowDeleteFolderModal(false);
            setFolderToDelete(null);
          }}
          onConfirm={handleConfirmDeleteFolder}
          folderName={getFolderToDeleteData().name}
          taskCount={getFolderToDeleteData().count}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
} 