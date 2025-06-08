import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
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

interface FullScreenTaskEditorProps {
  visible: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialDescription?: string;
  onSave: (title: string, description: string) => void;
}

export default function FullScreenTaskEditor({ 
  visible, 
  onClose, 
  initialTitle = '', 
  initialDescription = '',
  onSave 
}: FullScreenTaskEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
  }, [initialTitle, initialDescription]);

  const handleClose = () => {
    // Auto-save if there's content
    if (title.trim()) {
      onSave(title.trim(), description.trim());
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Inbox</Text>
            <TouchableOpacity style={styles.moreButton}>
              <MaterialIcons name="more-horiz" size={24} color="#333333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Task Title Input */}
            <TextInput
              style={styles.titleInput}
              placeholder="What would you like to do?"
              placeholderTextColor="#cccccc"
              value={title}
              onChangeText={setTitle}
              multiline
              autoFocus
            />

            {/* Description Input */}
            <TextInput
              style={styles.descriptionInput}
              placeholder="Description"
              placeholderTextColor="#cccccc"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666666',
  },
  moreButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
  },
  titleInput: {
    fontSize: 20,
    color: '#a6a6a6',
    marginBottom: 32,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  descriptionInput: {
    fontSize: 18,
    color: '#f0f0f0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
}); 