import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Flag2Icon from './Flag2Icon';

interface Priority {
  id: string;
  label: string;
  color: string;
}

interface PriorityDropdownProps {
  visible: boolean;
  selectedPriority: string;
  priorities: Priority[];
  onSelectPriority: (priorityId: string) => void;
  onClose: () => void;
  style?: 'modal' | 'positioned';
  overlayStyle?: object;
  showCheckIcon?: boolean;
}

export default function PriorityDropdown({ 
  visible, 
  selectedPriority, 
  priorities, 
  onSelectPriority, 
  onClose,
  style = 'modal',
  overlayStyle = {},
  showCheckIcon = false
}: PriorityDropdownProps) {
  const handleSelectPriority = (priorityId: string) => {
    onSelectPriority(priorityId);
    onClose();
  };

  if (style === 'positioned') {
    // For use within existing modals (like FullScreenTaskEditor)
    return visible ? (
      <View style={[styles.priorityOverlay, overlayStyle]}>
        <TouchableOpacity 
          style={styles.priorityBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.priorityDropdown}>
          {priorities.map((priority, index) => (
            <TouchableOpacity
              key={priority.id}
              style={[
                styles.priorityItem,
                index === 0 && styles.firstPriorityItem,
                index === priorities.length - 1 && styles.lastPriorityItem,
              ]}
              onPress={() => handleSelectPriority(priority.id)}
              activeOpacity={0.7}
            >
              <Flag2Icon size={22} color={priority.color} filled={showCheckIcon && priority.id !== 'none'} />
              <Text style={styles.priorityText}>
                {priority.label}
              </Text>
              {showCheckIcon && selectedPriority === priority.id && (
                <MaterialIcons name="check" size={20} color="#4772fa" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
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
        style={[styles.priorityModalOverlay, overlayStyle]}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.priorityDropdownModal}>
          {priorities.map((priority, index) => (
            <TouchableOpacity
              key={priority.id}
              style={[
                styles.priorityItem,
                index === 0 && styles.firstPriorityItem,
                index === priorities.length - 1 && styles.lastPriorityItem,
              ]}
              onPress={() => handleSelectPriority(priority.id)}
              activeOpacity={0.7}
            >
              <Flag2Icon size={22} color={priority.color} filled={showCheckIcon && priority.id !== 'none'} />
              <Text style={[
                styles.priorityText,
                !showCheckIcon && selectedPriority === priority.id && { color: priority.color, fontWeight: 'normal' }
              ]}>
                {priority.label}
              </Text>
              {showCheckIcon && selectedPriority === priority.id && (
                <MaterialIcons name="check" size={20} color="#4772fa" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  priorityModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.025)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 380,
    paddingLeft: 0,
  },
  priorityOverlay: {
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
  priorityBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  priorityDropdown: {
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
  priorityDropdownModal: {
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
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  firstPriorityItem: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastPriorityItem: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  priorityText: {
    marginLeft: 12,
    fontSize: 17,
    color: '#333333',
    flex: 1,
  },
  selectedPriorityText: {
    color: '#4772fa',
    fontWeight: 'normal',
  },
  checkIcon: {
    marginLeft: 8,
  },
}); 