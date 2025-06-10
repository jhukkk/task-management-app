import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface DeleteFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  folderName: string;
  taskCount: number;
}

/**
 * Elegant minimalist confirmation modal for folder deletion
 */
export default function DeleteFolderModal({ 
  visible, 
  onClose, 
  onConfirm, 
  folderName, 
  taskCount 
}: DeleteFolderModalProps) {
  
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.question}>
            Delete &ldquo;{folderName}&rdquo;?
          </Text>
          
          {taskCount > 0 && (
            <Text style={styles.subtitle}>
              {taskCount} task{taskCount > 1 ? 's' : ''} will move to Inbox
            </Text>
          )}

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.deleteButton]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 28,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  question: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#777777',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
  },
  cancelText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: 'normal',
  },
  deleteText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'normal',
  },
}); 