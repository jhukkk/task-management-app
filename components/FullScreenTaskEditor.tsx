import { useTask } from '@/context/TaskContext';
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
import Flag2Icon from './Flag2Icon';

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
  const [checkItems, setCheckItems] = useState<string[]>([]);
  const [focusedInputRef, setFocusedInputRef] = useState<any>(null);
  const checkItemRefs = useState<any[]>([])[0];
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('Inbox');
  const { addTask } = useTask();

  // Mock folder data - in a real app this would come from context/storage
  const folders = [
    { id: 'inbox', name: 'Inbox', icon: 'inbox' },
    { id: 'work', name: 'Work', icon: 'work' },
    { id: 'personal', name: 'Personal', icon: 'person' },
    { id: 'shopping', name: 'Shopping', icon: 'shopping-cart' },
  ];

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
  }, [initialTitle, initialDescription]);

  const handleClose = () => {
    // Save content directly to TaskContext if there's any content
    if (title.trim() || checkItems.some(item => item.trim())) {
      // If there's a title and no checkboxes, create a task from the title
      if (checkItems.length === 0 && title.trim()) {
        addTask(title.trim(), description.trim(), new Date());
      } else {
        // Save checkboxes as individual tasks
        checkItems.forEach(item => {
          if (item.trim()) {
            addTask(item.trim(), description.trim(), new Date());
          }
        });
      }
    }
    
    // Reset states
    setTitle('');
    setDescription('');
    setCheckItems([]);
    
    // Close modal
    onClose();
  };

  const addCheckItem = () => {
    const newIndex = checkItems.length;
    setCheckItems([...checkItems, '']);
    // Focus on the newly created input
    setTimeout(() => {
      if (checkItemRefs[newIndex]) {
        checkItemRefs[newIndex].focus();
      }
    }, 100);
  };

  const deleteCheckItem = (index: number) => {
    const newItems = checkItems.filter((_, i) => i !== index);
    setCheckItems(newItems);
    // Focus on the previous item or description if first item
    setTimeout(() => {
      if (index > 0 && checkItemRefs[index - 1]) {
        // Focus on previous checkbox
        checkItemRefs[index - 1].focus();
      } else if (focusedInputRef) {
        // If deleting first item, go back to description
        focusedInputRef.focus();
      }
    }, 100);
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
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{selectedFolder}</Text>
              <TouchableOpacity 
                style={styles.expandButton}
                onPress={() => setShowFolderDropdown(!showFolderDropdown)}
              >
                <MaterialIcons 
                  name={showFolderDropdown ? "expand-less" : "expand-more"} 
                  size={20} 
                  color="#666666" 
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.moreButton}>
              <MaterialIcons name="more-horiz" size={24} color="#333333" />
            </TouchableOpacity>
          </View>

          {/* Folder Dropdown */}
          {showFolderDropdown && (
            <View style={styles.folderDropdown}>
              {folders.map((folder) => (
                <TouchableOpacity
                  key={folder.id}
                  style={[
                    styles.folderItem,
                    selectedFolder === folder.name && styles.selectedFolderItem
                  ]}
                  onPress={() => {
                    setSelectedFolder(folder.name);
                    setShowFolderDropdown(false);
                  }}
                >
                                     <MaterialIcons 
                     name={folder.icon as any} 
                     size={20} 
                     color={selectedFolder === folder.name ? "#4772fa" : "#666666"} 
                   />
                  <Text style={[
                    styles.folderItemText,
                    selectedFolder === folder.name && styles.selectedFolderItemText
                  ]}>
                    {folder.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Date & Repeat Section */}
          <View style={styles.dateRepeatSection}>
            <View style={styles.leftIconsSection}>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="check-box-outline-blank" size={22} color="#aaaaaa" />
              </TouchableOpacity>
            </View>
            <Text style={styles.dateRepeatText}>Date & Repeat</Text>
            <TouchableOpacity style={styles.iconButton}>
              <Flag2Icon size={22} color="#aaaaaa" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
            {/* Task Title Input */}
            <TextInput
              style={styles.titleInput}
              placeholder="What would you like to do?"
              placeholderTextColor="#a6a6a6"
              value={title}
              onChangeText={setTitle}
              multiline
              autoFocus
            />

            {/* Description Input */}
            <TextInput
              ref={(ref) => setFocusedInputRef(ref)}
              style={styles.descriptionInput}
              placeholder="Description"
              placeholderTextColor="#a6a6a6"
              value={description}
              onChangeText={setDescription}
              multiline
              onSubmitEditing={addCheckItem}
              onFocus={(e) => setFocusedInputRef(e.target)}
            />

            {/* Check Items */}
            {checkItems.map((item, index) => (
              <View key={index} style={styles.checkItemContainer}>
                <TouchableOpacity style={styles.checkbox}>
                  <MaterialIcons name="check-box-outline-blank" size={20} color="#cccccc" />
                </TouchableOpacity>
                <TextInput
                  ref={(ref) => { checkItemRefs[index] = ref; }}
                  style={styles.checkItemInput}
                  placeholder="Check item"
                  placeholderTextColor="#cccccc"
                  value={item}
                  onChangeText={(text) => {
                    const newItems = [...checkItems];
                    newItems[index] = text;
                    setCheckItems(newItems);
                  }}
                  onSubmitEditing={addCheckItem}
                  onFocus={(e) => setFocusedInputRef(e.target)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace' && item === '') {
                      deleteCheckItem(index);
                    }
                  }}
                />
              </View>
            ))}


          </ScrollView>

          {/* Bottom Toolbar */}
          <View style={styles.bottomToolbar}>
            <TouchableOpacity style={styles.toolbarButton}>
              <MaterialIcons name="menu" size={24} color="#aaaaaa" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#aaaaaa" />
            </TouchableOpacity>
          </View>
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
  dateRepeatSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  leftIconsSection: {
    width: 40,
  },
  iconButton: {
    padding: 8,
  },
  dateRepeatText: {
    fontSize: 16,
    color: '#cccccc',
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingLeft: 28,
    paddingRight: 20,
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
  },
  titleInput: {
    fontSize: 20,
    color: '#333333',
    marginBottom: 4,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  descriptionInput: {
    fontSize: 18,
    color: '#333333',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 2,
  },
  checkItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    marginRight: 12,
  },
  checkItemInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    minHeight: 30,
  },

  bottomToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  toolbarButton: {
    padding: 8,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButton: {
    marginLeft: 4,
    padding: 4,
  },
  folderDropdown: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 8,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  selectedFolderItem: {
    backgroundColor: '#f0f4ff',
  },
  folderItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666666',
  },
  selectedFolderItemText: {
    color: '#4772fa',
    fontWeight: '500',
  },
}); 