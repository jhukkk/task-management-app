import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useFolder } from '../context/FolderContext';
import Flag2Icon from './Flag2Icon';
import FolderDropdown from './FolderDropdown';
import FullScreenTaskEditor from './FullScreenTaskEditor';
import PanZoomIcon from './PanZoomIcon';
import PriorityDropdown from './PriorityDropdown';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  currentFolder?: string;
  onSave: (title: string, description: string, priority?: string, folder?: string) => void;
}

/**
 * Modal component for adding new tasks with priority, folder selection, and optional full-screen editing
 */
export default function AddTaskModal({ visible, onClose, currentFolder = 'inbox', onSave }: AddTaskModalProps) {
  const { folders } = useFolder();
  
  // Task content state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // UI state management
  const [showDateRepeat, setShowDateRepeat] = useState(false); // Controls full-screen editor
  const [slideAnim] = useState(new Animated.Value(0)); // Bottom sheet slide animation
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  
  // Selection state
  const [selectedPriority, setSelectedPriority] = useState('none');
  const [selectedFolder, setSelectedFolder] = useState(currentFolder);
  
  // Notification state for folder changes
  const [showMoveNotification, setShowMoveNotification] = useState(false);
  const [movedToFolder, setMovedToFolder] = useState<string>('');

  // Priority configuration
  const priorities = [
    { id: 'high', label: 'High Priority', color: '#FF4444' },
    { id: 'medium', label: 'Medium Priority', color: '#FFA500' },
    { id: 'low', label: 'Low Priority', color: '#4772fa' },
    { id: 'none', label: 'No Priority', color: '#aaaaaa' },
  ];

  /**
   * Get the color for the currently selected priority
   */
  const getPriorityColor = () => {
    const priority = priorities.find(p => p.id === selectedPriority);
    return priority ? priority.color : '#aaaaaa';
  };

  /**
   * Handle folder selection and show notification if folder changed
   */
  const handleFolderSelection = (folderId: string) => {
    setSelectedFolder(folderId);
    
    // Show notification if folder changed from current folder
    if (folderId !== currentFolder) {
      const folderData = folders.find(f => f.id === folderId);
      if (folderData) {
        setMovedToFolder(folderData.name);
        setShowMoveNotification(true);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setShowMoveNotification(false);
        }, 3000);
      }
    }
  };

  /**
   * Handle modal open/close state changes and animations
   */
  useEffect(() => {
    if (visible) {
      // Slide up animation when modal opens
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
      // Reset folder selection to current folder when opening
      setSelectedFolder(currentFolder);
    } else {
      // Reset animation and all states when modal closes
      slideAnim.setValue(0);
      setShowDateRepeat(false);
      setShowPriorityDropdown(false);
      setShowFolderDropdown(false);
      setSelectedPriority('none');
      setSelectedFolder(currentFolder);
      setTitle('');
      setDescription('');
      setShowMoveNotification(false);
    }
  }, [visible, currentFolder]);

  /**
   * Save the task if title is provided
   */
  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim(), description.trim(), selectedPriority, selectedFolder);
      setTitle('');
      setDescription('');
      onClose();
    }
  };

  /**
   * Handle modal close with slide down animation and auto-save
   */
  const handleClose = () => {
    // Slide down animation before closing
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      // Auto-save if there's content
      if (title.trim()) {
        onSave(title.trim(), description.trim(), selectedPriority, selectedFolder);
      }
      setShowPriorityDropdown(false);
      setSelectedPriority('none');
      setTitle('');
      setDescription('');
      onClose();
    });
  };

  // Animation interpolation for slide effect
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0], // Start 500px below, slide to 0
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      key={visible ? 'modal-open' : 'modal-closed'}
    >
      {/* Dark overlay background */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={handleClose}
      >
        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]}>
          <TouchableOpacity style={styles.bottomSheetContainer} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <SafeAreaView style={styles.container}>
              <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              >
                <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                  <View style={styles.content}>
                    {/* Task title input */}
                    <TextInput
                      style={styles.titleInput}
                      placeholder="Make figma design for project"
                      value={title}
                      onChangeText={setTitle}
                      multiline
                      autoFocus
                      placeholderTextColor="#A0A0A0"
                      autoCorrect={false}
                      spellCheck={false}
                      autoComplete="off"
                    />

                    {/* Task description input */}
                    <TextInput
                      style={styles.descriptionInput}
                      placeholder="Description"
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      placeholderTextColor="#a6a6a6"
                      autoCorrect={false}
                      spellCheck={false}
                      autoComplete="off"
                    />

                    {/* Action buttons row */}
                    <View style={styles.topActions}>
                      <View style={styles.leftIcons}>
                        {/* Priority selection button */}
                        <View style={styles.priorityContainer}>
                          <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
                          >
                            <Flag2Icon 
                              size={22} 
                              color={getPriorityColor()} 
                            />
                          </TouchableOpacity>
                        </View>
                        
                        {/* Folder selection button */}
                        <View style={styles.folderContainer}>
                          <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => setShowFolderDropdown(!showFolderDropdown)}
                          >
                            <MaterialIcons name="folder-open" size={22} color="#aaaaaa" />
                          </TouchableOpacity>
                        </View>
                        
                        {/* Full-screen editor button */}
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => setShowDateRepeat(true)}
                        >
                          <PanZoomIcon size={22} color="#aaaaaa" />
                        </TouchableOpacity>
                      </View>
                      
                      {/* Save button */}
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={handleSave}
                      >
                        <MaterialIcons name="arrow-upward" size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.bottomSpacer} />
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>

      {/* Priority selection dropdown */}
      <PriorityDropdown
        visible={showPriorityDropdown}
        selectedPriority={selectedPriority}
        priorities={priorities}
        onSelectPriority={setSelectedPriority}
        onClose={() => setShowPriorityDropdown(false)}
        style="modal"
      />

      {/* Folder selection dropdown */}
      <FolderDropdown
        visible={showFolderDropdown}
        selectedFolder={selectedFolder}
        folders={folders}
        onSelectFolder={handleFolderSelection}
        onClose={() => setShowFolderDropdown(false)}
        style="modal"
      />

      {/* Move notification popup */}
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

      {/* Full-screen task editor */}
      {showDateRepeat && (
        <FullScreenTaskEditor
          visible={showDateRepeat}
          onClose={() => {
            setShowDateRepeat(false);
            // Reset states and close modal completely
            setTitle('');
            setDescription('');
            slideAnim.setValue(0);
            onClose();
          }}
          initialTitle={title}
          initialDescription={description}
          initialPriority={selectedPriority}
          currentFolder={currentFolder}
          onSave={(newTitle: string, newDescription: string) => {
            // Close modal after saving from full-screen editor
            setShowDateRepeat(false);
            setTitle('');
            setDescription('');
            slideAnim.setValue(0);
            onClose();
          }}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    height: '49%',
    backgroundColor: 'transparent',
    borderTopRightRadius: 12,
  },
  bottomSheetContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flex: 1,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 0,
    marginLeft: -12,
    marginRight: -12,
  },
  leftIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleInput: {
    fontSize: 17,
    color: '#333333',
    paddingVertical: 4,
    paddingHorizontal: 0,
    marginBottom: 0,
    minHeight: 40,
  },
  descriptionInput: {
    fontSize: 13.5,
    color: '#333333',
    paddingVertical: 2,
    paddingHorizontal: 0,
    minHeight: 40,
  },

  actionButton: {
    padding: 12,
    marginRight: 2,
  },
  saveButton: {
    backgroundColor: '#4772fa',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    marginRight: 0,
  },
  bottomSpacer: {
    height: 10,
  },
  priorityContainer: {
    position: 'relative',
  },
  folderContainer: {
    position: 'relative',
  },
  moveNotificationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60, // Distance from the top of the screen
    pointerEvents: 'none', // Allow touches to pass through
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
}); 