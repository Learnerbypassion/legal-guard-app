import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import { GlobalDataStore } from '../../src/services/dataStore';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    color: '#64748b',
    marginBottom: 24,
    fontSize: 14,
  },
  filePicker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  filePickerDefault: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
  },
  filePickerActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#60a5fa',
  },
  fileIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  fileSize: {
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
  },
  removeButton: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#fee2e2',
    borderRadius: 999,
  },
  removeButtonText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  optionButtonInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
  },
  optionButtonText: {
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: '#ffffff',
  },
  optionButtonTextInactive: {
    color: '#475569',
  },
  infoBox: {
    backgroundColor: '#f3e8ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  infoDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#a855f7',
  },
  infoText: {
    color: '#475569',
    fontSize: 13,
  },
  analyzeButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  analyzeButtonActive: {
    backgroundColor: '#2563eb',
  },
  analyzeButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  loadingContainer: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontWeight: '500',
    marginTop: 8,
  },
  sourceSelector: {
    marginBottom: 24,
  },
  sourceSelectorLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  sourceButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  sourceButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
  },
  sourceButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#60a5fa',
  },
  sourceButtonIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  sourceButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  sourceButtonTextActive: {
    color: '#2563eb',
  },
});

export default function UploadScreen() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [language, setLanguage] = useState('English');
  const [userType, setUserType] = useState('consumer');
  const [fileSource, setFileSource] = useState<'document' | 'camera' | 'photos' | null>(null);
  const router = useRouter();
  const { token } = useAuth();

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
        setFileSource('document');
      }
    } catch (error) {
      console.log('Error picking document:', error);
    }
  };

  const captureDocument = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera Permission', 'Camera access is required to capture documents');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setFile({
          uri: image.uri,
          name: image.fileName || `document_${Date.now()}.jpg`,
          size: image.fileSize || 0,
          mimeType: 'image/jpeg',
          lastModified: Date.now(),
        } as DocumentPicker.DocumentPickerAsset);
        setFileSource('camera');
      }
    } catch (error) {
      console.log('Error capturing document:', error);
      Alert.alert('Error', 'Failed to capture document');
    }
  };

  const pickFromPhotoLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Photo Library Permission', 'Photo library access is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setFile({
          uri: image.uri,
          name: image.fileName || `document_${Date.now()}.jpg`,
          size: image.fileSize || 0,
          mimeType: 'image/jpeg',
          lastModified: Date.now(),
        } as DocumentPicker.DocumentPickerAsset);
        setFileSource('photos');
      }
    } catch (error) {
      console.log('Error picking from photo library:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    try {
      setLoading(true);
      setStatus('Uploading ' + (fileSource === 'document' ? 'document' : 'image') + '...');

      const formData = new FormData();
      
      // Use appropriate field name based on source
      const fieldName = fileSource === 'document' ? 'contract' : 'image';
      formData.append(fieldName, {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || (fileSource === 'document' ? 'application/pdf' : 'image/jpeg'),
      } as any);
      formData.append('language', language);
      formData.append('userType', userType || '');
      formData.append('fileSource', fileSource || '');

      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (uploadRes.data.success) {
        setStatus('Analyzing with AI...');
        
        // Handle both PDF text and image URL
        const analyzePayload: any = {
          filename: uploadRes.data.filename || file.name,
          userType,
          language,
        };

        if (fileSource === 'document') {
          analyzePayload.contractText = uploadRes.data.contractText;
          analyzePayload.charCount = uploadRes.data.charCount;
        } else {
          // For images, send the ImageKit URL
          analyzePayload.imageUrl = uploadRes.data.imageUrl;
          analyzePayload.isImage = true;
        }

        const analyzeRes = await api.post('/ai/analyze', analyzePayload);
        const analysisData = analyzeRes.data;

        if (analysisData && (analysisData.riskScore || analysisData.summary)) {
          GlobalDataStore.currentAnalysis = analysisData;
          GlobalDataStore.currentContractText = uploadRes.data.contractText || uploadRes.data.imageUrl || '';
          router.push({
            pathname: '/result',
            params: {
              fileName: uploadRes.data.filename || file.name,
            },
          });
        } else {
          Alert.alert('Error', 'Analysis failed. Please try again.');
        }
      } else {
        Alert.alert('Error', uploadRes.data.error || 'Upload failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Analysis failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Analyze Document</Text>
      <Text style={styles.subtitle}>Upload a legal document or capture using camera</Text>

      {/* File Source Selector */}
      <View style={styles.sourceSelector}>
        <Text style={styles.sourceSelectorLabel}>Select Source</Text>
        <View style={styles.sourceButtons}>
          <TouchableOpacity
            style={[styles.sourceButton, fileSource === 'camera' && styles.sourceButtonActive]}
            onPress={captureDocument}
            disabled={loading}
          >
            <Ionicons name="camera-outline" size={24} color={fileSource === 'camera' ? '#2563eb' : '#475569'} style={{ marginBottom: 6 }} />
            <Text style={[styles.sourceButtonText, fileSource === 'camera' && styles.sourceButtonTextActive]}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sourceButton, fileSource === 'photos' && styles.sourceButtonActive]}
            onPress={pickFromPhotoLibrary}
            disabled={loading}
          >
            <Ionicons name="image-outline" size={24} color={fileSource === 'photos' ? '#2563eb' : '#475569'} style={{ marginBottom: 6 }} />
            <Text style={[styles.sourceButtonText, fileSource === 'photos' && styles.sourceButtonTextActive]}>Photos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sourceButton, fileSource === 'document' && styles.sourceButtonActive]}
            onPress={pickDocument}
            disabled={loading}
          >
            <Ionicons name="document-text-outline" size={24} color={fileSource === 'document' ? '#2563eb' : '#475569'} style={{ marginBottom: 6 }} />
            <Text style={[styles.sourceButtonText, fileSource === 'document' && styles.sourceButtonTextActive]}>Document</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* File Display */}
      {file && (
        <View style={[styles.filePicker, styles.filePickerActive]}>
          <Ionicons 
            name={fileSource === 'document' ? 'checkmark-circle-outline' : 'image-outline'} 
            size={48} 
            color="#2563eb" 
            style={{ marginBottom: 12 }} 
          />
          <Text style={styles.fileName}>{file.name}</Text>
          <Text style={styles.fileSize}>
            {file.size ? `${((file.size ?? 0) / 1024 / 1024).toFixed(2)} MB` : 'Ready'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setFile(null);
              setFileSource(null);
            }}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Language */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Language</Text>
        <View style={[styles.optionRow, { flexWrap: 'wrap' }]}>
          {['English', 'Hindi', 'Bengali'].map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => setLanguage(lang)}
              disabled={loading}
              style={[
                styles.optionButton,
                { flex: 0.32 },
                language === lang ? styles.optionButtonActive : styles.optionButtonInactive,
              ]}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  language === lang ? styles.optionButtonTextActive : styles.optionButtonTextInactive,
                ]}
              >
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* User Type */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>I am a</Text>
        <View style={styles.optionRow}>
          {['consumer', 'business'].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setUserType(type)}
              disabled={loading}
              style={[
                styles.optionButton,
                userType === type ? styles.optionButtonActive : styles.optionButtonInactive,
              ]}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  userType === type ? styles.optionButtonTextActive : styles.optionButtonTextInactive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Supported Formats Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Supported Formats</Text>
        <View style={styles.infoGrid}>
          {['PDF Files', 'Documents (.docx)', 'Photos (JPG, PNG)', 'Camera Capture'].map((f) => (
            <View key={f} style={styles.infoItem}>
              <View style={styles.infoDot} />
              <Text style={styles.infoText}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Analyze Button */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="white" />
          <Text style={styles.loadingText}>{status || 'Processing...'}</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.analyzeButton, file ? styles.analyzeButtonActive : styles.analyzeButtonDisabled]}
          onPress={handleUpload}
          disabled={!file}
        >
          <Text style={styles.analyzeButtonText}>Start Analysis</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
