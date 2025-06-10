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
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import CalendarIcon from './CalendarIcon';
import Flag2Icon from './Flag2Icon';
import FullScreenTaskEditor from './FullScreenTaskEditor';
import PanZoomIcon from './PanZoomIcon';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
}

export default function AddTaskModal({ visible, onClose, onSave }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDateRepeat, setShowDateRepeat] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Slide up animation when modal opens
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      // Reset animation and all states when modal closes
      slideAnim.setValue(0);
      setShowDateRepeat(false);
      setTitle('');
      setDescription('');
    }
  }, [visible]);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      onClose();
    }
  };

  const handleClose = () => {
    // Slide down animation before closing
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      // Auto-save if there's content
      if (title.trim()) {
        onSave(title.trim(), description.trim());
      }
      setTitle('');
      setDescription('');
      onClose();
    });
  };

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
      {/* Dark overlay */}
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
                  {/* Content */}
                  <View style={styles.content}>
                    {/* Task Title Input */}
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

                    {/* Description Input */}
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

                    {/* Action Icons */}
                    <View style={styles.topActions}>
                      <View style={styles.leftIcons}>
                        <TouchableOpacity style={styles.actionButton}>
                          <CalendarIcon size={22} color="#aaaaaa" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                          <Flag2Icon size={22} color="#aaaaaa" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                          <MaterialIcons name="folder-open" size={22} color="#aaaaaa" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => setShowDateRepeat(true)}
                        >
                          <PanZoomIcon size={22} color="#aaaaaa" />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={handleSave}
                      >
                        <MaterialIcons name="arrow-upward" size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                    
                    {/* Bottom Spacer */}
                    <View style={styles.bottomSpacer} />
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>

      {/* Full Screen Task Editor */}
      {showDateRepeat && (
        <FullScreenTaskEditor
          visible={showDateRepeat}
          onClose={() => {
            setShowDateRepeat(false);
            // Reset states and close immediately
            setTitle('');
            setDescription('');
            slideAnim.setValue(0);
            // Close the entire modal flow when exiting full screen
            onClose();
          }}
          initialTitle={title}
          initialDescription={description}
          onSave={(newTitle: string, newDescription: string) => {
            // This callback won't be used since FullScreenTaskEditor handles saving directly
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
    fontSize: 15,
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
}); 