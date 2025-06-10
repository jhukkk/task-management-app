import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Folder interface definition
export interface Folder {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Context type definition
interface FolderContextType {
  folders: Folder[];
  addFolder: (name: string) => string;
  deleteFolder: (id: string, onTasksNeedReassignment?: (folderId: string) => void) => void;
  getFolderById: (id: string) => Folder | undefined;
}

// Default folders that come with the app
const defaultFolders: Folder[] = [
  { id: 'inbox', name: 'Inbox', icon: 'inbox', color: '#4772fa' },
  { id: 'personal', name: 'Personal', icon: 'person', color: '#FF6B6B' },
  { id: 'work', name: 'Work', icon: 'work', color: '#4ECDC4' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-cart', color: '#45B7D1' },
  { id: 'health', name: 'Health & Fitness', icon: 'fitness-center', color: '#96CEB4' },
  { id: 'finance', name: 'Finance', icon: 'attach-money', color: '#FFEAA7' },
];

const FolderContext = createContext<FolderContextType | undefined>(undefined);

/**
 * Folder provider component that manages global folder state and persistence
 */
export const FolderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>(defaultFolders);

  // Load folders from AsyncStorage on app start
  useEffect(() => {
    loadFolders();
  }, []);

  // Save folders to AsyncStorage whenever folders change
  useEffect(() => {
    saveFolders();
  }, [folders]);

  /**
   * Load folders from local storage
   */
  const loadFolders = async () => {
    try {
      const foldersJson = await AsyncStorage.getItem('folders');
      if (foldersJson) {
        const storedFolders = JSON.parse(foldersJson);
        setFolders(storedFolders);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  /**
   * Save folders to local storage
   */
  const saveFolders = async () => {
    try {
      await AsyncStorage.setItem('folders', JSON.stringify(folders));
    } catch (error) {
      console.error('Error saving folders:', error);
    }
  };

  /**
   * Add a new folder with random icon and color
   * @param name - The name of the new folder
   * @returns The ID of the newly created folder
   */
  const addFolder = (name: string): string => {
    const id = `folder_${Date.now()}`;
    
    // Available icons and colors for new folders
    const availableIcons = ['folder', 'work', 'person', 'school', 'home', 'business', 'favorite', 'star'];
    const availableColors = ['#4772fa', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#F4A460'];
    
    // Select random icon and color for visual variety
    const randomIcon = availableIcons[Math.floor(Math.random() * availableIcons.length)];
    const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    
    const newFolder: Folder = {
      id,
      name,
      icon: randomIcon,
      color: randomColor,
    };

    setFolders(prevFolders => [...prevFolders, newFolder]);
    return id;
  };

  /**
   * Delete a folder (prevents deletion of default folders)
   * @param id - The ID of the folder to delete
   * @param onTasksNeedReassignment - Callback to handle tasks that need to be moved
   */
  const deleteFolder = (id: string, onTasksNeedReassignment?: (folderId: string) => void) => {
    // Protect default folders from deletion
    const protectedFolders = ['inbox', 'personal', 'work', 'shopping', 'health', 'finance'];
    if (protectedFolders.includes(id)) {
      return;
    }

    // Notify that tasks need to be reassigned before deleting folder
    if (onTasksNeedReassignment) {
      onTasksNeedReassignment(id);
    }
    
    setFolders(prevFolders => prevFolders.filter(folder => folder.id !== id));
  };

  /**
   * Find folder by ID
   * @param id - The ID of the folder to find
   * @returns The folder object or undefined if not found
   */
  const getFolderById = (id: string) => {
    return folders.find(folder => folder.id === id);
  };

  return (
    <FolderContext.Provider
      value={{
        folders,
        addFolder,
        deleteFolder,
        getFolderById,
      }}
    >
      {children}
    </FolderContext.Provider>
  );
};

/**
 * Hook to access folder context. Must be used within FolderProvider.
 */
export const useFolder = () => {
  const context = useContext(FolderContext);
  if (context === undefined) {
    throw new Error('useFolder must be used within a FolderProvider');
  }
  return context;
}; 