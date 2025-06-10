import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface Folder {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface FolderDropdownProps {
  visible: boolean;
  selectedFolder: string;
  folders: Folder[];
  onSelectFolder: (folderId: string) => void;
  onClose: () => void;
  style?: 'modal' | 'positioned';
  overlayStyle?: object;
  showCheckIcon?: boolean;
}

export default function FolderDropdown({ 
  visible, 
  selectedFolder, 
  folders, 
  onSelectFolder, 
  onClose,
  style = 'modal',
  overlayStyle = {},
  showCheckIcon = false
}: FolderDropdownProps) {
  const handleSelectFolder = (folderId: string) => {
    onSelectFolder(folderId);
    onClose();
  };

  // Calculate if scrolling is needed (more than 5 folders)
  const needsScrolling = folders.length > 5;
  const maxHeight = needsScrolling ? 290 : undefined; // Approximately 5 items * 58px per item

  const renderFolderItems = () => (
    folders.map((folder, index) => (
      <TouchableOpacity
        key={folder.id}
        style={[
          styles.folderItem,
          !needsScrolling && index === 0 && styles.firstFolderItem,
          !needsScrolling && index === folders.length - 1 && styles.lastFolderItem,
        ]}
        onPress={() => handleSelectFolder(folder.id)}
        activeOpacity={0.7}
      >
        <MaterialIcons name={folder.icon as any} size={22} color="#333333" />
        <Text style={[
          styles.folderText,
          !showCheckIcon && selectedFolder === folder.id && { color: '#4772fa', fontWeight: '500' }
        ]}>
          {folder.name}
        </Text>
        {showCheckIcon && selectedFolder === folder.id && (
          <MaterialIcons name="check" size={20} color="#4772fa" style={styles.checkIcon} />
        )}
      </TouchableOpacity>
    ))
  );

  if (style === 'positioned') {
    // For use within existing modals (like FullScreenTaskEditor)
    return visible ? (
      <View style={[styles.folderOverlay, overlayStyle]}>
        <TouchableOpacity 
          style={styles.folderBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.folderDropdown, needsScrolling && { maxHeight }]}>
          {needsScrolling ? (
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {renderFolderItems()}
            </ScrollView>
          ) : (
            renderFolderItems()
          )}
        </View>
      </View>
    ) : null;
  }

  // For standalone modal use (like AddTaskModal)
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <TouchableOpacity 
        style={[styles.folderModalOverlay, overlayStyle]}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.folderDropdownModal, needsScrolling && { maxHeight }]}>
          {needsScrolling ? (
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {renderFolderItems()}
            </ScrollView>
          ) : (
            renderFolderItems()
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  folderModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.025)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 280,
    paddingLeft: 48, // Positioned above the folder icon (after flag icon)
  },
  folderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.015)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 160,
    paddingRight: 20,
    zIndex: 1000,
  },
  folderBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  folderDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 220,
    maxWidth: 300,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  folderDropdownModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 220,
    maxWidth: 300,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  scrollView: {
    flexGrow: 1,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  firstFolderItem: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastFolderItem: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  folderText: {
    marginLeft: 12,
    fontSize: 17,
    color: '#333333',
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
}); 