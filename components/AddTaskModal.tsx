import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
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

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      onClose();
    }
  };

  const handleClose = () => {
    // Auto-save if there's content
    if (title.trim()) {
      onSave(title.trim(), description.trim());
    }
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      {/* Dark overlay */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={handleClose}
      >
        <View style={styles.bottomSheet}>
                    <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
              style={styles.container} 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer}>
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
                    placeholderTextColor="#A0A0A0"
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
                    </View>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => setShowDateRepeat(true)}
                    >
                      <PanZoomIcon size={22} color="#aaaaaa" />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Bottom Spacer */}
                  <View style={styles.bottomSpacer} />
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </TouchableOpacity>

      {/* Full Screen Task Editor */}
      <FullScreenTaskEditor
        visible={showDateRepeat}
        onClose={() => setShowDateRepeat(false)}
        initialTitle={title}
        initialDescription={description}
        onSave={(newTitle: string, newDescription: string) => {
          setTitle(newTitle);
          setDescription(newDescription);
          setShowDateRepeat(false);
        }}
      />
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
    height: '52%',
    backgroundColor: 'transparent',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
    borderRadius: 12,
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
    color: '#a6a6a6',
    paddingVertical: 4,
    paddingHorizontal: 0,
    marginBottom: 0,
    minHeight: 40,
  },
  descriptionInput: {
    fontSize: 13.5,
    color: '#f0f0f0',
    paddingVertical: 2,
    paddingHorizontal: 0,
    minHeight: 40,
  },

  actionButton: {
    padding: 12,
    marginRight: 2,
  },
  bottomSpacer: {
    height: 10,
  },
}); 