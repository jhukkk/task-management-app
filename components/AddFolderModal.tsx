import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Keyboard,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface AddFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function AddFolderModal({ visible, onClose, onSave }: AddFolderModalProps) {
  const [folderName, setFolderName] = useState('');

  const handleSave = () => {
    if (folderName.trim()) {
      onSave(folderName.trim());
      setFolderName('');
      onClose();
    }
  };

  const handleClose = () => {
    setFolderName('');
    onClose();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>New Folder</Text>
              <TouchableOpacity 
                style={[styles.saveButton, !folderName.trim() && styles.saveButtonDisabled]} 
                onPress={handleSave}
                activeOpacity={0.7}
                disabled={!folderName.trim()}
              >
                <Text style={[styles.saveButtonText, !folderName.trim() && styles.saveButtonTextDisabled]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.inputContainer}>
                <MaterialIcons name="folder" size={24} color="#4772fa" style={styles.folderIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Folder name"
                  placeholderTextColor="#999"
                  value={folderName}
                  onChangeText={setFolderName}
                  autoFocus={true}
                  maxLength={30}
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
              </View>
              
              <Text style={styles.helperText}>
                Enter a name for your new folder. You can organize your tasks by creating custom folders.
              </Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#4772fa',
  },
  saveButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
  content: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  folderIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    lineHeight: 20,
  },
}); 